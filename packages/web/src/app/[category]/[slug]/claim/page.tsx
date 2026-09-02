import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { maskEmail, maskPhone } from "../../../../lib/mask";
import { getPublishedListing } from "../../../../lib/listing";
import { resolveTenantId } from "../../../../lib/tenant";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ category: string; slug: string }>;
}

export default async function ClaimPage({ params }: PageProps) {
  const { category, slug } = await params;

  const tenantId = await resolveTenantId();
  if (tenantId === null) notFound();

  const listing = await getPublishedListing(tenantId, category, slug);
  if (listing === null) notFound();
  if (listing.listingStatus === "claimed" || listing.provenance === "owner-verified") {
    notFound();
  }

  const phoneMasked = listing.phone !== null ? maskPhone(listing.phone) : null;
  const emailMasked = listing.contactEmail !== null ? maskEmail(listing.contactEmail) : null;
  const action = `/${category}/${slug}/claim/submit`;

  return (
    <main id="main" className="site-main">
      <div className="wrap legal-page">
        <nav aria-label="Breadcrumb">
          <ol className="breadcrumbs">
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href={`/${category}`}>{listing.routeCategoryName}</a>
            </li>
            <li>
              <a href={`/${category}/${slug}`}>{listing.name}</a>
            </li>
            <li>Claim</li>
          </ol>
        </nav>

        <h1>Claim {listing.name}</h1>
        <p>
          We’ll verify you represent this business. Claim is not a new listing. There is no
          password on this form.
        </p>

        <form className="form-stack" method="post" action={action}>
          <input type="hidden" name="text_version" value="consent.claim.v1" />

          <div className="field">
            <label htmlFor="claimant-name">Your name</label>
            <input id="claimant-name" type="text" name="name" required autoComplete="name" />
          </div>
          <div className="field">
            <label htmlFor="claimant-email">Email</label>
            <input id="claimant-email" type="email" name="email" required autoComplete="email" />
          </div>
          <div className="field">
            <label htmlFor="claimant-phone">Phone</label>
            <input id="claimant-phone" type="tel" name="phone" required autoComplete="tel" />
          </div>
          <div className="field">
            <label htmlFor="role_claimed">Your role</label>
            <input
              id="role_claimed"
              type="text"
              name="role_claimed"
              required
              placeholder="Owner, manager…"
            />
          </div>

          <fieldset>
            <legend>How should we verify?</legend>
            <p className="hint">Manual review is always available. Other methods stay off until wired.</p>
            <label className="choice">
              <input type="radio" name="method" value="manual" defaultChecked required />
              <span>We’ll verify this by hand. Status: in review.</span>
            </label>
            {phoneMasked !== null ? (
              <label className="choice">
                <input type="radio" name="method" value="phone_otp" />
                <span>
                  Send a code to the listing phone <strong>{phoneMasked}</strong>
                </span>
              </label>
            ) : null}
          </fieldset>

          {emailMasked !== null ? (
            <p className="hint">
              Listing email on file: <strong>{emailMasked}</strong>. Contacts stay masked in this UI.
            </p>
          ) : null}

          <label className="choice">
            <input type="checkbox" name="consent" value="granted" required />
            <span>
              I am authorized to claim {listing.name} and I agree the directory may contact me at
              the email and phone I entered to verify this claim.
            </span>
          </label>

          <button type="submit" className="btn btn-primary">
            Submit claim
          </button>
        </form>
      </div>
    </main>
  );
}
