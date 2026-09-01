export function SiteHeader(props: { readonly tenantName: string }) {
  return (
    <header className="site-header">
      <div className="wrap site-header-inner">
        <a className="wordmark" href="/">
          {props.tenantName}
        </a>
        <form className="compact-search" method="get" action="/search" role="search">
          <label className="visually-hidden" htmlFor="header-q">
            Keywords
          </label>
          <input id="header-q" type="search" name="q" placeholder="Search listings" />
          <button type="submit">Search</button>
        </form>
        <a href="/account">Owner sign in</a>
      </div>
    </header>
  );
}
