import { resolvePublicRender } from "@osds/core";
import type { EntitlementStatus } from "@osds/core";

/** listings.status — claim state, not entitlement. */
export type ListingClaimStatus = "unclaimed" | "claimed" | "suspended";

/**
 * Provenance is text, never a badge. Only emit copy when we have claim status;
 * do not invent "Owner-verified" without it.
 */
export function provenanceFromStatus(
  status: ListingClaimStatus | null | undefined,
): string | null {
  if (status === "claimed") return "Owner-verified";
  if (status === "unclaimed") return "Added by editor";
  return null;
}

export interface ListingTileProps {
  readonly href: string | null;
  readonly name: string;
  readonly entitlementStatus: EntitlementStatus;
  readonly tier: string | null;
  readonly categories: readonly string[];
  readonly locality: string | null;
  readonly provenance: string | null;
  readonly headingLevel: 2 | 3;
}

function metaLine(categories: readonly string[], locality: string | null): string | null {
  const parts: string[] = [];
  if (categories.length > 0) parts.push(categories.join(", "));
  if (locality !== null && locality.trim() !== "") parts.push(locality);
  return parts.length > 0 ? parts.join(" · ") : null;
}

/**
 * One listing card. Same component in the Featured band, the organic list, and
 * search. The LOGO square is identity, not a perk. The tier pill is the only
 * badge, and only when resolvePublicRender says so. No Featured label here.
 */
export function ListingTile(props: ListingTileProps) {
  const { badge } = resolvePublicRender(props.entitlementStatus);
  const showTier = badge === "tier" && props.tier !== null;
  const Heading = props.headingLevel === 2 ? "h2" : "h3";
  const meta = metaLine(props.categories, props.locality);

  return (
    <article className="listing-tile">
      <div className="logo-ph" aria-hidden="true">
        LOGO
      </div>
      <div className="listing-tile-body">
        <div className="listing-tile-top">
          <Heading className="listing-name">
            {props.href !== null ? <a href={props.href}>{props.name}</a> : props.name}
          </Heading>
          {showTier ? <span className="tier-badge">{props.tier}</span> : null}
        </div>
        {meta !== null ? <p className="meta">{meta}</p> : null}
        {props.provenance !== null ? <p className="trust">{props.provenance}</p> : null}
      </div>
    </article>
  );
}
