import type { ComponentType, RenderableProps } from 'preact'
import PreactRouter from 'preact-router'

interface Page {
  default: ComponentType
  path: string
}

type AppProps = RenderableProps<{ urlToBeRendered?: string }>

const pages: Record<string, Page> = import.meta.glob(
  '/src/pages/**/*.{md,tsx}',
  { eager: true },
)

export default function Router({ urlToBeRendered }: AppProps) {
  return (
    <PreactRouter url={urlToBeRendered}>
      {Object.entries(pages).map(([file, { path, default: Page }]) => {
        return <Page path={path} />
      })}
    </PreactRouter>
  )
}
