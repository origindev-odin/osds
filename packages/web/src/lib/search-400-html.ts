import { escapeHtml } from "./html";

export interface Search400Chrome {
  readonly tenantName: string;
  readonly tagline: string;
  readonly origin: string;
  readonly year: number;
  readonly categories: readonly { readonly slug: string; readonly name: string }[];
}

export function search400Html(
  chrome: Search400Chrome,
  input: { readonly q: string; readonly near: string; readonly radiusKm: string },
  css: string,
): string {
  const tenant = escapeHtml(chrome.tenantName);
  const tagline = escapeHtml(chrome.tagline);
  const origin = escapeHtml(chrome.origin);
  const year = String(chrome.year);
  const q = escapeHtml(input.q);
  const near = escapeHtml(input.near);
  const radius = escapeHtml(input.radiusKm === "" ? "25" : input.radiusKm);
  const nearAttr = escapeHtml(input.near);
  const footerCats =
    chrome.categories.length === 0
      ? `<p class="footer-tag">No published categories yet.</p>`
      : `<ul class="footer-cats">${chrome.categories
          .map(
            (c) =>
              `<li><a href="/${escapeHtml(c.slug)}">${escapeHtml(c.name)}</a></li>`,
          )
          .join("")}</ul>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>${tenant}</title>
  <style>${css}</style>
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="wrap site-header-inner">
      <a class="wordmark" href="/">${tenant}</a>
      <div class="header-tools">
        <form class="compact-search" method="get" action="/search">
          <label for="q-header">Search</label>
          <input id="q-header" type="search" name="q" value="${q}" placeholder="Search listings">
          <button type="submit">Search</button>
        </form>
        <nav aria-label="Account">
          <a class="owner-link" href="/account">Owner sign in</a>
        </nav>
      </div>
    </div>
  </header>
  <main id="main" class="site-main">
    <div class="wrap">
    <h1>That location is not valid</h1>
    <div class="alert" role="alert">
      <strong>near must be coordinates.</strong>
      You entered “${nearAttr}”. Search only accepts lat,lon (for example 41.94,-87.65).
      City names, ZIP codes, and addresses are not accepted. There is no geocoder.
    </div>
    <p>
      <a href="/search">Search again</a> without a location, or go to
      <a href="/">home</a>.
    </p>
    <form class="form-stack" method="get" action="/search">
      <div class="field">
        <label for="q">Search listings</label>
        <input id="q" type="search" name="q" value="${q}">
      </div>
      <details class="advanced" open>
        <summary>Advanced: near (coordinates)</summary>
        <div class="advanced-grid">
          <div class="field">
            <label for="near">Near (lat,lon)</label>
            <input id="near" type="text" name="near" value="${near}" inputmode="decimal" autocomplete="off" aria-invalid="true" aria-describedby="near-err">
            <p id="near-err" class="hint">Coordinates only. A city or ZIP will fail.</p>
          </div>
          <div class="field">
            <label for="radius_km">Radius (km)</label>
            <input id="radius_km" type="number" name="radius_km" value="${radius}" min="1" step="any">
          </div>
        </div>
      </details>
      <p><button class="btn btn-primary" type="submit">Search</button></p>
    </form>
    </div>
  </main>
  <footer class="site-footer">
    <div class="wrap footer-grid">
      <div>
        <p class="footer-identity">${tenant}</p>
        <p class="footer-tag">${tagline}</p>
      </div>
      <div>
        <h2 class="footer-heading">Categories</h2>
        ${footerCats}
      </div>
      <div>
        <h2 class="footer-heading">About</h2>
        <ul class="footer-nav">
          <li><a href="/about">About</a></li>
          <li><a href="/privacy">Privacy</a></li>
          <li><a href="/terms">Terms</a></li>
        </ul>
      </div>
      <div>
        <h2 class="footer-heading">Share</h2>
        <p class="footer-share">${origin === "" ? "/" : origin}</p>
      </div>
    </div>
    <div class="wrap footer-sub">
      <p>© ${year} ${tenant} · <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a></p>
    </div>
  </footer>
</body>
</html>
`;
}
