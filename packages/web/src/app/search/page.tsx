import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingTile } from "../../components/listing-tile";
import { SearchForm } from "../../components/search-form";
import { getHomePage } from "../../lib/home";
import { parseNear } from "../../lib/near";
import { firstValue } from "../../lib/query";
import { getSearchResults } from "../../lib/search";
import { resolveTenantId } from "../../lib/tenant";

// Reads the query string and the database per request - never prerendered.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = firstValue(params["q"]);
  const near = firstValue(params["near"]);
  const radiusRaw = firstValue(params["radius_km"]);

  const tenantId = await resolveTenantId();
  if (tenantId === null) notFound();

  const home = await getHomePage(tenantId);
  if (home === null) notFound();

  // An invalid `near` is a 400 from middleware.ts before we get here; treat any
  // that slips through as no location filter.
  const parsed = parseNear(near);
  const coords = parsed.kind === "coords" ? { lat: parsed.lat, lon: parsed.lon } : null;

  const qValue = q ?? "";
  const hasText = qValue.trim() !== "";
  const searched = hasText || coords !== null;

  const parsedRadius = radiusRaw === null ? NaN : Number(radiusRaw);
  const radiusKm = Number.isFinite(parsedRadius) && parsedRadius > 0 ? parsedRadius : 25;

  const results = searched
    ? await getSearchResults(tenantId, { q, near: coords, radiusKm })
    : [];

  return (
    <main id="main" className="wrap site-main">
      <h1>Search</h1>

      <SearchForm
        q={qValue}
        near={near ?? ""}
        radiusKm={radiusRaw ?? ""}
        advancedOpen={near !== null && near !== ""}
        nearInvalid={false}
        idPrefix=""
      />

      {!searched ? (
        <div className="empty-state">
          <p className="result-count">0 results. Enter a search term or coordinates to find listings.</p>
          <p>This page does not list the directory. Start from:</p>
          <ul>
            <li>
              <a href="/">Home</a> — browse categories
            </li>
            {home.categories.map((category) => (
              <li key={category.slug}>
                <a href={`/${category.slug}`}>{category.name}</a>
              </li>
            ))}
          </ul>
        </div>
      ) : results.length === 0 ? (
        <div className="empty-state">
          <p className="result-count">No results.</p>
          <p>
            <a href="/">Back to home</a>
          </p>
        </div>
      ) : (
        <>
          <p className="result-count">
            {results.length === 1 ? "1 result" : `${results.length} results`}
            {hasText ? ` for “${qValue.trim()}”` : ""}
          </p>
          <ul className="listing-grid">
            {results.map((result) => (
              <ListingTile
                key={result.slug}
                href={
                  result.categorySlug !== null
                    ? `/${result.categorySlug}/${result.slug}`
                    : null
                }
                name={result.name}
                entitlementStatus={result.entitlementStatus}
                tier={result.tier}
                categoryName={result.categories[0] ?? null}
                locality={result.locality}
                provenance={result.provenance}
                hasLogo={result.hasLogo}
              />
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
