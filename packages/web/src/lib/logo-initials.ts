/** Two-letter hatch for the tile logo square when a logo exists. */
export function logoInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter((w) => w.length > 0);
  const first = words[0];
  if (first === undefined) return "Logo";
  const second = words[1];
  if (second === undefined) {
    const letters = first.replace(/[^A-Za-z0-9]/g, "");
    if (letters.length >= 2) return letters.slice(0, 2).toUpperCase();
    if (letters.length === 1) return letters.toUpperCase();
    return "Logo";
  }
  const a = first.replace(/[^A-Za-z0-9]/g, "")[0];
  const b = second.replace(/[^A-Za-z0-9]/g, "")[0];
  if (a === undefined || b === undefined) return "Logo";
  return (a + b).toUpperCase();
}
