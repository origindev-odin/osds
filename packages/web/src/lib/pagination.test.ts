import { describe, it, expect } from "vitest";
import { parsePage, pageCount, clampPage, slicePage, pageHref, PAGE_SIZE } from "./pagination";

describe("parsePage", () => {
  it("defaults missing or blank to 1", () => {
    expect(parsePage(null)).toBe(1);
    expect(parsePage("")).toBe(1);
    expect(parsePage("  ")).toBe(1);
  });

  it("rejects non-integers and values below 1", () => {
    expect(parsePage("0")).toBe(1);
    expect(parsePage("-2")).toBe(1);
    expect(parsePage("1.5")).toBe(1);
    expect(parsePage("foo")).toBe(1);
  });

  it("accepts whole numbers from 1", () => {
    expect(parsePage("1")).toBe(1);
    expect(parsePage("3")).toBe(3);
  });
});

describe("pageCount / clampPage / slicePage", () => {
  it("counts pages from a 20-item page size", () => {
    expect(PAGE_SIZE).toBe(20);
    expect(pageCount(0)).toBe(1);
    expect(pageCount(20)).toBe(1);
    expect(pageCount(21)).toBe(2);
  });

  it("clamps out-of-range pages", () => {
    expect(clampPage(0, 3)).toBe(1);
    expect(clampPage(9, 3)).toBe(3);
  });

  it("slices the requested page", () => {
    const items = [1, 2, 3, 4, 5];
    expect(slicePage(items, 1, 2)).toEqual([1, 2]);
    expect(slicePage(items, 3, 2)).toEqual([5]);
  });
});

describe("pageHref", () => {
  it("omits ?page= on page 1", () => {
    expect(pageHref("/plumbers", 1)).toBe("/plumbers");
    expect(pageHref("/plumbers", 2)).toBe("/plumbers?page=2");
  });
});
