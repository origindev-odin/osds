import type { ReactNode } from "react";
import type { HomeCategory } from "../lib/home";

export function SiteChrome(props: {
  readonly tenantName: string;
  readonly tagline: string;
  readonly origin: string;
  readonly year: number;
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
              <input id="q-header" type="search" name="q" placeholder="Search listings" />
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
        <div className="wrap footer-grid">
          <div>
            <p className="footer-identity">{props.tenantName}</p>
            <p className="footer-tag">{props.tagline}</p>
          </div>
          <div>
            <h2 className="footer-heading">Categories</h2>
            {props.categories.length > 0 ? (
              <ul className="footer-cats">
                {props.categories.map((category) => (
                  <li key={category.slug}>
                    <a href={`/${category.slug}`}>{category.name}</a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="footer-tag">No published categories yet.</p>
            )}
          </div>
          <div>
            <h2 className="footer-heading">About</h2>
            <ul className="footer-nav">
              <li>
                <a href="/about">About</a>
              </li>
              <li>
                <a href="/privacy">Privacy</a>
              </li>
              <li>
                <a href="/terms">Terms</a>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="footer-heading">Share</h2>
            {props.origin !== "" ? (
              <p className="footer-share">{props.origin}</p>
            ) : (
              <p className="footer-share">/</p>
            )}
          </div>
        </div>
        <div className="wrap footer-sub">
          <p>
            © {props.year} {props.tenantName} · <a href="/privacy">Privacy</a> ·{" "}
            <a href="/terms">Terms</a>
          </p>
        </div>
      </footer>
    </>
  );
}
