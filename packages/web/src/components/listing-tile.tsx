import { resolvePublicRender } from "@osds/core";
import type { EntitlementStatus } from "@osds/core";
import { logoInitials } from "../lib/logo-initials";
import type { ProvenanceLabel } from "../lib/provenance";

export interface ListingTileProps {
  /** Listing detail link, or null to render the name unlinked. */
  readonly href: string | null;
  readonly name: string;
  readonly entitlementStatus: EntitlementStatus;
  /** Tier name; shown only when the §6.5 resolver says the badge is visible. */
  readonly tier: string | null;
  readonly categoryName: string | null;
  readonly locality: string | null;
  readonly provenance: ProvenanceLabel;
  /** When true, hatch shows initials; otherwise the word "Logo". Never an <img>. */
  readonly hasLogo: boolean;
}

/**
 * One listing tile. Same component in the Featured band, category remainder,
 * and search. The tier badge is decided by the §6.5 resolver here.
 */
export function ListingTile(props: ListingTileProps) {
  const { badge } = resolvePublicRender(props.entitlementStatus);
  const showBadge = badge === "tier" && props.tier !== null;
  const hatch = props.hasLogo ? logoInitials(props.name) : "Logo";
  const meta = [props.categoryName, props.locality].filter(
    (part): part is string => part !== null && part.trim() !== "",
  );

  const name =
    props.href !== null ? <a href={props.href}>{props.name}</a> : props.name;

  return (
    <li className="listing-tile">
      <div className="logo-ph" aria-hidden="true">
        {hatch}
      </div>
      <div className="listing-tile-body">
        <p className="listing-name">{name}</p>
        {meta.length > 0 ? <p className="meta">{meta.join(" · ")}</p> : null}
        {showBadge ? (
          <div className="badge-row">
            <span className="tier-badge">{props.tier}</span>
          </div>
        ) : null}
        <p className="trust">{props.provenance}</p>
      </div>
    </li>
  );
}
