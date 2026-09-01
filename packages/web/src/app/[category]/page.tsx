import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolvePublicRender } from "@osds/core";
import { FeaturedBand } from "../../components/featured-band";
import { ListingTile, provenanceFromStatus } from "../../components/listing-tile";
import { PublicShell } from "../../components/public-shell";
import { getCategoryPage } from "../../lib/category";
import { getPublicChrome } from "../../lib/chrome";

// Depends on the Host header and a per-request database read - never prerendered.
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const chrome = await getPublicChrome();
  if (chrome === null) return { title: "Directory" };
  const page = await getCategoryPage(chrome.tenantId, category);
  if (page === null) return { title: chrome.tenantName };
  return { title: `${page.name} · ${chrome.tenantName}` };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;

  const chrome = await getPublicChrome();
  if (chrome === null) notFound();

  const page = await getCategoryPage(chrome.tenantId, category);
  if (page === null) notFound();

  // §6.5: featured placement first, then the rest. `page.listings` is already
  // name-ordered, so each group stays alphabetical. ListingTile calls the same
  // resolver again for the badge. Featured is a heading + ordinary tiles.
  const featured = page.listings.filter(
    (listing) => resolvePublicRender(listing.entitlementStatus).featuredPlacement,
  );
  const rest = page.listings.filter(
    (listing) => !resolvePublicRender(listing.entitlementStatus).featuredPlacement,
  );

  return (
    <PublicShell
      tenantName={chrome.tenantName}
      categories={chrome.categories}
      searchQuery={null}
      wrapClassName="wrap"
    >
      <nav aria-label="Breadcrumb">
        <ol className="breadcrumbs">
          <li>
            <a href="/">Home</a>
          </li>
          <li>{page.name}</li>
        </ol>
      </nav>

      <h1>{page.name}</h1>
      <p className="result-count" aria-live="polite">
        {page.listings.length === 1 ? "1 listing" : `${page.listings.length} listings`}
      </p>

      {page.listings.length === 0 ? (
        <div className="empty-state">
          <h2>Nothing published here yet.</h2>
          <p>Published listings in {page.name} will appear here.</p>
        </div>
      ) : (
        <>
          <FeaturedBand
            listings={featured.map((listing) => ({
              href: `/${category}/${listing.slug}`,
              name: listing.name,
              entitlementStatus: listing.entitlementStatus,
              tier: listing.tier,
              categories: [page.name],
              locality: listing.locality,
              provenance: provenanceFromStatus(listing.status),
              headingLevel: 3 as const,
            }))}
          />
          {rest.length > 0 ? (
            <>
              <h2 className="organic-heading">All {page.name}</h2>
              <ul className="listing-grid">
                {rest.map((listing) => (
                  <li key={listing.slug}>
                    <ListingTile
                      href={`/${category}/${listing.slug}`}
                      name={listing.name}
                      entitlementStatus={listing.entitlementStatus}
                      tier={listing.tier}
                      categories={[page.name]}
                      locality={listing.locality}
                      provenance={provenanceFromStatus(listing.status)}
                      headingLevel={3}
                    />
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </>
      )}
    </PublicShell>
  );
}
