import { notFound } from "next/navigation";
import { resolvePublicRender } from "@osds/core";
import { getPublishedListing } from "../../../lib/listing";
import { resolveTenantId } from "../../../lib/tenant";

// Depends on the Host header and a per-request database read - never prerendered.
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

  // §6.5: the resolver owns badge, featured, and perks. Do not re-derive them.
  const render = resolvePublicRender(listing.entitlementStatus);
  const tierBadge = render.badge === "tier" ? listing.tier : null;
  const fullPerks = render.perks === "full";
  const meta = [listing.routeCategoryName, listing.locality].filter(
    (part): part is string => part !== null && part.trim() !== "",
  );
  const aboutBlocks =
    listing.description !== null ? descriptionParagraphs(listing.description) : [];

  return (
    <main id="main" className="wrap site-main">
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

      <div className="listing-layout">
        <div>
          <div className="listing-identity">
            <div className="name-row">
              <h1>{listing.name}</h1>
              {tierBadge !== null ? <span className="tier-badge">{tierBadge}</span> : null}
            </div>
            {meta.length > 0 ? <p className="meta">{meta.join(" · ")}</p> : null}
            <p className="trust">{listing.provenance}</p>
          </div>

          {fullPerks ? (
            <>
              <div className="hero-ph" aria-hidden="true">
                Cover photo
              </div>
              <div className="photo-gallery-block">
                <h2>Photos</h2>
                <ul className="photo-gallery">
                  <li className="photo-ph" aria-hidden="true">
                    Photo
                  </li>
                  <li className="photo-ph" aria-hidden="true">
                    Photo
                  </li>
                  <li className="photo-ph" aria-hidden="true">
                    Photo
                  </li>
                  <li className="photo-ph" aria-hidden="true">
                    Photo
                  </li>
                </ul>
              </div>
              <section>
                <h2>Description / About</h2>
                {aboutBlocks.length > 0 ? (
                  <div className="prose">
                    {aboutBlocks.map((block, index) => (
                      <p key={index}>{block}</p>
                    ))}
                  </div>
                ) : (
                  <div className="hero-ph" aria-hidden="true">
                    About
                  </div>
                )}
              </section>
            </>
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

          {listing.address.length > 0 ? (
            <section>
              <h2>Address</h2>
              <address>
                {listing.address.map((line) => (
                  <div key={line}>{line}</div>
                ))}
              </address>
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
            </dl>
          </div>
        </aside>
      </div>
    </main>
  );
}
