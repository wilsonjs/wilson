import type { DynamicPageProps, GetStaticPaths } from 'wilson'

interface Props {
  wat: number
}
type Params = 'page'

export const frontmatter = {
  title: 'DynamicWritingPage',
}

export const getStaticPaths: GetStaticPaths = async () => {
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
    </>
  )
}
