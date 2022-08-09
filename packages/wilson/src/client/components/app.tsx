import type { ComponentType, RenderableProps } from 'preact'
import Router from 'preact-router'
import Meta from './meta'
import routes from 'virtual:wilson-routes'

interface Page {
  default: ComponentType
  path: string
}

type AppProps = RenderableProps<{ urlToBeRendered?: string }>

export default function App({ urlToBeRendered }: AppProps) {
  const markdownPages: Record<string, Page> = import.meta.glob(
    '/src/pages/**/*.md',
    { eager: true },
  )

  return (
    <>
      <Meta />
      <Router url={urlToBeRendered}>
        {Object.entries(markdownPages).map(
          ([file, { path, default: Page }]) => {
            return <Page path={path} />
          },
        )}
        {routes}
      </Router>
    </>
  )
}
