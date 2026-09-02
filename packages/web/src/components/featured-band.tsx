import type { ReactNode } from "react";

/** Placement region. Omit the whole band when there is nothing to put in it. */
export function FeaturedBand({ children }: { children: ReactNode }) {
  return (
    <section className="featured-band" aria-labelledby="featured-heading">
      <h2 id="featured-heading" className="band-heading">
        Featured
      </h2>
      {children}
    </section>
  );
}
