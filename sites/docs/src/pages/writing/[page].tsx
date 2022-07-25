import type { DynamicPageProps, GetRenderedPathsResult } from 'wilson'

interface Props {
  wat: number
}
type Params = 'page'

export function getRenderedPaths(): GetRenderedPathsResult<Params, Props>[] {
  return [
    { params: { page: 'foo' } },
    { params: { page: 'bar' }, props: { wat: 6 } },
  ]
}

export default function Page(props: DynamicPageProps<Params, Props>) {
  return (
    <>
      <h1>Paginated writing</h1>
      <pre>{JSON.stringify(props, null, 2)}</pre>
      <div>{props.url}</div>
      <div>{props.path}</div>
      <div>{props.params.page}</div>
      <div>{props.wat}</div>
    </>
  )
}
