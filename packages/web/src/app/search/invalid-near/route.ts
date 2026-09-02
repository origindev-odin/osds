import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { getHomePage } from "../../../lib/home";
import { parseNear } from "../../../lib/near";
import { search400Html } from "../../../lib/search-400-html";
import { resolveTenantId } from "../../../lib/tenant";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function loadPublicCss(): string {
  const candidates = [
    join(process.cwd(), "src/app/public.css"),
    join(process.cwd(), "packages/web/src/app/public.css"),
  ];
  for (const path of candidates) {
    try {
      return readFileSync(path, "utf8");
    } catch {
      continue;
    }
  }
  return "";
}

function firstParam(url: URL, name: string): string {
  return url.searchParams.get(name) ?? "";
}

export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const near = firstParam(url, "near");
  if (parseNear(near).kind !== "invalid") {
    const clean = new URL("/search", url.origin);
    const q = firstParam(url, "q");
    const radius = firstParam(url, "radius_km");
    if (q !== "") clean.searchParams.set("q", q);
    if (radius !== "") clean.searchParams.set("radius_km", radius);
    return NextResponse.redirect(clean);
  }

  const tenantId = await resolveTenantId();
  const home = tenantId !== null ? await getHomePage(tenantId) : null;
  const html = search400Html(
    {
      tenantName: home?.tenantName ?? "Directory",
      tagline: "Local listings.",
      origin: url.origin,
      year: new Date().getUTCFullYear(),
      categories: home?.categories ?? [],
    },
    {
      q: firstParam(url, "q"),
      near,
      radiusKm: firstParam(url, "radius_km"),
    },
    loadPublicCss(),
  );

  return new NextResponse(html, {
    status: 400,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "x-robots-tag": "noindex",
    },
  });
}
