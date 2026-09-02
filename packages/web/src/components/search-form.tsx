export function SearchForm(props: {
  readonly q: string;
  readonly near: string;
  readonly radiusKm: string;
  readonly advancedOpen: boolean;
  readonly nearInvalid: boolean;
  readonly idPrefix: string;
}) {
  const prefix = props.idPrefix;
  const qId = `${prefix}q`;
  const nearId = `${prefix}near`;
  const radiusId = `${prefix}radius_km`;
  const nearErrId = `${prefix}near-err`;
  const nearInvalid = props.nearInvalid;
  const advancedOpen = props.advancedOpen || nearInvalid || props.near !== "";

  return (
    <form className="form-stack" method="get" action="/search">
      <div className="field">
        <label htmlFor={qId}>Search listings</label>
        <input id={qId} type="search" name="q" defaultValue={props.q} />
      </div>
      <details className="advanced" {...(advancedOpen ? { open: true } : {})}>
        <summary>Advanced: near (coordinates)</summary>
        <div className="advanced-grid">
          <div className="field">
            <label htmlFor={nearId}>Near (lat,lon)</label>
            <input
              id={nearId}
              type="text"
              name="near"
              defaultValue={props.near}
              inputMode="decimal"
              autoComplete="off"
              {...(nearInvalid ? { "aria-invalid": true as const } : {})}
              aria-describedby={nearErrId}
            />
            <p id={nearErrId} className="hint">
              Coordinates only. A city or ZIP will fail.
            </p>
          </div>
          <div className="field">
            <label htmlFor={radiusId}>Radius (km)</label>
            <input
              id={radiusId}
              type="number"
              name="radius_km"
              defaultValue={props.radiusKm === "" ? "25" : props.radiusKm}
              min={1}
              step="any"
            />
          </div>
        </div>
      </details>
      <p>
        <button className="btn btn-primary" type="submit">
          Search
        </button>
      </p>
    </form>
  );
}
