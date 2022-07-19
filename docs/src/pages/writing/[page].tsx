import type { DynamicPageProps, GetRenderedPathsResult } from 'wilson'

type Props = { wat: number }

export function getRenderedPaths(): GetRenderedPathsResult<'page', Props>[] {
  return [{ params: { page: 'foo' } }, { params: { page: 'bar' }, props: { wat: 6 } }]
}

export default function Page(props: DynamicPageProps<'page', Props>) {
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
