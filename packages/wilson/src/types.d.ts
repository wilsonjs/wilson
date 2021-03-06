/// <reference types="vite/client" />

/**
 * No imports here, just type definitions.
 *
 * If we choose to import types from node or client directory, build
 * folder structure gets screwed up.
 */

import type { Node } from 'unist'

/**
 *
 */
export interface SiteData {
  lang?: string
  titleTemplate: string
  description: string
  siteName: string
  siteUrl: string
  author: string
  twitterSite?: string
  twitterCreator?: string
  keywords?: string[]
}

interface FrontmatterOptional {
  date?: string | Date
  permalink?: string
  layout?: string
  opengraphType?: string
}

interface FrontmatterRequired {
  title: string
}

type TaxonomyDefinition = Record<string, string>
type TaxonomyTerms = string[]
type TaxonomyData = Record<string, TaxonomyTerms>

export type ContentFrontmatter = FrontmatterOptional &
  FrontmatterRequired & {
    type?: 'content'
    taxonomies?: TaxonomyData
    draft?: boolean
    description?: string
  }

export type TermsFrontmatter = FrontmatterOptional &
  FrontmatterRequired & {
    type: 'terms'
    taxonomyName: string
  }

/**
 * Has to have `type`, `title`, `taxonomyName` and `permalink`.
 */
export type TaxonomyFrontmatter = FrontmatterOptional &
  FrontmatterRequired & {
    type: 'taxonomy'
    taxonomyName: string
    permalink: string
  }

export type SelectFrontmatter = FrontmatterOptional &
  FrontmatterRequired & {
    type: 'select'
    taxonomyName: string
    selectedTerms: TaxonomyTerms
  }

export type FrontmatterDefaults = Required<
  Pick<FrontmatterOptional, 'date' | 'opengraphType'>
> & {
  type:
    | ContentFrontmatter['type']
    | TermsFrontmatter['type']
    | TaxonomyFrontmatter['type']
    | SelectFrontmatter['type']
}

export type Frontmatter =
  | ContentFrontmatter
  | TermsFrontmatter
  | TaxonomyFrontmatter
  | SelectFrontmatter

export type FrontmatterWithDefaults = Frontmatter & FrontmatterDefaults

export type ContentFrontmatterWithDefaults = FrontmatterOptional &
  FrontmatterRequired &
  ContentFrontmatter &
  FrontmatterDefaults & { type: ContentFrontmatter['type']; draft: boolean }

export type TermsFrontmatterWithDefaults = FrontmatterOptional &
  FrontmatterRequired &
  TermsFrontmatter &
  FrontmatterDefaults & { type: TermsFrontmatter['type'] }

export type TaxonomyFrontmatterWithDefaults = FrontmatterOptional &
  FrontmatterRequired &
  TaxonomyFrontmatter &
  FrontmatterDefaults & { type: TaxonomyFrontmatter['type'] }

export type SelectFrontmatterWithDefaults = FrontmatterOptional &
  FrontmatterRequired &
  SelectFrontmatter &
  FrontmatterDefaults & { type: SelectFrontmatter['type'] }

/**
 * Page-related information, edited for use in the client,
 * e.g. in page/post lists.
 */
export interface ClientPage {
  type: 'typescript' | 'markdown'
  url: string
  title: string
  date: Date
  taxonomies: TaxonomyData
}

export type Feed = {
  href: string
  title: string
}

export interface Heading {
  level: number
  text: string
  slug: string
}

export interface OpengraphImageText {
  text: (page: Page) => string
  font: string
  fontSize?: number
  color?: string
  x?: number
  y?: number
  maxWidth?: number
  maxHeight?: number
  horizontalAlign?: 'left' | 'center' | 'right'
  verticalAlign?: 'top' | 'center' | 'bottom'
}

/**
 * Pagination options.
 */
interface PaginationOptions {
  pageSize?: number
  routeSuffix?: (pageNumber: number) => string
}

