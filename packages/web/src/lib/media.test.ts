import { describe, it, expect } from "vitest";
import { listingHasLogo } from "./media";

describe("listingHasLogo", () => {
  it("is false for the seed empty media object", () => {
    expect(listingHasLogo({ logo: null, cover: null, gallery: [] })).toBe(false);
  });

  it("is true for a non-empty logo string", () => {
    expect(listingHasLogo({ logo: "https://example.com/logo.png" })).toBe(true);
  });
});
