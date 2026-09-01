import { describe, it, expect } from "vitest";
import { logoInitials } from "./logo-initials";

describe("logoInitials", () => {
  it("uses the first letter of the first two words", () => {
    expect(logoInitials("Hoffman Plumbing")).toBe("HP");
    expect(logoInitials("Northside Electric")).toBe("NE");
  });

  it("falls back to two letters of a single word", () => {
    expect(logoInitials("Acme")).toBe("AC");
  });

  it("returns Logo for an empty name", () => {
    expect(logoInitials("")).toBe("Logo");
    expect(logoInitials("   ")).toBe("Logo");
  });
});
