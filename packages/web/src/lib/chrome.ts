import { getHomePage } from "./home";
import type { HomeCategory } from "./home";
import { resolveTenantId } from "./tenant";

export interface SiteChrome {
  readonly tenantId: string;
  readonly tenantName: string;
  readonly categories: readonly HomeCategory[];
}

export async function getSiteChrome(): Promise<SiteChrome | null> {
  const tenantId = await resolveTenantId();
  if (tenantId === null) return null;
  const home = await getHomePage(tenantId);
  if (home === null) return null;
  return {
    tenantId,
    tenantName: home.tenantName,
    categories: home.categories,
  };
}
