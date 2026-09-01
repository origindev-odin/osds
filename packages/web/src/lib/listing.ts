import { sql } from "@osds/db";
import type { EntitlementStatus } from "@osds/core";
import { getDb } from "./db";

interface ListingRow {
  name: string;
  slug: string;
  status: string | null;
  description: string | null;
  listing_tier: string | null;
  address_line1: string | null;
  address_line2: string | null;
  locality: string | null;
  region: string | null;
  postal_code: string | null;
  country: string | null;
  contact_phone_e164: string | null;
  contact_website: string | null;
  media: unknown;
  entitlement_status: EntitlementStatus | null;
  entitlement_tier: string | null;
  category_names: string[] | null;
}

export interface ListingMedia {
  readonly logo: string | null;
  readonly cover: string | null;
  readonly gallery: readonly string[];
}

export interface ListingView {
  readonly name: string;
  readonly slug: string;
  readonly listingStatus: string | null;
  readonly description: string | null;
  readonly categoryNames: readonly string[];
  readonly address: readonly string[];
  readonly locality: string | null;
  readonly phone: string | null;
  readonly website: string | null;
  readonly media: ListingMedia;
  readonly entitlementStatus: EntitlementStatus;
  readonly tier: string | null;
}

function parseMedia(raw: unknown): ListingMedia {
  if (raw === null || typeof raw !== "object") {
    return { logo: null, cover: null, gallery: [] };
  }
  const rec = raw as Record<string, unknown>;
  const gallery = Array.isArray(rec.gallery)
    ? rec.gallery.filter((item): item is string => typeof item === "string")
    : [];
  return {
    logo: typeof rec.logo === "string" ? rec.logo : null,
    cover: typeof rec.cover === "string" ? rec.cover : null,
    gallery,
  };
}

export async function getPublishedListing(
  tenantId: string,
  categorySlug: string,
  listingSlug: string,
): Promise<ListingView | null> {
  const row = await getDb()
    .transaction()
    .execute(async (trx) => {
      await sql`select set_config('app.tenant_id', ${tenantId}, true)`.execute(trx);

      const { rows } = await sql<ListingRow>`
        select
          l.name,
          l.slug,
          l.status,
          l.description,
          l.tier             as listing_tier,
          l.address_line1,
          l.address_line2,
          l.locality,
          l.region,
          l.postal_code,
          l.country,
          l.contact_phone_e164,
          l.contact_website,
          l.media,
          ent.status         as entitlement_status,
          ent.tier           as entitlement_tier,
          cats.names         as category_names
        from listings l
        join listing_categories lc
          on lc.tenant_id = l.tenant_id and lc.listing_id = l.id
        join categories route_cat
          on route_cat.tenant_id = lc.tenant_id
         and route_cat.id = lc.category_id
         and route_cat.slug = ${categorySlug}
        left join lateral (
          select array_agg(c.name order by c.name) as names
          from listing_categories x
          join categories c
            on c.tenant_id = x.tenant_id and c.id = x.category_id
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
        where l.slug = ${listingSlug}
          and l.visibility = 'published'
        limit 1
      `.execute(trx);

      return rows[0] ?? null;
    });

  if (row === null) return null;

  const cityLine = [row.locality, row.region, row.postal_code]
    .filter((p): p is string => p !== null && p.trim() !== "")
    .join(" ");

  const address = [row.address_line1, row.address_line2, cityLine, row.country].filter(
    (line): line is string => line !== null && line.trim() !== "",
  );

  return {
    name: row.name,
    slug: row.slug,
    listingStatus: row.status,
    description: row.description,
    categoryNames: row.category_names ?? [],
    address,
    locality: row.locality,
    phone: row.contact_phone_e164,
    website: row.contact_website,
    media: parseMedia(row.media),
    entitlementStatus: row.entitlement_status ?? "none",
    tier: row.entitlement_tier ?? row.listing_tier,
  };
}
