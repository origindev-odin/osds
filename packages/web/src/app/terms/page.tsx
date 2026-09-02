import { notFound } from "next/navigation";
import { getHomePage } from "../../lib/home";
import { resolveTenantId } from "../../lib/tenant";

export const dynamic = "force-dynamic";

export default async function TermsPage() {
  const tenantId = await resolveTenantId();
  if (tenantId === null) notFound();
  const home = await getHomePage(tenantId);
  if (home === null) notFound();

  return (
    <main id="main" className="site-main">
      <div className="wrap legal-page">
        <h1>Terms</h1>
        <p>
          Listings on {home.tenantName} are provided by the directory operator.
          Contact the operator about corrections or disputes. This page is a
          stub, not a full terms of use.
        </p>
      </div>
    </main>
  );
}
