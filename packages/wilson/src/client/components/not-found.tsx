import data from "virtual:wilson-route-data";

export default function NotFound() {
  return (
    <div className="not-found">
      <h1>Page Not Found</h1>
      <dl>
        <dt>Path</dt>
        <dd>{document.location.pathname}</dd>
      </dl>
      <dl>
        <dt>Routes</dt>
        <dd>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </dd>
      </dl>
    </div>
  );
}
