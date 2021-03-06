import { UserConfig as ViteUserConfig } from 'vite'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import preact from '@preact/preset-vite'

import markdownPlugin from './plugins/markdown-plugin.js'
import virtualPlugin from './plugins/virtual-plugin.js'
import pagesPlugin from './plugins/pages-plugin.js'
import metaPlugin from './plugins/meta-plugin.js'
import svgPlugin from './plugins/svg-plugin.js'
import injectHeadPlugin from './plugins/inject-head-plugin.js'

interface ViteConfigOptions {
  ssr?: boolean
}

// @TODO: check https://github.com/small-tech/vite-plugin-sri. does this tamper with splitting?
export const getViteConfig = async ({
  ssr = false,
}: ViteConfigOptions): Promise<ViteUserConfig> => {
  return {
    optimizeDeps: {
      include: [
        'preact',
        'preact/compat',
        'preact/hooks',
        'preact/jsx-runtime',
        'preact-iso',
        'hoofd/preact',
        'throttles',
      ],
      exclude: ['wilson/virtual'],
    },
    clearScreen: false,
    plugins: [
      await metaPlugin(),
      await injectHeadPlugin(),
      await markdownPlugin(),
      await pagesPlugin(),
      await virtualPlugin(),
      preact({ devtoolsInProd: true }),
      await svgPlugin(),
    ],
    build: {
      ssr,
      outDir: ssr ? '.wilson/ssr' : 'dist',
      // inline async chunk css
      cssCodeSplit: true,
      // assets inline limit is not configurable and set to a very low size because
      // inlined assets are baked into both a page's javascript and the statically
      // generated .html files
      assetsInlineLimit: 2048,
      rollupOptions: {
        // important so that each page chunk and the index export things for each other
        preserveEntrySignatures: 'allow-extension',
        input: ssr
          ? join(
              dirname(fileURLToPath(import.meta.url)),
              '../client/ssr/serverRender.js'
            )
          : 'index.html',
      },
      manifest: !ssr,
      minify: ssr ? false : !process.env.DEBUG,
    },
    esbuild: {
      jsxInject: `import { h, Fragment } from 'preact'`,
      jsxFactory: 'h',
      jsxFragment: 'Fragment',
    },
  }
}
