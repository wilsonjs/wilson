import { FunctionComponent, RenderableProps } from 'preact'
import type { ViteDevServer } from 'vite'
import type { createApi } from './api'

// these virtual module ids should not have slashes in them, because
// module resolution of modules imported in them is harder otherwise.
export const ROUTES_MODULE_ID = 'virtual:wilson-routes'
export const RESOLVED_ROUTES_MODULE_ID = '\0' + ROUTES_MODULE_ID + '.tsx'
export const DATA_MODULE_ID = 'virtual:wilson-route-data'
export const RESOLVED_DATA_MODULE_ID = '\0' + DATA_MODULE_ID + '.tsx'

export type Awaitable<T> = T | Promise<T>

export type Page = {
  /**
   * React-router route path
   */
  route: string
  /**
   * Path of the page relative to the `pagesDir`
   */
  path: string
  /**
   * Path of the page relative to the `srcDir`
   */
  srcPath: string
  /**
   * Path of the page relative to the site root
   */
  rootPath: string
  /**
   * Absolute path of the page
   */
  absolutePath: string
  /**
   * Is the page dynamic?
   */
  isDynamic: boolean
  /**
   * The page's file extension
   */
  fileExtension: string
  /**
   * The page's component name
   */
  componentName: string
  /**
   *
   */
  renderedPaths: RenderedPath[]
  frontmatter: RawPageMatter
}

/**
 * The definition of a route in Wilson, used to render pages.
 *
 * By default most routes would be inferred from files in the `pagesDir`, but a
 * user might provide custom routes using the `extendRoutes` hook.
 */
export type Route = {
  /**
   * The route's path
   */
  path: string
  /**
   * Name of the route's component
   */
  componentName: string
  /**
   * Path to import the route's component
   */
  importPath: string
  // /**
  //  * Additional paths for the page, that behave like a copy of the route.
  //  * When building the site, each path will be rendered separately.
  //  */
  // alias?: string | string[];
  // /**
  //  * Frontmatter associated with the page.
  //  */
  // frontmatter: RawPageMatter;
}

/**
 * Options specific to this plugin
 */
export interface PagesOptions {
  /**
   * Specify the pages directory (relative to srcDir).
   * @default 'pages'
   */
  pagesDir: string
  /**
   * Allowed extensions of page files.
   */
  pageExtensions: string[]
  // /**
  //  * Use this hook to modify the frontmatter for pages and MDX files.
  //  * See `extendRoute` if you only want to modify route information.
  //  */
  // extendFrontmatter?: (
  //   frontmatter: RawPageMatter,
  //   filename: string
  // ) => Awaitable<RawPageMatter | void>
  // /**
  //  * Use this hook to modify route
  //  * See `extendFrontmatter` if you want to add metadata.
  //  */
  // extendRoute?: (route: PageRoute) => Awaitable<PageRoute | void>
  /**
   * Use this hook to access the generated routes, and optionally modify them.
   */
  extendRoutes?: (routes: Route[]) => Awaitable<Route[] | void>
}

/**
 * Options this plugin is invoked with.
 */
export interface Options extends PagesOptions {
  /**
   * The root of the project.
   */
  root: string
  /**
   * Specify the directory where the app source is located (relative to project root).
   * @default 'src'
   */
  srcDir: string
  /**
   * Vite dev server instance
   */
  server?: ViteDevServer
}

export type DynamicPageExports = {
  getRenderedPaths: () => GetRenderedPathsResult[]
  default: FunctionComponent
}

export type GetRenderedPathsResult<
  Params extends string = string,
  Props extends Record<string, any> = Record<string, any>
> = SpecificParams<Params> & InjectedProps<Props>

export type RenderedPath = GetRenderedPathsResult & { url: string }

type SpecificParams<Params extends string> = {
  params: Record<Params, string>
}

type InjectedProps<Props extends Record<string, any>> = {
  props?: Props
}

type RoutingInfo = {
  path: string
  url: string
}

export type StaticPageProps = RenderableProps<RoutingInfo>

export type DynamicPageProps<
  Params extends string,
  Props extends Record<string, any> = Record<string, any>
> = RenderableProps<RoutingInfo & SpecificParams<Params> & Props>

//
//
// unchecked |
//           |
//           V
//
//
export type PagesApi = ReturnType<typeof createApi>

export interface PageFrontmatter extends Record<string, any> {}

export interface RawPageMatter extends PageFrontmatter {
  meta: PageMeta
  layout: false | string
  route: {
    name?: string
    path?: string
    redirect?: string
    alias?: string | string[]
  }
}

export interface PageMeta extends Record<string, any> {
  filename: string
  href: string
}
