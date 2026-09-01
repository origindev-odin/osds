import { notFound } from "next/navigation";
import { resolvePublicRender } from "@osds/core";
import { provenanceLine } from "../../../lib/provenance";
import { getPublishedListing } from "../../../lib/listing";
import { resolveTenantId } from "../../../lib/tenant";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ category: string; slug: string }>;
}

export default async function ListingPage({ params }: PageProps) {
  const { category, slug } = await params;

  const tenantId = await resolveTenantId();
  if (tenantId === null) notFound();

  const listing = await getPublishedListing(tenantId, category, slug);
  if (listing === null) notFound();

  const render = resolvePublicRender(listing.entitlementStatus);
  const tierBadge = render.badge === "tier" ? listing.tier : null;
  const fullPerks = render.perks === "full";
  const gallerySlots = [0, 1, 2, 3];

  return (
    <>
      <nav aria-label="Breadcrumb">
        <ol className="breadcrumbs">
          <li>
            <a href="/">Home</a>
          </li>
          <li>
            <a href={`/${category}`}>{listing.categoryNames[0] ?? category}</a>
          </li>
          <li>{listing.name}</li>
        </ol>
      </nav>

      <h1>{listing.name}</h1>
      {tierBadge !== null ? <p className="badge-row"><span className="tier-badge">{tierBadge}</span></p> : null}
      <p className="trust">{provenanceLine(listing.listingStatus)}</p>
      {listing.categoryNames.length > 0 || listing.locality !== null ? (
        <p className="meta">
          {[listing.categoryNames.join(", "), listing.locality].filter(Boolean).join(" · ")}
        </p>
      ) : null}

      {fullPerks ? (
        <div className="hero-ph" aria-hidden="true">
          Hero
        </div>
      ) : null}

      {listing.address.length > 0 ? (
        <address>
          {listing.address.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </address>
      ) : null}

      {listing.phone !== null ? (
        <p>
          <a href={`tel:${listing.phone}`}>{listing.phone}</a>
        </p>
      ) : null}

      {listing.website !== null ? (
        <p>
          <a href={listing.website} rel="nofollow noopener noreferrer">
            {listing.website}
          </a>
        </p>
      ) : null}

      {fullPerks ? (
        <>
          <section className="photo-gallery-block">
            <h2>Photos</h2>
            <ul className="photo-gallery">
              {gallerySlots.map((_, i) => (
                <li key={i}>
                  <div className="photo-ph" aria-hidden="true">
                    Photo
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2>Description / About</h2>
            {listing.description !== null && listing.description.trim() !== "" ? (
              <p>{listing.description}</p>
            ) : (
              <p>No description yet.</p>
            )}
          </section>
        </>
      ) : null}
    </>
  );
}
