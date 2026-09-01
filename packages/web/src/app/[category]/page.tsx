import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolvePublicRender } from "@osds/core";
import { FeaturedBand } from "../../components/featured-band";
import { ListingTile } from "../../components/listing-tile";
import { getCategoryPage } from "../../lib/category";
import { firstValue, pageNumber } from "../../lib/query";
import { resolveTenantId } from "../../lib/tenant";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

interface PageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const page = pageNumber(firstValue(params["page"]));
  if (page > 1) {
    return { robots: { index: false, follow: true } };
  }
  return {};
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { category } = await params;
  const query = await searchParams;
  const page = pageNumber(firstValue(query["page"]));

  const tenantId = await resolveTenantId();
  if (tenantId === null) notFound();

  const data = await getCategoryPage(tenantId, category);
  if (data === null) notFound();

  const isFeatured = (status: (typeof data.listings)[number]["entitlementStatus"]) =>
    resolvePublicRender(status).featuredPlacement;

  const featured = data.listings.filter((l) => isFeatured(l.entitlementStatus));
  const rest = data.listings.filter((l) => !isFeatured(l.entitlementStatus));

  const totalPages = Math.max(1, Math.ceil(rest.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageRest = rest.slice(start, start + PAGE_SIZE);

  const tile = (listing: (typeof data.listings)[number]) => (
    <ListingTile
      key={listing.slug}
      href={`/${category}/${listing.slug}`}
      name={listing.name}
      entitlementStatus={listing.entitlementStatus}
      tier={listing.tier}
      listingStatus={listing.listingStatus}
      categories={listing.categories}
      locality={listing.locality}
    />
  );

  return (
    <>
      <h1>
        {data.name} <span className="result-count">({data.listings.length})</span>
      </h1>

      {featured.length > 0 ? (
        <FeaturedBand>
          <ul className="listing-grid">{featured.map(tile)}</ul>
        </FeaturedBand>
      ) : null}

      {data.listings.length === 0 ? (
        <div className="empty-state">
          <p>No listings yet in this category.</p>
        </div>
      ) : (
        <>
          {pageRest.length > 0 ? (
            <ul className="listing-grid">{pageRest.map(tile)}</ul>
          ) : featured.length === 0 ? (
            <div className="empty-state">
              <p>No listings yet in this category.</p>
            </div>
          ) : null}

          {totalPages > 1 ? (
            <nav aria-label="Pagination">
              <ul className="pagination">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <li key={n}>
                    {n === safePage ? (
                      <span aria-current="page">{n}</span>
                    ) : (
                      <a href={n === 1 ? `/${category}` : `/${category}?page=${n}`}>{n}</a>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </>
      )}
    </>
  );
}
