import { notFound } from "next/navigation";
import { getHomePage } from "../../lib/home";
import { resolveTenantId } from "../../lib/tenant";

export const dynamic = "force-dynamic";

export default async function PrivacyPage() {
  const tenantId = await resolveTenantId();
  if (tenantId === null) notFound();
  const home = await getHomePage(tenantId);
  if (home === null) notFound();

  return (
    <main id="main" className="site-main">
      <div className="wrap legal-page">
        <h1>Privacy</h1>
        <p>
          {home.tenantName} publishes directory listings. Contact the operator
          about personal data or removal requests. This page is a stub, not a
          full privacy policy.
        </p>
      </div>
    </main>
  );
}
