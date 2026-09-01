import { cache } from "react";
import { getHomePage, type HomeCategory } from "./home";
import { resolveTenantId } from "./tenant";

export interface PublicChrome {
  readonly tenantId: string;
  readonly tenantName: string;
  readonly categories: readonly HomeCategory[];
}

/**
 * Tenant id + homepage chrome (name, categories with counts) for this request.
 * Memoised per render so layout-adjacent pages and generateMetadata share one
 * getHomePage round-trip. Uses the existing home fetcher; does not add a source.
 */
export const getPublicChrome = cache(async (): Promise<PublicChrome | null> => {
  const tenantId = await resolveTenantId();
  if (tenantId === null) return null;

  const home = await getHomePage(tenantId);
  if (home === null) return null;

  return {
    tenantId,
    tenantName: home.tenantName,
    categories: home.categories,
  };
});
