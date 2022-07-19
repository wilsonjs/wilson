import type { DynamicPageProps, RenderedPathInfo } from 'wilson'

type PageProps = DynamicPageProps<'page'>

export function getRenderedPaths(): RenderedPathInfo<'page'>[] {
  return [{ params: { page: 'foo' } }, { params: { page: 'bar' }, props: { hu1h: 1234 } }]
}

export default function Page(props: PageProps) {
  return (
    <>
      <h1>Paginated writing</h1>
      <pre>{JSON.stringify(props, null, 2)}</pre>
      <div>{props.url}</div>
      {/** @ts-ignore */}
      <div>{props.path}</div>
      <div>{props.params.page}</div>
      {/** @ts-ignore */}
      <div>{props.huah}</div>
    </>
  )
}
