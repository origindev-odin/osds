import { resolvePublicRender } from "@osds/core";
import type { EntitlementStatus } from "@osds/core";
import { logoInitials, provenanceLine } from "../lib/provenance";

export interface ListingTileProps {
  /** Listing detail link, or null to render the name unlinked. */
  readonly href: string | null;
  readonly name: string;
  readonly entitlementStatus: EntitlementStatus;
  /** Tier name; shown only when the §6.5 resolver says the badge is visible. */
  readonly tier: string | null;
  /** Listing status: claimed → owner-verified, else added by editor. */
  readonly listingStatus?: string | null;
  /** Category names, shown with locality. Omit to hide. */
  readonly categories?: readonly string[];
  /** Locality, shown after category. Omit or pass null to hide. */
  readonly locality?: string | null;
}

/**
 * One listing tile. Same component in the Featured band, category remainder,
 * and search. The tier badge is decided by resolvePublicRender — never a
 * Featured label on the tile. Logo placeholder is identity, not a perk.
 */
export function ListingTile(props: ListingTileProps) {
  const { badge } = resolvePublicRender(props.entitlementStatus);
  const showBadge = badge === "tier" && props.tier !== null;
  const meta = [props.categories?.[0], props.locality].filter(
    (part): part is string => part !== undefined && part !== null && part !== "",
  );
  const initials = logoInitials(props.name);

  return (
    <li className="listing-tile">
      <div className="logo-ph" aria-hidden="true">
        {initials}
      </div>
      <div className="listing-tile-body">
        <div className="listing-tile-top">
          <h3 className="listing-name">
            {props.href !== null ? <a href={props.href}>{props.name}</a> : props.name}
          </h3>
          {showBadge ? <span className="tier-badge">{props.tier}</span> : null}
        </div>
        {meta.length > 0 ? <p className="meta">{meta.join(" · ")}</p> : null}
        <p className="trust">{provenanceLine(props.listingStatus)}</p>
      </div>
    </li>
  );
}
