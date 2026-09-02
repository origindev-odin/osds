import type { ReactNode } from "react";
import type { HomeCategory } from "../lib/home";

export function SiteChrome(props: {
  readonly tenantName: string;
  readonly categories: readonly HomeCategory[];
  readonly children: ReactNode;
}) {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="wrap site-header-inner">
          <a className="wordmark" href="/">
            {props.tenantName}
          </a>
          <div className="header-tools">
            <form className="compact-search" method="get" action="/search">
              <label htmlFor="q-header">Search</label>
              <input id="q-header" type="search" name="q" />
              <button type="submit">Search</button>
            </form>
            <nav aria-label="Account">
              <a className="owner-link" href="/account">
                Owner sign in
              </a>
            </nav>
          </div>
        </div>
      </header>
      {props.children}
      <footer className="site-footer">
        <div className="wrap">
          <p className="footer-identity">{props.tenantName}</p>
          {props.categories.length > 0 ? (
            <ul className="footer-cats">
              {props.categories.map((category) => (
                <li key={category.slug}>
                  <a href={`/${category.slug}`}>{category.name}</a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </footer>
    </>
  );
}
