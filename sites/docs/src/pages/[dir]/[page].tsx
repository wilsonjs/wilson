import type { DynamicPageProps, GetRenderedPathsResult } from 'wilson'

interface Props {
  wat: number
}
type Params = 'dir' | 'page'

export function getRenderedPaths(): GetRenderedPathsResult<Params, Props>[] {
  return [
    { params: { dir: 'foo', page: 'bar' } },
    { params: { dir: 'qux', page: 'quux' }, props: { wat: 6 } },
  ]
}

export default function Page(props: DynamicPageProps<Params, Props>) {
  return (
    <>
      <h1>DirPage</h1>
      <pre>{JSON.stringify(props, null, 2)}</pre>
    </>
  )
}
