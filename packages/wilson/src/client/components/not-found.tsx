const data = {}

export default function NotFound(props: { routes: any[] }) {
  return (
    <div className="not-found">
      <h1>Page Not Found</h1>
      <dl>
        <dt>document.location.pathname</dt>
        <dd>{document.location.pathname}</dd>
      </dl>
      <dl>
        <dt>Routes</dt>
        <dd>
          <pre>{JSON.stringify(props.routes, null, 2)}</pre>
        </dd>
      </dl>
    </div>
  )
}
