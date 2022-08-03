import type { UserConfig as ViteOptions } from 'vite'
import type { FunctionComponent, RenderableProps } from 'preact'

export type Awaitable<T> = T | Promise<T>

/**
 * User config, defined in `wilson.config.ts`
 */
export interface UserConfig {
  /**
   * URL for site in production, used to generate absolute URLs for sitemap.xml
   * and social meta tags. Available as `site.url` and `site.canonical`.
   * @type {string}
   */
  siteUrl?: string
  /**
   * Whether to output more information about wilson in development.
   * @default true
   */
  debug?: boolean
  /**
   * Whether to skip `.html` in hrefs and router paths.
   * @default true
   */
  prettyUrls?: boolean
  /**
   * Specify the output directory (relative to project root).
   * @default 'dist'
   */
  outDir?: string
  /**
   * Specify the pages directory (relative to srcDir).
   * @default 'pages'
   */
  pagesDir?: string
  /**
   * Specify the layouts directory (relative to srcDir).
   * @default 'layouts'
   */
  layoutsDir?: string
  /**
   * Specify the islands directory (relative to srcDir).
   * @default 'islands'
   */
  islandsDir?: string
  /**
   * Specify the directory where the app source is located (relative to project root).
   * @default 'src'
   */
  srcDir?: string
  /**
   * Specify the directory where temporary files during build are stored.
   */
  tempDir?: string
  /**
   * Specify the directory to nest generated assets under (relative to outDir).
   * @default 'assets'
   */
  assetsDir?: string
  /**
   * Whether to display drafts in documents and pages.
   */
  drafts?: boolean
  /**
   * File extensions that are allowed as pages.
   */
  pageExtensions?: string[]
  /**
   * Used to access and optionally modify the generated routes.
   */
  extendRoutes?: (routes: Route[]) => Awaitable<Route[] | void>
}

/**
 * Site config used at runtime.
 *
 * Based on `wilson.config.ts` on top of default values, enriched with some runtime computations.
 */
export interface SiteConfig extends Required<UserConfig> {
  /**
   * Folder the site is hosted in. Determined based on `siteUrl` at runtime, useful when the site is hosted inside a folder like `https://example.com/site`.
   * @default '/'
   */
  base: string
  /**
   * Path to project root, determined at runtime.
   */
  root: string
  /**
   * Path to configuration file, determined at runtime.
   */
  configPath: string
  /**
   * Vite options.
   */
  vite: ViteOptions
  /**
   * The mode the app is running in, typically `development` or `production`.
   */
  mode: string
}

export interface Page {
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
   * Import path of the page relative to the site root
   */
  importPath: string
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
  frontmatter: PageFrontmatter
}

/**
 * Representation of an interactive island
 */
export interface Island {
  /**
   * Unique id
   */
  id: string
  /**
   * Script that is executed to hydrate the island
   */
  hydrationScript: string
  /**
   * Path to the island component
   */
  componentPath: string
  /**
   * The resulting island filename
   */
  entryFilename?: string
}

/**
 * Maps page paths to an array of island definitions.
 */
export type IslandsByPath = Record<string, Island[]>

/**
 * The definition of a route in Wilson, used to render pages.
 *
 * By default most routes would be inferred from files in the `pagesDir`, but a
 * user can provide custom routes using the `extendRoutes` hook.
 */
export type Route = Pick<Page, 'componentName' | 'importPath' | 'route'>

//  * Additional paths for the page, that behave like a copy of the route.
// /**
//  * When building the site, each path will be rendered separately.
//  */
// alias?: string | string[];

export interface UserFrontmatter {
  [key: string]: string | object | undefined
}

export interface PageFrontmatter extends Record<string, any> {
  meta: PageMeta
  layout: string | undefined
  // route: {
  //   name?: string
  //   path?: string
  //   redirect?: string
  //   alias?: string | string[]
  // }
}

export interface PageMeta extends Record<string, any> {
  filename: string
  lastUpdated: Date
}

export interface StaticPageExports {
  default: FunctionComponent
  frontmatter?: UserFrontmatter
}

export interface DynamicPageExports extends StaticPageExports {
  getRenderedPaths: () => GetRenderedPathsResult[]
}

export type GetRenderedPathsResult<
  Params extends string = string,
  Props extends Record<string, any> = Record<string, any>,
> = SpecificParams<Params> & InjectedProps<Props>

export type RenderedPath = GetRenderedPathsResult & { url: string }

interface SpecificParams<in Params extends string> {
  params: Record<Params, string>
}

interface InjectedProps<out Props extends Record<string, any>> {
  props?: Props
}

interface BaseProps {
  path: string
  url: string
  frontmatter: PageFrontmatter
}

export type StaticPageProps = RenderableProps<BaseProps>

export type DynamicPageProps<
  Params extends string,
  Props extends Record<string, any> = Record<string, any>,
> = RenderableProps<BaseProps & SpecificParams<Params> & Props>
