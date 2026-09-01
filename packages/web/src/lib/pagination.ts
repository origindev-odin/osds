export const PAGE_SIZE = 20;

/** Parse `?page=`. Invalid, missing, or < 1 becomes 1. */
export function parsePage(raw: string | null): number {
  if (raw === null || raw.trim() === "") return 1;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) return 1;
  return n;
}

export function pageCount(total: number, pageSize: number = PAGE_SIZE): number {
  if (total <= 0) return 1;
  return Math.ceil(total / pageSize);
}

export function clampPage(page: number, totalPages: number): number {
  if (page < 1) return 1;
  if (page > totalPages) return totalPages;
  return page;
}

export function slicePage<T>(
  items: readonly T[],
  page: number,
  pageSize: number = PAGE_SIZE,
): readonly T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

/** Page 1 is the bare path; later pages use `?page=`. */
export function pageHref(basePath: string, page: number): string {
  if (page <= 1) return basePath;
  return `${basePath}?page=${page}`;
}
