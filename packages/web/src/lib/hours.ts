export interface HoursLine {
  readonly label: string;
  readonly value: string;
}

/**
 * Best-effort read of `listings.attributes.hours`. Seed stores `{}`; unknown
 * shapes are ignored rather than invented.
 */
export function hoursLines(attributes: unknown): readonly HoursLine[] {
  if (typeof attributes !== "object" || attributes === null) return [];
  if (!("hours" in attributes)) return [];
  const hours = attributes.hours;
  if (hours === null || hours === undefined) return [];
  if (typeof hours === "string") {
    const value = hours.trim();
    return value === "" ? [] : [{ label: "Hours", value }];
  }
  if (Array.isArray(hours)) {
    const lines: HoursLine[] = [];
    for (const entry of hours) {
      if (typeof entry === "string") {
        const value = entry.trim();
        if (value !== "") lines.push({ label: "Hours", value });
        continue;
      }
      if (typeof entry !== "object" || entry === null) continue;
      const rec = entry as Record<string, unknown>;
      const labelRaw = rec["day"] ?? rec["label"] ?? rec["name"];
      const valueRaw = rec["hours"] ?? rec["value"] ?? rec["time"];
      if (typeof labelRaw !== "string" || typeof valueRaw !== "string") continue;
      const label = labelRaw.trim();
      const value = valueRaw.trim();
      if (label === "" || value === "") continue;
      lines.push({ label, value });
    }
    return lines;
  }
  if (typeof hours === "object") {
    const lines: HoursLine[] = [];
    for (const [labelRaw, valueRaw] of Object.entries(hours)) {
      if (typeof valueRaw !== "string") continue;
      const label = labelRaw.trim();
      const value = valueRaw.trim();
      if (label === "" || value === "") continue;
      lines.push({ label, value });
    }
    return lines;
  }
  return [];
}
