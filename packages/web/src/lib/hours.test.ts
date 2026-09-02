import { describe, it, expect } from "vitest";
import { hoursLines } from "./hours";

describe("hoursLines", () => {
  it("returns nothing for missing or empty hours", () => {
    expect(hoursLines(null)).toEqual([]);
    expect(hoursLines({})).toEqual([]);
    expect(hoursLines({ hours: {} })).toEqual([]);
  });

  it("reads a day → hours map", () => {
    expect(
      hoursLines({ hours: { Monday: "7:00–17:00", Sunday: "Closed" } }),
    ).toEqual([
      { label: "Monday", value: "7:00–17:00" },
      { label: "Sunday", value: "Closed" },
    ]);
  });
});
