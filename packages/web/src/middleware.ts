import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { parseNear } from "./lib/near";

const INVALID_NEAR_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="robots" content="noindex" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Invalid coordinates</title>
  <link rel="stylesheet" href="/public.css" />
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <main id="main" class="site-main wrap">
    <h1>Coordinates only</h1>
    <p class="empty-state" role="alert">
      The <code>near</code> parameter must be coordinates as <code>lat,lon</code>
      (for example <code>near=41.94,-87.64</code>). OSDS ships no geocoder, so
      postal codes and place names are not accepted.
    </p>
    <p>
      <a href="/search">Search without a location</a>
      ·
      <a href="/">Home</a>
    </p>
    <form class="search-hero" method="get" action="/search" role="search">
      <div class="search-row">
        <label class="visually-hidden" for="search-q">Keywords</label>
        <input id="search-q" type="search" name="q" />
        <button type="submit">Search</button>
      </div>
      <details class="advanced" open>
        <summary>Advanced</summary>
        <div class="advanced-grid">
          <p class="field">
            <label for="search-near">Coordinates (lat,lon)</label>
            <input id="search-near" type="text" name="near" aria-invalid="true" />
            <span class="hint">Coordinates only. A city or ZIP will fail.</span>
          </p>
        </div>
      </details>
    </form>
  </main>
</body>
</html>
`;

/**
 * `/search?near=` accepts coordinates only (`lat,lon`). OSDS ships no geocoder,
 * so a postal code or place name is a 400 HTML page - not a silent empty result
 * set. A page (Server Component) cannot set an arbitrary status, so this runs
 * here.
 */
export function middleware(request: NextRequest): NextResponse {
  const near = request.nextUrl.searchParams.get("near");
  if (parseNear(near).kind === "invalid") {
    return new NextResponse(INVALID_NEAR_HTML, {
      status: 400,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/search",
};
