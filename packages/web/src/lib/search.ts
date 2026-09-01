import { sql } from "@osds/db";
import type { EntitlementStatus } from "@osds/core";
import { getDb } from "./db";

interface SearchRow {
  slug: string;
  name: string;
  locality: string | null;
  status: string | null;
  listing_tier: string | null;
  entitlement_status: EntitlementStatus | null;
  entitlement_tier: string | null;
  category_names: string[] | null;
  category_slugs: string[] | null;
}

export interface SearchResult {
  readonly slug: string;
  readonly name: string;
  readonly locality: string | null;
  readonly listingStatus: string | null;
  readonly entitlementStatus: EntitlementStatus;
  readonly tier: string | null;
  readonly categories: readonly string[];
  readonly categorySlug: string | null;
}

export interface SearchParams {
  readonly q: string | null;
  readonly near: { readonly lat: number; readonly lon: number } | null;
  readonly radiusKm: number;
}

const MAX_RESULTS = 100;

export async function getSearchResults(
  tenantId: string,
  { q, near, radiusKm }: SearchParams,
): Promise<SearchResult[]> {
  const text = q !== null && q.trim() !== "" ? q.trim() : null;
  if (text === null && near === null) return [];

  const anchor =
    near !== null
      ? sql`st_setsrid(st_makepoint(${near.lon}, ${near.lat}), 4326)::geography`
      : sql`null::geography`;

  const conds = [sql`l.visibility = 'published'`];
  const orderTerms: ReturnType<typeof sql>[] = [];

  if (text !== null) {
    conds.push(sql`l.search_tsv @@ websearch_to_tsquery('simple', ${text})`);
    orderTerms.push(
      sql`ts_rank(l.search_tsv, websearch_to_tsquery('simple', ${text})) desc`,
    );
  }
  if (near !== null) {
    conds.push(
      sql`l.geog is not null and st_dwithin(l.geog, anchor.g, ${radiusKm * 1000})`,
    );
    orderTerms.push(sql`st_distance(l.geog, anchor.g) asc`);
  }
  orderTerms.push(sql`l.name asc`);

  const rows = await getDb()
    .transaction()
    .execute(async (trx) => {
      await sql`select set_config('app.tenant_id', ${tenantId}, true)`.execute(trx);

      const result = await sql<SearchRow>`
        with anchor as (select ${anchor} as g)
        select
          l.slug,
          l.name,
          l.locality,
          l.status,
          l.tier      as listing_tier,
          ent.status  as entitlement_status,
          ent.tier    as entitlement_tier,
          cats.names  as category_names,
          cats.slugs  as category_slugs
        from listings l
        cross join anchor
        left join lateral (
          select e.status, e.tier
          from entitlements e
          where e.tenant_id = l.tenant_id and e.listing_id = l.id
          order by
            case e.status
              when 'active'   then 0
              when 'trialing' then 1
              when 'past_due'  then 2
              when 'comped'   then 3
              when 'canceled' then 4
              when 'grace'    then 5
              when 'expired'  then 6
              else 7
            end,
            e.created_at desc
          limit 1
        ) ent on true
        left join lateral (
          select
            array_agg(c.name order by c.name) as names,
            array_agg(c.slug order by c.name) as slugs
          from listing_categories x
          join categories c
            on c.tenant_id = x.tenant_id and c.id = x.category_id
          where x.tenant_id = l.tenant_id and x.listing_id = l.id
        ) cats on true
        where ${sql.join(conds, sql` and `)}
        order by ${sql.join(orderTerms, sql`, `)}
        limit ${MAX_RESULTS}
      `.execute(trx);

      return result.rows;
    });

  return rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    locality: r.locality,
    listingStatus: r.status,
    entitlementStatus: r.entitlement_status ?? "none",
    tier: r.entitlement_tier ?? r.listing_tier,
    categories: r.category_names ?? [],
    categorySlug: r.category_slugs?.[0] ?? null,
  }));
}
