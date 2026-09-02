import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolvePublicRender } from "@osds/core";
import { FeaturedBand } from "../../components/featured-band";
import { ListingTile } from "../../components/listing-tile";
import { PaginationNav } from "../../components/pagination-nav";
import { getCategoryPage } from "../../lib/category";
import type { CategoryListing } from "../../lib/category";
import { clampPage, pageCount, parsePage, slicePage } from "../../lib/pagination";
import { firstValue } from "../../lib/query";
import { resolveTenantId } from "../../lib/tenant";

// Depends on the Host header and a per-request database read - never prerendered.
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const page = parsePage(firstValue(params["page"]));
  if (page > 1) return { robots: { index: false, follow: true } };
  return {};
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { category } = await params;
  const query = await searchParams;

  const tenantId = await resolveTenantId();
  if (tenantId === null) notFound();

  const page = await getCategoryPage(tenantId, category);
  if (page === null) notFound();

  // §6.5: featured placement first, then the rest. `page.listings` is already
  // name-ordered, so each group stays alphabetical.
  const featured: CategoryListing[] = [];
  const remainder: CategoryListing[] = [];
  for (const listing of page.listings) {
    if (resolvePublicRender(listing.entitlementStatus).featuredPlacement) {
      featured.push(listing);
    } else {
      remainder.push(listing);
    }
  }

  const totalPages = pageCount(remainder.length);
  const current = clampPage(parsePage(firstValue(query["page"])), totalPages);
  const remainderPage = slicePage(remainder, current);
  const showBand = current === 1 && featured.length > 0;
  const basePath = `/${category}`;

  return (
    <main id="main" className="wrap site-main">
      <nav aria-label="Breadcrumb">
        <ol className="breadcrumbs">
          <li>
            <a href="/">Home</a>
          </li>
          <li>{page.name}</li>
        </ol>
      </nav>
      <h1>{page.name}</h1>
      <p className="result-count">
        {page.listings.length === 1
          ? "1 published listing"
          : `${page.listings.length} published listings`}
      </p>

      {showBand ? (
        <FeaturedBand>
          <ul className="listing-grid">
            {featured.map((listing) => (
              <ListingTile
                key={listing.slug}
                href={`/${category}/${listing.slug}`}
                name={listing.name}
                entitlementStatus={listing.entitlementStatus}
                tier={listing.tier}
                categoryName={page.name}
                locality={listing.locality}
                provenance={listing.provenance}
                hasLogo={listing.hasLogo}
              />
            ))}
          </ul>
        </FeaturedBand>
      ) : null}

      {page.listings.length === 0 ? (
        <div className="empty-state">
          <p>No listings in this category yet.</p>
        </div>
      ) : remainder.length > 0 ? (
        <>
          <h2 className="organic-heading">All {page.name.toLowerCase()}</h2>
          {remainderPage.length === 0 ? (
            <p>No more listings on this page.</p>
          ) : (
            <ul className="listing-grid">
              {remainderPage.map((listing) => (
                <ListingTile
                  key={listing.slug}
                  href={`/${category}/${listing.slug}`}
                  name={listing.name}
                  entitlementStatus={listing.entitlementStatus}
                  tier={listing.tier}
                  categoryName={page.name}
                  locality={listing.locality}
                  provenance={listing.provenance}
                  hasLogo={listing.hasLogo}
                />
              ))}
            </ul>
          )}
          <PaginationNav basePath={basePath} page={current} totalPages={totalPages} />
        </>
      ) : null}
    </main>
  );
}
