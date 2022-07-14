import type { UserConfig as ViteOptions } from "vite";
import type { Route } from "@wilson/pages";

export type Awaitable<T> = T | Promise<T>;

/**
 * User config, defined in `wilson.config.ts`
 */
export interface UserConfig {
  /**
   * URL for site in production, used to generate absolute URLs for sitemap.xml
   * and social meta tags. Available as `site.url` and `site.canonical`.
   * @type {string}
   */
  siteUrl?: string;
  /**
   * Whether to output more information about wilson in development.
   * @default true
   */
  debug?: boolean;
  /**
   * Whether to skip `.html` in hrefs and router paths.
   * @default true
   */
  prettyUrls?: boolean;
  /**
   * Specify the output directory (relative to project root).
   * @default 'dist'
   */
  outDir?: string;
  /**
   * Specify the pages directory (relative to srcDir).
   * @default 'pages'
   */
  pagesDir?: string;
  /**
   * Specify the layouts directory (relative to srcDir).
   * @default 'layouts'
   */
  layoutsDir?: string;
  /**
   * Specify the directory where the app source is located (relative to project root).
   * @default 'src'
   */
  srcDir?: string;
  /**
   * Specify the directory where temporary files during build are stored.
   */
  tempDir?: string;
  /**
   * Specify the directory to nest generated assets under (relative to outDir).
   * @default 'assets'
   */
  assetsDir?: string;
  /**
   * Whether to display drafts in documents and pages.
   */
  drafts?: boolean;
  /**
   * File extensions that are allowed as pages.
   */
  pageExtensions?: string[];
  /**
   * Used to access and optionally modify the generated routes.
   */
  extendRoutes?: (routes: Route[]) => Awaitable<Route[] | void>;
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
  base: string;
  /**
   * Path to project root, determined at runtime.
   */
  root: string;
  /**
   * Path to configuration file, determined at runtime.
   */
  configPath: string;
  /**
   * Vite options.
   */
  vite: ViteOptions;
  /**
   * The mode the app is running in, typically `development` or `production`.
   */
  mode: string;
}
