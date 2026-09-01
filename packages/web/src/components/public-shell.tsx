import type { ReactNode } from "react";
import type { HomeCategory } from "../lib/home";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function PublicShell(props: {
  readonly tenantName: string;
  readonly categories: readonly HomeCategory[];
  readonly searchQuery: string | null;
  readonly wrapClassName: string;
  readonly children: ReactNode;
}) {
  return (
    <>
      <SiteHeader tenantName={props.tenantName} searchQuery={props.searchQuery} />
      <main id="main" className="site-main">
        <div className={props.wrapClassName}>{props.children}</div>
      </main>
      <SiteFooter tenantName={props.tenantName} categories={props.categories} />
    </>
  );
}
