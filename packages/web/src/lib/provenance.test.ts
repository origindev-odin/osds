import { describe, it, expect } from "vitest";
import { provenanceLabel } from "./provenance";

describe("provenanceLabel", () => {
  it("claimed listings are owner-verified", () => {
    expect(provenanceLabel("claimed", null)).toBe("owner-verified");
  });

  it("unclaimed listings are added by editor", () => {
    expect(provenanceLabel("unclaimed", null)).toBe("added by editor");
  });

  it("an owner_user_id counts as owner-verified", () => {
    expect(provenanceLabel("unclaimed", "usr_abc")).toBe("owner-verified");
  });

  it("suspended without an owner is added by editor", () => {
    expect(provenanceLabel("suspended", null)).toBe("added by editor");
  });
});
