import { describe, expect, it } from "vitest";
import { logoInitials, provenanceLine } from "./provenance";

describe("provenanceLine", () => {
  it("marks claimed listings as owner-verified", () => {
    expect(provenanceLine("claimed")).toBe("owner-verified");
  });

  it("marks everything else as added by editor", () => {
    expect(provenanceLine("unclaimed")).toBe("added by editor");
    expect(provenanceLine("suspended")).toBe("added by editor");
    expect(provenanceLine(null)).toBe("added by editor");
  });
});

describe("logoInitials", () => {
  it("uses two words when present", () => {
    expect(logoInitials("Belmont Ave Plumbing")).toBe("BA");
  });

  it("falls back for a single token", () => {
    expect(logoInitials("Plumbers")).toBe("PL");
  });
});
