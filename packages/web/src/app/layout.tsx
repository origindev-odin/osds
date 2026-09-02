import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { SiteChrome } from "../components/site-chrome";
import { getHomePage } from "../lib/home";
import { resolveTenantId } from "../lib/tenant";
import "./public.css";

export const dynamic = "force-dynamic";

async function publicOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  if (host === "") return "";
  const proto =
    h.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const tenantId = await resolveTenantId();
  if (tenantId === null) return { title: "Directory" };
  const home = await getHomePage(tenantId);
  return { title: home?.tenantName ?? "Directory" };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const tenantId = await resolveTenantId();
  const home = tenantId !== null ? await getHomePage(tenantId) : null;
  const tenantName = home?.tenantName ?? "Directory";
  const categories = home?.categories ?? [];

  return (
    <html lang="en">
      <body>
        <SiteChrome
          tenantName={tenantName}
          tagline="Local listings."
          origin={await publicOrigin()}
          year={new Date().getUTCFullYear()}
          categories={categories}
        >
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}
