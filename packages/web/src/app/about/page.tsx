import { notFound } from "next/navigation";
import { getHomePage } from "../../lib/home";
import { resolveTenantId } from "../../lib/tenant";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const tenantId = await resolveTenantId();
  if (tenantId === null) notFound();
  const home = await getHomePage(tenantId);
  if (home === null) notFound();

  return (
    <main id="main" className="site-main">
      <div className="wrap legal-page">
        <h1>About</h1>
        <p>
          {home.tenantName} is a local directory. Contact the operator if you have
          questions about a listing or this site.
        </p>
      </div>
    </main>
  );
}
