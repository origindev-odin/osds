import { sql } from "@osds/db";
import type { EntitlementStatus } from "@osds/core";
import { getDb } from "./db";

interface ListingRow {
  slug: string;
  name: string;
  locality: string | null;
  status: string | null;
  listing_tier: string | null;
  entitlement_status: EntitlementStatus | null;
  entitlement_tier: string | null;
  category_names: string[] | null;
}

export interface CategoryListing {
  readonly slug: string;
  readonly name: string;
  readonly locality: string | null;
  readonly listingStatus: string | null;
  readonly categories: readonly string[];
  /** For the §6.5 resolver; `none` when the listing has no entitlement row. */
  readonly entitlementStatus: EntitlementStatus;
  /** Tier name to show *if* the resolver says the badge is visible. */
  readonly tier: string | null;
}

export interface CategoryPage {
  readonly name: string;
  /** Every published listing in the category, ordered by name. Possibly empty. */
  readonly listings: readonly CategoryListing[];
}

export async function getCategoryPage(
  tenantId: string,
  categorySlug: string,
): Promise<CategoryPage | null> {
  return getDb()
    .transaction()
    .execute(async (trx) => {
      await sql`select set_config('app.tenant_id', ${tenantId}, true)`.execute(trx);

      const category = await sql<{ name: string }>`
        select name from categories where slug = ${categorySlug} limit 1
      `.execute(trx);

      const categoryRow = category.rows[0];
      if (categoryRow === undefined) return null;

      const { rows } = await sql<ListingRow>`
        select
          l.slug,
          l.name,
          l.locality,
          l.status,
          l.tier         as listing_tier,
          ent.status     as entitlement_status,
          ent.tier       as entitlement_tier,
          cats.names     as category_names
        from listings l
        join listing_categories lc
          on lc.tenant_id = l.tenant_id and lc.listing_id = l.id
        join categories c
          on c.tenant_id = lc.tenant_id
         and c.id = lc.category_id
         and c.slug = ${categorySlug}
        left join lateral (
          select array_agg(oc.name order by oc.name) as names
          from listing_categories x
          join categories oc
            on oc.tenant_id = x.tenant_id and oc.id = x.category_id
          where x.tenant_id = l.tenant_id and x.listing_id = l.id
        ) cats on true
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
        where l.visibility = 'published'
        order by l.name
      `.execute(trx);

      return {
        name: categoryRow.name,
        listings: rows.map((r) => ({
          slug: r.slug,
          name: r.name,
          locality: r.locality,
          listingStatus: r.status,
          categories: r.category_names ?? [],
          entitlementStatus: r.entitlement_status ?? "none",
          tier: r.entitlement_tier ?? r.listing_tier,
        })),
      };
    });
}
