import type { DynamicPageProps, GetStaticPaths } from 'wilson'

interface Props {
  wat: number
}
type Params = 'dir' | 'page'

export const frontmatter = {
  title: 'DynamicPage',
}

export const getStaticPaths: GetStaticPaths = async () => {
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
