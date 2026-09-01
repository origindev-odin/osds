/**
 * Spec §4.1.1 trust display. Provenance is a text line, never a badge.
 * Claimed listings are owner-verified; everything else is added by editor.
 */
export type ProvenanceLine = "owner-verified" | "added by editor";

export function provenanceLine(status: string | null | undefined): ProvenanceLine {
  return status === "claimed" ? "owner-verified" : "added by editor";
}

/** Two-letter initials for the tile logo hatch when no image exists. */
export function logoInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((p) => p.length > 0);
  if (parts.length === 0) return "Logo";
  if (parts.length === 1) {
    const word = parts[0]!;
    return word.slice(0, 2).toUpperCase();
  }
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}
