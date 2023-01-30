import { fileURLToPath } from 'url'
import type { ConfigEnv, UserConfig as ViteOptions } from 'vite'
import { loadConfigFromFile, mergeConfig as mergeViteConfig } from 'vite'
import pc from 'picocolors'
import { dirname, join, resolve } from 'pathe'
import type { SiteConfig, UserConfig } from '@wilson/types'
import utils from '@wilson/utils'
import { debug } from './utils'

const defaultMeta = {
  tags: () => [
    {
      name: 'description',
      content: 'This is a blazing-fast site built with https://wilsonjs.com/',
    },
  ],
  titleTemplate: '%s',
}

function mergeConfig<T extends Record<string, any> = Record<string, any>>(
  a: T,
  b: T,
  isRoot = true,
): SiteConfig {
  const merged: Record<string, any> = { ...a }
  for (const key in b) {
    const value = b[key as keyof T]
    if (value == null) continue

    const existing = merged[key]
    if (Array.isArray(existing) && Array.isArray(value)) {
      merged[key] = [...existing, ...value]
      continue
    }
    if (utils.isObject(existing) && utils.isObject(value)) {
      if (isRoot && key === 'vite')
        merged[key] = mergeViteConfig(existing, value)
      else merged[key] = mergeConfig(existing, value, false)

      continue
    }
    merged[key] = value
  }
  return merged as SiteConfig
}

async function resolveUserConfig(root: string, env: ConfigEnv) {
  let config = { root } as SiteConfig
  const { ...userConfig } = await loadUserConfigFile(root, env)
  config = mergeConfig(config, siteConfigDefaults(config, userConfig, env))
  config = mergeConfig(config, userConfig)

  const url = config.url || ''
  const protocolIndex = url.indexOf('//')
  const baseIndex = url.indexOf('/', protocolIndex > -1 ? protocolIndex + 2 : 0)

  config.url = baseIndex > -1 ? url.slice(0, baseIndex) : url
  config.base = baseIndex > -1 ? url.slice(baseIndex) : '/'
  if (!config.base.endsWith('/')) config.base = `${config.base}/`

  config.vite.base = config.base
  config.vite.build!.assetsDir = config.assetsDir

  return config
}

/**
 *
 * @param root
 * @param configEnv
 * @returns
 */
async function loadUserConfigFile(
  root: string,
  env: ConfigEnv,
): Promise<UserConfig> {
  try {
    const { path, config = {} } =
      (await loadConfigFromFile(env, 'wilson.config.ts', root)) || {}
    if (path && config) {
      ;(config as SiteConfig).configPath = path
      debug.config(`loaded config at ${pc.yellow(path)}`)
    } else {
      debug.config('no wilson.config.ts file found.')
    }
    return config as UserConfig
  } catch (error) {
    if (error instanceof Error && error.message.includes('Could not resolve')) {
      debug.config('no wilson.config.ts file found.')
      return { meta: defaultMeta }
    }
    throw error
  }
}

const _dirname = dirname(fileURLToPath(import.meta.url))
export const DIST_CLIENT_PATH = join(_dirname, '../client')

/**
 *
 * @param root
 * @param userConfig
 * @returns
 */
function viteConfigDefaults(root: string): ViteOptions {
  return {
    root,
    clearScreen: false,
    resolve: {
      alias: [
        {
          find: /^[~@]\//,
          replacement: `${resolve(root, 'src')}/`,
        },
      ],
    },
    server: {
      fs: { strict: false, allow: [root, DIST_CLIENT_PATH] },
    },
    build: {
      cssCodeSplit: false,
    },
    plugins: [],
    define: {},
    optimizeDeps: {
      include: [],
      exclude: [],
    },
    esbuild: {
      /**
       * @preact/preset-vite uses @babel/plugin-transform-react-jsx to
       * transform jsx. this leads to esbuild warnings in development mode:
       *
       *    Top-level "this" will be replaced with undefined since this file
       *    is an ECMAScript module
       *
       * To hide these, we use the `logOverride` option of esbuild.
       * @see https://github.com/vitejs/vite/issues/8644
       */
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
      jsxInject: "import { h } from 'preact'",
      jsxFactory: 'h',
      jsxFragment: 'Fragment',
    },
  }
}

/**
 *
 * @param siteConfig
 * @param userConfig
 * @param env
 * @returns
 */
function siteConfigDefaults(
  siteConfig: SiteConfig,
  userConfig: UserConfig,
  env: ConfigEnv,
): Omit<SiteConfig, 'mode'> {
  const { root } = siteConfig
  const isDevelopmentMode = env.mode === 'development'
  const { drafts = isDevelopmentMode, srcDir = 'src' } = userConfig

  return {
    url: '',
    meta: defaultMeta,
    assetsDir: 'assets',
    base: '/',
    configPath: resolve(root, 'wilson.config.ts'),
    debug: true,
    drafts,
    outDir: 'dist',
    pagesDir: 'pages',
    layoutsDir: 'layouts',
    islandsDir: 'islands',
    tempDir: '.wilson',
    prettyUrls: true,
    root,
    srcDir,
    pageExtensions: ['.md', '.tsx'],
    defaultLanguage: 'en',
    defaultLanguageInSubdir: false,
    // TODO validate that translationKeys values are all strings
    languages: [],
    vite: viteConfigDefaults(root),
    getAdditionalHeadContent: async () => '',
    extendFrontmatter(filename, frontmatter) {
      return frontmatter
    },
    syntaxHighlighting: {
      extensions: [],
      theme: 'Default Dark+',
    },
    createOpengraphImage: () => null,
  }
}

/**
 *
 * @param root
 * @param env
 * @returns The site config
 */
export async function resolveConfig(
  root: string = process.cwd(),
  env: ConfigEnv = { mode: 'development', command: 'serve' },
): Promise<SiteConfig> {
  const config = await resolveUserConfig(root, env)
  config.mode = env.mode

  const srcDir = resolve(root, config.srcDir)
  Object.assign(config, {
    srcDir,
    pagesDir: resolve(srcDir, config.pagesDir),
    outDir: resolve(root, config.outDir),
    tempDir: resolve(root, config.tempDir),
    layoutsDir: resolve(srcDir, config.layoutsDir),
    islandsDir: resolve(srcDir, config.islandsDir),
  })

  if (config.languages.length === 1) {
    throw new Error(
      `Defining languages is useful from 2 languages on upwards, yet you only defined 1: ${config.languages[0]}`,
    )
  }

  if (
    Array.from(new Set(config.languages.map(([id]) => id))).length !==
    config.languages.length
  ) {
    throw new Error(
      `Illegal language definition: Same identifer found more than once!`,
    )
  }

  return config
}
