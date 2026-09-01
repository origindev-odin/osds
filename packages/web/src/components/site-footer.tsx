import type { HomeCategory } from "../lib/home";

export function SiteFooter(props: {
  readonly tenantName: string;
  readonly categories: readonly HomeCategory[];
}) {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <p className="footer-identity">{props.tenantName}</p>
        {props.categories.length > 0 ? (
          <ul className="footer-cats">
            {props.categories.map((category) => (
              <li key={category.slug}>
                <a href={`/${category.slug}`}>{category.name}</a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </footer>
  );
}
