import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicShell } from "../components/public-shell";
import { getPublicChrome } from "../lib/chrome";

// Depends on the Host header and a per-request database read - never prerendered.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const chrome = await getPublicChrome();
  if (chrome === null) return { title: "Directory" };
  return { title: chrome.tenantName };
}

export default async function HomePage() {
  const chrome = await getPublicChrome();
  if (chrome === null) notFound();

  return (
    <PublicShell
      tenantName={chrome.tenantName}
      categories={chrome.categories}
      searchQuery={null}
      wrapClassName="wrap"
    >
      <h1>{chrome.tenantName}</h1>

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

      {chrome.categories.length === 0 ? (
        <div className="empty-state">
          <h2>This directory is being filled.</h2>
          <p>
            {chrome.tenantName} will list businesses as they are published. There is
            nothing to browse yet.
          </p>
        </div>
      ) : (
        <ul className="chip-list">
          {chrome.categories.map((category) => (
            <li key={category.slug}>
              <a className="chip" href={`/${category.slug}`}>
                {category.name} <span className="count">{category.publishedCount}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </PublicShell>
  );
}
