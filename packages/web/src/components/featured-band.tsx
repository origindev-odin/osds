import { ListingTile, type ListingTileProps } from "./listing-tile";

/**
 * Placement region: a Featured heading plus ordinary tiles. Omit entirely when
 * there is nobody to place (locked unsold / no featuredPlacement). No gold,
 * no restyle, no "Sponsored."
 */
export function FeaturedBand(props: { readonly listings: readonly ListingTileProps[] }) {
  if (props.listings.length === 0) return null;

  return (
    <section className="featured-band" aria-labelledby="featured-heading">
      <h2 className="band-heading" id="featured-heading">
        Featured
      </h2>
      <ul className="listing-grid">
        {props.listings.map((listing) => (
          <li key={listing.href ?? listing.name}>
            <ListingTile
              href={listing.href}
              name={listing.name}
              entitlementStatus={listing.entitlementStatus}
              tier={listing.tier}
              categories={listing.categories}
              locality={listing.locality}
              provenance={listing.provenance}
              headingLevel={listing.headingLevel}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
