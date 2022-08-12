import { getRouteForPage, isPage } from '@wilson/utils'
import { TransformResult } from 'rollup'
import { relative } from 'pathe'
import template from '@babel/template'
import type { Plugin } from 'vite'
import type { SiteConfig } from '@wilson/types'
import parse from './util/parse'
import format from './util/format'
import { traverse } from './util/babel-import'
import types from '@babel/types'

export default function tsxPathPlugin(config: SiteConfig): Plugin {
  return {
    name: 'wilson:tsx-path',
    enforce: 'pre',

    async transform(code: string, id: string): Promise<TransformResult> {
      if (!isPage(id, config.pagesDir, ['.tsx'])) {
        return null
      }

      const ast = parse(code)

      traverse(ast, {
        Program(path) {
          if (path.scope.hasOwnBinding('path')) {
            throw new Error(
              `Top-level identifier "path" is not allowed on a Page.`,
            )
          }
        },
      })

      const path = getRouteForPage(relative(config.pagesDir, id))

      // insert named `path` export before first export declaration or
      // at the end
      const firstExportIndex = ast.program.body.findIndex(
        (node) =>
          types.isExportNamedDeclaration(node) ||
          types.isExportDefaultDeclaration(node),
      )
      ast.program.body.splice(
        firstExportIndex === -1
          ? ast.program.body.length - 1
          : firstExportIndex,
        0,
        template.statement(`export const path = '${path}';`)(),
      )

      return format(ast)
    },
  }
}
