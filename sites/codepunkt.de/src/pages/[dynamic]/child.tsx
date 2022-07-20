import type { DynamicPageProps, GetRenderedPathsResult } from 'wilson'

interface Props {}
type Params = 'dynamic'

export function getRenderedPaths(): GetRenderedPathsResult<Params, Props>[] {
  return [{ params: { dynamic: 'foo' } }]
}

export default function Page(props: DynamicPageProps<Params, Props>) {
  return (
    <>
      <h1>Dynamic</h1>
      <pre>{JSON.stringify(props, null, 2)}</pre>
    </>
  )
}