/**
 * Feed options.
 */
interface FeedOptions {
  title: string
  output: string
  match?:
    | string
    | ((path: string, frontmatter: ContentFrontmatterWithDefaults) => boolean)
  language?: string
  ttl?: number
  managingEditor?: string
  webMaster?: string
  copyright?: string
}

/**
 * Syntax highlighting options, reflects options of gatsby-remark-vscode
 */
interface ThemeSettings {
  default: string
  dark?: string
  parentSelector?: Record<string, string>
  media?: Array<{ match: string; theme: string }>
}
interface CodeData {
  language: string
  node: Node
}
interface SyntaxHighlightingOptions {
  theme?: string | ThemeSettings | ((data: CodeData) => string | ThemeSettings)
  wrapperClassName?: string | ((data: CodeData) => string)
  languageAliases?: Record<string, string>
  extensions?: string[]
  inlineCode?: {
    marker: string
    className: string | ((data: CodeData) => string)
    theme: string | ThemeSettings | ((data: CodeData) => string | ThemeSettings)
  }
  injectStyles?: boolean
  replaceColor?: (colorValue: string, theme: string) => string
  logLevel?: 'trace' | 'debug' | 'info' | 'warn' | 'error'
}

export interface AutoPrefetchOptions {
  enabled?: boolean
  maxConcurrentFetches?: number
  /**
   * If function returns true for a route, resources for that route will be prefetched
   */
  routeTest?: (route: string) => boolean
  timeout?: number
}
export interface PerformanceOptions {
  autoPrefetch?: AutoPrefetchOptions
}

export interface LayoutOptions {
  pageLayout?: string
  nestedLayouts?: { layout: string; pattern?: string }[]
}

/**
 * Site configuration.
 */
export type SiteConfig = SiteConfigRequired & SiteConfigOptional
export type SiteConfigWithDefaults = SiteConfig & SiteConfigDefaults
export type SiteConfigRequired = { siteData: SiteData }

export type ImportMode =
  | 'sync'
  | 'async'
  | ((pagePath: string, currentPage: number) => 'sync' | 'async')

export interface SiteConfigOptional {
  opengraphImage?: { background: string; texts: OpengraphImageText[] }
  layouts?: LayoutOptions
  taxonomies?: TaxonomyDefinition
  pagination?: PaginationOptions
  feeds?: FeedOptions[]
  syntaxHighlighting?: SyntaxHighlightingOptions
  performance?: PerformanceOptions
  importMode?: ImportMode
  injectHead?: () => string | Promise<string>
}

/**
 * Optional site configuration that is set to default values when not defined.
 */
export type SiteConfigDefaults = Required<
  Pick<
    SiteConfigOptional,
    | 'taxonomies'
    | 'feeds'
    | 'syntaxHighlighting'
    | 'performance'
    | 'injectHead'
    | 'importMode'
  >
> & {
  layouts: Required<LayoutOptions>
  pagination: Required<PaginationOptions>
  performance: Required<PerformanceOptions>
}

export interface Page {
  route: string
  path: string
  title: string
  date: Date
}

interface PageProps {
  title: string
  date: number // timestamp
}

export interface BasePagination {
  count: number
  currentPage: number
  pageSize: number
}

export interface PaginationRoutes {
  previousPage: string | false
  nextPage: string | false
}

export type ClientPagination = BasePagination & PaginationRoutes

export type ContentPageProps = PageProps & {
  headings?: Heading[]
  taxonomies?: TaxonomyData
}

export type SelectPageProps = PageProps & {
  contentPages: Page[]
  pagination: ClientPagination
}

export type TaxonomyPageProps = SelectPageProps & {
  selectedTerm: string
}

export interface TaxonomyTerm {
  name: string
  slug: string
}

export type TermPageProps = PageProps & {
  taxonomyTerms: TaxonomyTerm[]
}
