import type { ComponentType, RenderableProps } from 'preact'
import PreactRouter from 'preact-router'
import NotFound from './not-found'

interface Page {
  default: ComponentType
  path: string
}

const pages: Record<string, Page> = import.meta.glob(
  '/src/pages/**/*.{md,tsx}',
  { eager: true },
)

const routes: Array<{
  props: Record<string, any>
  importPath?: string
  component: ComponentType<any>
}> = [
  ...Object.entries(pages).map(([file, { path, default: Page }]) => ({
    importPath: file,
    component: Page,
    props: { path },
  })),
]

// TODO do this via extendRoutes
routes.push({
  component: NotFound,
  props: {
    default: true,
    routes: routes.map(({ component, importPath, props: { path } }) => ({
      path,
      component: component.displayName,
      importPath,
    })),
  },
})

type AppProps = RenderableProps<{ urlToBeRendered?: string }>

export default function Router({ urlToBeRendered }: AppProps) {
  return (
    <PreactRouter url={urlToBeRendered}>
      {routes.map(({ component: Page, props }) => (
        <Page {...props} />
      ))}
    </PreactRouter>
  )
}
