import {
  createComponentName,
  getRoutingInfo,
  isPage,
  userToPageFrontmatter,
} from '@wilson/utils'
import type { Plugin } from 'vite'
import type { TransformResult } from 'rollup'
import type { SiteConfig, UserFrontmatter } from '@wilson/types'
import { getLanguage } from '@wilson/client-utils'
import { PluginItem, transformFromAstAsync } from '@babel/core'
import parseFrontmatterPlugin from './babel-plugins/parse-frontmatter'
import prependImportsPlugin from './babel-plugins/prepend-imports'
import addNamedStringExportPlugin from './babel-plugins/add-named-string-export'
import extendFrontmatterPlugin from './babel-plugins/extend-frontmatter'
import addStaticPathsPlugin from './babel-plugins/add-static-paths'
import wrapPageComponentPlugin from './babel-plugins/wrap-page-component'
import addTranslationsPlugin from './babel-plugins/add-translations'
import parser from '@babel/parser'
import type { File } from '@babel/types'
import type { ParseResult } from '@babel/parser'
import { relative } from 'pathe'
import format from './util/format'

function parse(code: string): ParseResult<File> {
  return parser.parse(code, {
    tokens: true,
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  })
}

/**
 * Wilson typescript pages plugin
 */
export default function typescriptPagesPlugin(config: SiteConfig): Plugin {
  return {
    name: 'wilson-plugin-typescript-pages',
    enforce: 'pre',

    async transform(code: string, id: string): Promise<TransformResult> {
      const { defaultLanguage, languages, layoutsDir, pagesDir, root } = config

      if (!isPage(id, pagesDir, ['.tsx'])) {
        return null
      }

      try {
        const syntaxTree = parse(code)
        const frontmatterOptions: { frontmatter?: object } = { frontmatter: {} }
        await transformFromAstAsync(syntaxTree, code, {
          plugins: [[parseFrontmatterPlugin, frontmatterOptions]],
        })

        const frontmatter = await userToPageFrontmatter(
          frontmatterOptions.frontmatter as UserFrontmatter,
          id,
          config,
        )
        const layout = frontmatter.layout
        const layoutPath = `${layoutsDir}/${layout}.tsx`
        const relativePath = relative(pagesDir, id)
        const dynamicParameterMatches = [
          ...relativePath.matchAll(/\[([^\]]+)\]/g),
        ]
        const { route, translations } = getRoutingInfo(
          relative(pagesDir, id),
          config,
        )

        const isDynamic = dynamicParameterMatches.length > 0
        const componentName = createComponentName(relativePath)
        const language =
          getLanguage(
            id,
            config.languages.map(([id]) => id),
          ) ?? config.defaultLanguage

        const transformResult = await transformFromAstAsync(syntaxTree, code, {
          ast: true,
          filename: id,
          plugins: [
            [
              prependImportsPlugin,
              {
                imports: [
                  {
                    identifiers: [{ default: true, name: 'Layout' }],
                    source: layoutPath,
                  },
                  {
                    identifiers: [{ default: false, name: 'useTitle' }],
                    source: 'hoofd/preact',
                  },
                  ...(isDynamic
                    ? [
                        {
                          identifiers: [
                            { default: false, name: 'createPaginationHelper' },
                            { default: false, name: 'replaceRouteParams' },
                          ],
                          source: 'wilson',
                        },
                        {
                          identifiers: [
                            { default: false, name: 'shallowEqual' },
                          ],
                          source: 'fast-equals',
                        },
                      ]
                    : []),
                ],
              },
            ],
            [
              addNamedStringExportPlugin,
              { exportIdentifier: 'path', exportString: route },
            ],
            [addTranslationsPlugin, { translations }],
            [extendFrontmatterPlugin, { frontmatter }],
            isDynamic && [
              addStaticPathsPlugin,
              {
                relativePath,
                defaultLanguage,
                languages,
                relativePagesDir: relative(root, pagesDir),
              },
            ],
            [wrapPageComponentPlugin, { componentName, language, isDynamic }],
          ].filter(Boolean) as PluginItem[],
        })

        return format(transformResult!.ast!)
      } catch (e) {
        if (e instanceof Error) {
          e.message = e.message.replace(/^unknown:\s/, '')
          throw e
        }
      }
    },
  }
}
