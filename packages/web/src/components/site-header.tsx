export function SiteHeader(props: {
  readonly tenantName: string;
  readonly searchQuery: string | null;
}) {
  return (
    <header className="site-header">
      <div className="wrap site-header-inner">
        <a className="wordmark" href="/">
          {props.tenantName}
          <small>Directory</small>
        </a>
        <form className="compact-search" method="get" action="/search" role="search">
          <label className="visually-hidden" htmlFor="q-header">
            Keywords
          </label>
          <input
            id="q-header"
            type="search"
            name="q"
            placeholder="Search listings"
            defaultValue={props.searchQuery ?? ""}
          />
          <button type="submit">Search</button>
        </form>
      </div>
    </header>
  );
}
