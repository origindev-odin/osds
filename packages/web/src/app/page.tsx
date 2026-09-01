import { notFound } from "next/navigation";
import { resolveTenantId } from "../lib/tenant";
import { getHomePage } from "../lib/home";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const tenantId = await resolveTenantId();
  if (tenantId === null) notFound();

  const home = await getHomePage(tenantId);
  if (home === null) notFound();

  const empty = home.categories.length === 0;

  return (
    <>
      <h1>{home.tenantName}</h1>

      {empty ? (
        <div className="empty-state">
          <h2>Coming soon</h2>
          <p>This directory is being filled. Check back shortly.</p>
        </div>
      ) : (
        <>
          <form className="search-hero" method="get" action="/search" role="search">
            <div className="search-row">
              <label className="visually-hidden" htmlFor="home-q">
                Keywords
              </label>
              <input id="home-q" type="search" name="q" placeholder="Search listings" />
              <button type="submit">Search</button>
            </div>
          </form>

          <ul className="chip-list">
            {home.categories.map((category) => (
              <li key={category.slug}>
                <a className="chip" href={`/${category.slug}`}>
                  {category.name}
                  <span className="count">{category.publishedCount}</span>
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
