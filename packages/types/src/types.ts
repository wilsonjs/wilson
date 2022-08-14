import type { UserConfig as ViteOptions, Plugin } from 'vite'
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
   * Provide site-wide meta information.
   */
  site: {
    title: string
    description: string
  }
  /**
   * Default content language. Defaults to 'en'.
   */
  defaultContentLanguage?: string
  /**
   * File extensions that are allowed as pages.
   */
  pageExtensions?: string[]
  /**
   * Used to access and optionally modify page's frontmatter.
   */
  extendFrontmatter?: (
    filename: string,
    frontmatter: UserFrontmatter,
  ) => Awaitable<UserFrontmatter | void>
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

export interface UserFrontmatter extends Record<string, any> {
  title: string
}

export interface PageFrontmatter extends UserFrontmatter {
  meta: {
    filename: string
    lastUpdated: Date
    [key: string]: any
  }
  layout: string
  // route: {
  //   name?: string
  //   path?: string
  //   redirect?: string
  //   alias?: string | string[]
  // }
}

export interface StaticPageExports {
  default: FunctionComponent
  path: string
  frontmatter: PageFrontmatter
}

interface Document {
  href: string
  frontmatter: PageFrontmatter
}

interface PaginationProps<T = any> {
  nextPage?: string
  prevPage?: string
  items: T[]
}

type DocumentHelper = (path: string) => StaticPageExports[]

export type PaginationHelper<T = any> = (
  items: T[],
  options: {
    format: (pageNumber: number) => string
    pageSize?: number
    param?: string
  },
) => Array<{
  params: Record<string, string>
  props?: PaginationProps<T>
}>

export type PropsWithPagination<T extends {} = Document> = RenderableProps<
  BaseProps & PaginationProps<T>
>

export interface DynamicPageExports extends StaticPageExports {
  getStaticPaths: GetStaticPaths
}

export type GetStaticPathsResult<
  Params extends string = string,
  Props extends Record<string, any> = Record<string, any>,
> = { params: Record<Params, string>; props?: Props }

export type StaticPath = GetStaticPathsResult & { url: string }

export type GetStaticPaths = (helpers: {
  getPages: DocumentHelper
  paginate: PaginationHelper
}) => Awaitable<GetStaticPathsResult[]>

interface SpecificParams<in Params extends string> {
  params: Record<Params, string>
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
