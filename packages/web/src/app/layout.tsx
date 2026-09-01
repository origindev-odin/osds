import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";
import { getSiteChrome } from "../lib/chrome";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const chrome = await getSiteChrome();
  return {
    title: chrome?.tenantName ?? "Directory",
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const chrome = await getSiteChrome();

  return (
    <html lang="en">
      <body>
        <link rel="stylesheet" href="/public.css" />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {chrome !== null ? <SiteHeader tenantName={chrome.tenantName} /> : null}
        <div id="main" className="site-main wrap">
          {children}
        </div>
        {chrome !== null ? (
          <SiteFooter tenantName={chrome.tenantName} categories={chrome.categories} />
        ) : null}
      </body>
    </html>
  );
}
