import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolvePublicRender } from "@osds/core";
import { provenanceFromStatus } from "../../../components/listing-tile";
import { PublicShell } from "../../../components/public-shell";
import { getPublicChrome } from "../../../lib/chrome";
import { getPublishedListing } from "../../../lib/listing";

// Depends on the Host header and a per-request database read - never prerendered.
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, slug } = await params;
  const chrome = await getPublicChrome();
  if (chrome === null) return { title: "Directory" };
  const listing = await getPublishedListing(chrome.tenantId, category, slug);
  if (listing === null) return { title: chrome.tenantName };
  return { title: `${listing.name} · ${chrome.tenantName}` };
}

export default async function ListingPage({ params }: PageProps) {
  const { category, slug } = await params;

  const chrome = await getPublicChrome();
  if (chrome === null) notFound();

  const listing = await getPublishedListing(chrome.tenantId, category, slug);
  if (listing === null) notFound();

  // §6.5: the resolver owns badge and perk level. We do not re-derive those
  // from entitlement fields, and we never set tier/status.
  const render = resolvePublicRender(listing.entitlementStatus);
  const fullPerks = render.perks === "full";
  const tierBadge = render.badge === "tier" ? listing.tier : null;
  const provenance = provenanceFromStatus(listing.status);
  const categoryLabel = listing.categoryNames[0] ?? category;

  return (
    <PublicShell
      tenantName={chrome.tenantName}
      categories={chrome.categories}
      searchQuery={null}
      wrapClassName="wrap listing-layout"
    >
      <div>
        <nav aria-label="Breadcrumb">
          <ol className="breadcrumbs">
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href={`/${category}`}>{categoryLabel}</a>
            </li>
            <li>{listing.name}</li>
          </ol>
        </nav>

        {fullPerks ? (
          <div className="hero-ph" role="img" aria-label="Cover image placeholder">
            HERO
          </div>
        ) : null}

        <header className="listing-identity">
          <div className="name-row">
            <h1>{listing.name}</h1>
            {tierBadge !== null ? (
              <span className="badge-row">
                <span className="tier-badge">{tierBadge}</span>
              </span>
            ) : null}
          </div>
          {listing.categoryNames.length > 0 ? (
            <p className="meta">
              <a href={`/${category}`}>{listing.categoryNames.join(", ")}</a>
            </p>
          ) : null}
          {provenance !== null ? <p className="trust">{provenance}</p> : null}
        </header>

        {listing.address.length > 0 ||
        (fullPerks && (listing.email !== null || listing.website !== null || listing.phone !== null)) ? (
          <dl className="contact-dl">
            {listing.address.length > 0 ? (
              <>
                <dt>Address</dt>
                <dd>
                  {listing.address.map((line) => (
                    <div key={line}>{line}</div>
                  ))}
                </dd>
              </>
            ) : null}
            {fullPerks && listing.email !== null ? (
              <>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${listing.email}`}>{listing.email}</a>
                </dd>
              </>
            ) : null}
            {fullPerks && listing.website !== null ? (
              <>
                <dt>Website</dt>
                <dd>
                  <a href={listing.website} rel="nofollow noopener">
                    {listing.website}
                  </a>
                </dd>
              </>
            ) : null}
            {fullPerks && listing.phone !== null ? (
              <>
                <dt>Phone</dt>
                <dd>
                  <a href={`tel:${listing.phone}`}>{listing.phone}</a>
                </dd>
              </>
            ) : null}
          </dl>
        ) : null}

        {fullPerks && listing.description !== null ? (
          <div className="prose">
            <p>{listing.description}</p>
          </div>
        ) : null}

        {fullPerks ? (
          <section className="photo-gallery-block" aria-labelledby="gallery-heading">
            <h2 id="gallery-heading">Photos</h2>
            <ul className="photo-gallery">
              <li>
                <div className="photo-ph" aria-hidden="true">
                  PHOTO
                </div>
              </li>
              <li>
                <div className="photo-ph" aria-hidden="true">
                  PHOTO
                </div>
              </li>
              <li>
                <div className="photo-ph" aria-hidden="true">
                  PHOTO
                </div>
              </li>
              <li>
                <div className="photo-ph" aria-hidden="true">
                  PHOTO
                </div>
              </li>
            </ul>
          </section>
        ) : null}
      </div>
    </PublicShell>
  );
}
