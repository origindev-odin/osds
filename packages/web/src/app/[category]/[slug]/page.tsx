import { notFound } from "next/navigation";
import { resolvePublicRender } from "@osds/core";
import { getPublishedListing } from "../../../lib/listing";
import { resolveTenantId } from "../../../lib/tenant";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ category: string; slug: string }>;
}

function descriptionParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);
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
  const showClaim =
    listing.listingStatus !== "claimed" && listing.provenance !== "owner-verified";
  const meta = [listing.routeCategoryName, listing.locality].filter(
    (part): part is string => part !== null && part.trim() !== "",
  );
  const aboutBlocks =
    listing.description !== null ? descriptionParagraphs(listing.description) : [];

  return (
    <main id="main" className="site-main">
      <div className="wrap listing-layout">
        <div>
          <nav aria-label="Breadcrumb">
            <ol className="breadcrumbs">
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <a href={`/${category}`}>{listing.routeCategoryName}</a>
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
              {tierBadge !== null ? <span className="tier-badge">{tierBadge}</span> : null}
            </div>
            {meta.length > 0 ? <p className="meta">{meta.join(" · ")}</p> : null}
            <p className="trust">{listing.provenance}</p>
          </header>

          {fullPerks && aboutBlocks.length > 0 ? (
            <div className="prose">
              {aboutBlocks.map((block, index) => (
                <p key={index}>{block}</p>
              ))}
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

          {listing.hours.length > 0 ? (
            <section>
              <h2>Hours</h2>
              <ul className="hours-list">
                {listing.hours.map((line) => (
                  <li key={line.label}>
                    <span>{line.label}</span>
                    <span>{line.value}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="listing-aside">
          <div className="panel">
            <h2>Contact</h2>
            <dl className="contact-dl">
              {listing.phone !== null ? (
                <>
                  <dt>Phone</dt>
                  <dd>
                    <a href={`tel:${listing.phone}`}>{listing.phone}</a>
                  </dd>
                </>
              ) : null}
              {listing.website !== null ? (
                <>
                  <dt>Website</dt>
                  <dd>
                    <a href={listing.website} rel="nofollow noopener">
                      {listing.website}
                    </a>
                  </dd>
                </>
              ) : null}
              {listing.address.length > 0 ? (
                <>
                  <dt>Address</dt>
                  <dd>
                    <address>
                      {listing.address.map((line) => (
                        <div key={line}>{line}</div>
                      ))}
                    </address>
                  </dd>
                </>
              ) : null}
            </dl>
          </div>

          {showClaim ? (
            <div className="panel claim-cta">
              <h2>Own this business?</h2>
              <p>This listing was added by an editor. Claiming lets you update it after review.</p>
              <a className="btn btn-primary btn-block" href={`/${category}/${slug}/claim`}>
                Claim this listing
              </a>
            </div>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
