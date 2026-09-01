import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingTile, provenanceFromStatus } from "../../components/listing-tile";
import { PublicShell } from "../../components/public-shell";
import { getPublicChrome } from "../../lib/chrome";
import { parseNear } from "../../lib/near";
import { getSearchResults } from "../../lib/search";

// Reads the query string and the database per request - never prerendered.
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export async function generateMetadata(): Promise<Metadata> {
  const chrome = await getPublicChrome();
  const title = chrome === null ? "Search" : `Search · ${chrome.tenantName}`;
  return {
    title,
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = firstValue(params["q"]);
  const near = firstValue(params["near"]);
  const radiusRaw = firstValue(params["radius_km"]);

  const chrome = await getPublicChrome();
  if (chrome === null) notFound();

  // An invalid `near` is a 400 from middleware.ts before we get here; treat any
  // that slips through as no location filter.
  const parsed = parseNear(near);
  const coords = parsed.kind === "coords" ? { lat: parsed.lat, lon: parsed.lon } : null;

  const hasText = q !== null && q.trim() !== "";
  const searched = hasText || coords !== null;

  const parsedRadius = radiusRaw === null ? NaN : Number(radiusRaw);
  const radiusKm = Number.isFinite(parsedRadius) && parsedRadius > 0 ? parsedRadius : 25;

  const results = searched
    ? await getSearchResults(chrome.tenantId, { q, near: coords, radiusKm })
    : [];

  const queryLabel =
    hasText && q !== null ? ` for \u201c${q.trim()}\u201d` : "";

  return (
    <PublicShell
      tenantName={chrome.tenantName}
      categories={chrome.categories}
      searchQuery={q}
      wrapClassName="wrap"
    >
      <h1>Search</h1>

      <form className="search-hero" method="get" action="/search" role="search">
        <div className="search-row">
          <label className="visually-hidden" htmlFor="q">
            Keywords
          </label>
          <input
            id="q"
            type="search"
            name="q"
            placeholder="Keywords"
            defaultValue={q ?? ""}
          />
          <button type="submit">Search</button>
        </div>
        <details className="advanced" open={near !== null && near !== ""}>
          <summary>Advanced</summary>
          <div className="advanced-grid">
            <div className="field">
              <label htmlFor="near">Near (lat,lon)</label>
              <input
                id="near"
                type="text"
                name="near"
                inputMode="decimal"
                autoComplete="off"
                defaultValue={near ?? ""}
              />
              <p className="hint">Coordinates only. A city or ZIP will fail.</p>
            </div>
            <div className="field">
              <label htmlFor="radius_km">Radius (km)</label>
              <input
                id="radius_km"
                type="number"
                name="radius_km"
                min={1}
                max={100}
                step={1}
                defaultValue={radiusRaw ?? "25"}
              />
            </div>
          </div>
        </details>
      </form>

      {!searched ? null : results.length === 0 ? (
        <div className="empty-state">
          <h2>No listings matched.</h2>
          <p>Try different keywords, or leave Advanced empty to search the whole directory.</p>
        </div>
      ) : (
        <>
          <p className="result-count" aria-live="polite">
            {results.length === 1 ? "1 listing" : `${results.length} listings`}
            {queryLabel}
          </p>
          <ul className="listing-grid">
            {results.map((result) => (
              <li key={result.slug}>
                <ListingTile
                  href={
                    result.categorySlug !== null
                      ? `/${result.categorySlug}/${result.slug}`
                      : null
                  }
                  name={result.name}
                  entitlementStatus={result.entitlementStatus}
                  tier={result.tier}
                  categories={result.categories}
                  locality={result.locality}
                  provenance={provenanceFromStatus(result.status)}
                  headingLevel={2}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </PublicShell>
  );
}
