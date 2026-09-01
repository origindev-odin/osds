import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingTile } from "../../components/listing-tile";
import { parseNear } from "../../lib/near";
import { firstValue } from "../../lib/query";
import { getSearchResults } from "../../lib/search";
import { resolveTenantId } from "../../lib/tenant";

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

  const parsed = parseNear(near);
  const coords = parsed.kind === "coords" ? { lat: parsed.lat, lon: parsed.lon } : null;

  const hasText = q !== null && q.trim() !== "";
  const searched = hasText || coords !== null;

  const parsedRadius = radiusRaw === null ? NaN : Number(radiusRaw);
  const radiusKm = Number.isFinite(parsedRadius) && parsedRadius > 0 ? parsedRadius : 25;

  const results = searched
    ? await getSearchResults(tenantId, { q, near: coords, radiusKm })
    : [];

  return (
    <>
      <h1>Search</h1>

      <form className="search-hero" method="get" action="/search" role="search">
        <div className="search-row">
          <label className="visually-hidden" htmlFor="search-q">
            Keywords
          </label>
          <input id="search-q" type="search" name="q" defaultValue={q ?? ""} />
          <button type="submit">Search</button>
        </div>

        <details className="advanced" {...(near !== null && near !== "" ? { open: true } : {})}>
          <summary>Advanced</summary>
          <div className="advanced-grid">
            <p className="field">
              <label htmlFor="search-near">Coordinates (lat,lon)</label>
              <input
                id="search-near"
                type="text"
                name="near"
                defaultValue={near ?? ""}
                autoComplete="off"
              />
              <span className="hint">Coordinates only. A city or ZIP will fail.</span>
            </p>
            <p className="field">
              <label htmlFor="search-radius">Radius km</label>
              <input
                id="search-radius"
                type="text"
                name="radius_km"
                defaultValue={radiusRaw ?? "25"}
                inputMode="decimal"
              />
            </p>
          </div>
        </details>
      </form>

      {!searched ? (
        <div className="empty-state">
          <p>Enter keywords or coordinates to search. The directory is not listed here in full.</p>
          <p>
            <a href="/">Back home</a>
          </p>
        </div>
      ) : results.length === 0 ? (
        <div className="empty-state">
          <p className="result-count" aria-live="polite">
            0 results
          </p>
          <p>
            <a href="/">Home</a>
          </p>
        </div>
      ) : (
        <>
          <p className="result-count" aria-live="polite">
            {results.length} result{results.length === 1 ? "" : "s"}
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
                listingStatus={result.listingStatus}
                categories={result.categories}
                locality={result.locality}
              />
            ))}
          </ul>
        </>
      )}
    </>
  );
}
