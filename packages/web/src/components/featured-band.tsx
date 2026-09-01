import type { ReactNode } from "react";

/**
 * Featured is a placement region. Ordinary ListingTile children go inside.
 * Omit this component entirely when there is nothing to show (locked unsold).
 */
export function FeaturedBand(props: { readonly children: ReactNode }) {
  return (
    <section className="featured-band" aria-labelledby="featured-heading">
      <h2 id="featured-heading" className="band-heading">
        Featured
      </h2>
      {props.children}
    </section>
  );
}
