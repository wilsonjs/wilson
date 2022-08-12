import type { ComponentType, RenderableProps } from 'preact'
import Router from 'preact-router'
import Meta from './meta'

interface Page {
  default: ComponentType
  path: string
}

type AppProps = RenderableProps<{ urlToBeRendered?: string }>

export default function App({ urlToBeRendered }: AppProps) {
  const pages: Record<string, Page> = import.meta.glob(
    '/src/pages/**/*.{md,tsx}',
    { eager: true },
  )

  return (
    <>
      <Meta />
      <Router url={urlToBeRendered}>
        {Object.entries(pages).map(([file, { path, default: Page }]) => {
          return <Page path={path} />
        })}
      </Router>
    </>
  )
}
