import { notFound } from "next/navigation";
import { getHomePage } from "../lib/home";
import { resolveTenantId } from "../lib/tenant";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const tenantId = await resolveTenantId();
  if (tenantId === null) notFound();

  const home = await getHomePage(tenantId);
  if (home === null) notFound();

  if (home.categories.length === 0) {
    return (
      <main id="main" className="site-main">
        <div className="wrap coming-soon">
          <h1>{home.tenantName}</h1>
          <p className="lede">This directory is coming soon. Listings are not published yet.</p>
          <form className="search-hero" method="get" action="/search" role="search">
            <div className="search-row">
              <label className="visually-hidden" htmlFor="q-home">
                Keywords
              </label>
              <input id="q-home" type="search" name="q" placeholder="Search listings" />
              <button type="submit">Search</button>
            </div>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main id="main" className="site-main">
      <div className="wrap">
        <h1>{home.tenantName}</h1>
        <form className="search-hero" method="get" action="/search" role="search">
          <div className="search-row">
            <label className="visually-hidden" htmlFor="q-home">
              Keywords
            </label>
            <input
              id="q-home"
              type="search"
              name="q"
              placeholder="Plumber, cafe, bookshop…"
            />
            <button type="submit">Search</button>
          </div>
        </form>
        <ul className="chip-list">
          {home.categories.map((category) => (
            <li key={category.slug}>
              <a className="chip" href={`/${category.slug}`}>
                {category.name} <span className="count">({category.publishedCount})</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
