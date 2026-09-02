/** True when listings.media.logo is a non-empty string. Tiles never render <img>. */
export function listingHasLogo(media: unknown): boolean {
  if (typeof media !== "object" || media === null) return false;
  if (!("logo" in media)) return false;
  const logo = media.logo;
  return typeof logo === "string" && logo.trim() !== "";
}
