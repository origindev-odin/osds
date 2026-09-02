import { notFound } from "next/navigation";
import { getHomePage } from "../lib/home";
import { resolveTenantId } from "../lib/tenant";

// Depends on the Host header and a per-request database read - never prerendered.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const tenantId = await resolveTenantId();
  if (tenantId === null) notFound();

  const home = await getHomePage(tenantId);
  if (home === null) notFound();

  if (home.categories.length === 0) {
    return (
      <main id="main" className="wrap site-main coming-soon">
        <h1>{home.tenantName}</h1>
        <p className="lede">This directory is coming soon. Listings are not published yet.</p>
        <p>Check back later, or contact the directory operator if you were invited to claim a listing.</p>
        <form className="search-hero" method="get" action="/search">
          <div className="field">
            <label htmlFor="q">Search listings</label>
            <div className="search-row">
              <input id="q" type="search" name="q" />
              <button type="submit">Search</button>
            </div>
          </div>
        </form>
      </main>
    );
  }

  return (
    <main id="main" className="wrap site-main">
      <h1>{home.tenantName}</h1>
      <p className="lede">
        Find local listings. Browse categories below — search is optional, not the only path.
      </p>

      <form className="search-hero" method="get" action="/search">
        <div className="field">
          <label htmlFor="q">Search listings</label>
          <div className="search-row">
            <input id="q" type="search" name="q" />
            <button type="submit">Search</button>
          </div>
        </div>
      </form>

      <h2 className="organic-heading">Categories</h2>
      <ul className="chip-list">
        {home.categories.map((category) => (
          <li key={category.slug}>
            <a className="chip" href={`/${category.slug}`}>
              {category.name} <span className="count">({category.publishedCount})</span>
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
