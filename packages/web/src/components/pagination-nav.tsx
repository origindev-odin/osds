import { pageHref } from "../lib/pagination";

export function PaginationNav(props: {
  readonly basePath: string;
  readonly page: number;
  readonly totalPages: number;
}) {
  if (props.totalPages <= 1) return null;

  const pages: number[] = [];
  for (let n = 1; n <= props.totalPages; n++) pages.push(n);

  return (
    <nav aria-label="Pagination">
      <ol className="pagination">
        {pages.map((n) => (
          <li key={n}>
            {n === props.page ? (
              <span aria-current="page">{n}</span>
            ) : (
              <a href={pageHref(props.basePath, n)}>{n}</a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
