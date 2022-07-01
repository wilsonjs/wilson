import {
  SiteConfig,
  SiteConfigDefaults,
  SiteConfigWithDefaults,
} from '../types'
import { resolve } from 'path'
import fs from 'fs-extra'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

const configDefaults: SiteConfigDefaults = {
  performance: {
    autoPrefetch: {
      enabled: true,
      maxConcurrentFetches: 8,
      routeTest: () => true,
      timeout: 2000,
    },
  },
  languages: [],
  layouts: {
    pageLayout: 'page',
    nestedLayouts: [{ pattern: '**/*.md', layout: 'markdown' }],
  },
  pagination: {
    pageSize: 10,
    routeSuffix: (pageNumber: number): string =>
      pageNumber === 0 ? '' : `page-${pageNumber}`,
  },
  taxonomies: {
    categories: 'category',
    tags: 'tag',
  },
  feeds: [],
  syntaxHighlighting: {
    extensions: [],
    theme: 'Default Dark+',
  },
  importMode: 'async',
  injectHead: () => '',
}

/**
 * Configuration file name.
 */
const configFileName = 'wilson.config.js'

/**
 * Cached configuration data.
 */
let cachedConfig: SiteConfigWithDefaults | null = null

/**
 * Returns user's site configuration, combined with default values.
 */
export function getConfig(
  root: string = process.cwd()
): SiteConfigWithDefaults {
  // If configuration data is cached in production, return from cache.
  if (process.env.NODE_ENV === 'production' && cachedConfig !== null) {
    return cachedConfig
  }

  // Check config file existance.
  const configPath = resolve(root, configFileName)
  const hasConfig = fs.pathExistsSync(configPath)
  if (!hasConfig) {
    throw new Error(`no ${configFileName} found.`)
  }

  // Delete cache, then load (fresh) configuration data from file.
  delete require.cache[configPath]
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const config: SiteConfig = require(configPath)

  // If languages are defined
  if (typeof config.languages !== 'undefined') {
    // more than one language should be defined
    if (config.languages.length === 1) {
      throw new Error(`if you define languages, define more than one!`)
    }
    // the site's default language should be defined included
    if (
      typeof config.languages.find(
        (language) => language.code === config.siteData.lang
      ) === 'undefined'
    ) {
      throw new Error(
        'if you define languages, include the language defined in siteData'
      )
    }
  }

  const isDevServer =
    process.argv.length === 2 || ['start', 'dev'].includes(process.argv[2])

  // Cache and return configuration data.
  cachedConfig = {
    ...configDefaults,
    ...config,
    layouts: { ...configDefaults.layouts, ...config.layouts },
    pagination: { ...configDefaults.pagination, ...config.pagination },
    performance: {
      autoPrefetch: {
        ...configDefaults.performance.autoPrefetch,
        ...(config.performance?.autoPrefetch ?? {}),
        // Disable auto-prefetch in development mode
        ...(isDevServer ? { enabled: false } : {}),
      },
    },
  }

  return cachedConfig
}

export function getAllLanguageCodes(): string[] {
  return getConfig().languages.map((language) => language.code)
}
