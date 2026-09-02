/**
 * Public provenance line (spec §4.1.1). Claimed listings are owner-verified;
 * unclaimed (and anything else) are added by editor. `owner_user_id` is a
 * second signal: an assigned owner is treated as claimed even if status lags.
 */
export type ProvenanceLabel = "owner-verified" | "added by editor";

export type ListingClaimStatus = "unclaimed" | "claimed" | "suspended";

export function provenanceLabel(
  status: ListingClaimStatus,
  ownerUserId: string | null,
): ProvenanceLabel {
  if (status === "claimed" || ownerUserId !== null) return "owner-verified";
  return "added by editor";
}
