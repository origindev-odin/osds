import { describe, it, expect } from "vitest";
import { escapeHtml } from "./html";

describe("escapeHtml", () => {
  it("escapes markup and quotes", () => {
    expect(escapeHtml(`<img src="x" onerror='y'>`)).toBe(
      "&lt;img src=&quot;x&quot; onerror=&#39;y&#39;&gt;",
    );
  });
});
