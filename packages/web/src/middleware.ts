import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { parseNear } from "./lib/near";

/**
 * `/search?near=` accepts coordinates only (`lat,lon`). OSDS ships no geocoder,
 * so a postal code or place name is a 400 - not a silent empty result set.
 * A page (Server Component) cannot set an arbitrary status, so this rewrites
 * to the HTML 400 document at `/search/invalid-near`.
 */
export function middleware(request: NextRequest): NextResponse {
  const near = request.nextUrl.searchParams.get("near");
  if (parseNear(near).kind === "invalid") {
    const url = request.nextUrl.clone();
    url.pathname = "/search/invalid-near";
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/search",
};
