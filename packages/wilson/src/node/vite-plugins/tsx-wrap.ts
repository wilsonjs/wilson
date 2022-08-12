import { createComponentName, getRouteForPage, isPage } from '@wilson/utils'
import { TransformResult } from 'rollup'
import { relative } from 'pathe'
import template from '@babel/template'
import type { Plugin } from 'vite'
import type { SiteConfig } from '@wilson/types'
import types from '@babel/types'
import parse from './util/parse'
import format from './util/format'
import { traverse } from './util/babel-import'

export default function tsxWrapPlugin(config: SiteConfig): Plugin {
  return {
    name: 'wilson:tsx-wrap',
    enforce: 'pre',

    async transform(code: string, id: string): Promise<TransformResult> {
      if (!isPage(id, config.pagesDir, ['.tsx'])) {
        return null
      }

      // if (
      //   id !==
      //   '/home/christoph/projects/wilson2/sites/codepunkt.de/src/pages/islands.tsx'
      // ) {
      //   return null
      // }

      const componentName = createComponentName(relative(config.pagesDir, id))

      const ast = parse(code)

      let fc: types.FunctionDeclaration | undefined = undefined

      // TODO check that OriginalPage has no binding in global scope
      traverse(ast, {
        ExportDefaultDeclaration(path) {
          if (types.isFunctionDeclaration(path.node.declaration)) {
            fc = path.node.declaration
            fc.id = { type: 'Identifier', name: 'OriginalPage' }
            path.node.declaration = {
              type: 'FunctionDeclaration',
              async: false,
              generator: false,
              params: [
                {
                  type: 'ObjectPattern',
                  properties: [
                    {
                      type: 'ObjectProperty',
                      shorthand: true,
                      computed: false,
                      key: { type: 'Identifier', name: 'url' },
                      value: { type: 'Identifier', name: 'url' },
                    },
                    {
                      type: 'ObjectProperty',
                      shorthand: false,
                      computed: false,
                      key: { type: 'Identifier', name: 'params' },
                      value: { type: 'Identifier', name: 'matches' },
                    },
                  ],
                },
              ],
              body: {
                type: 'BlockStatement',
                body: [],
                directives: [],
              },
              id: { type: 'Identifier', name: `${componentName}Page` },
            }

            path.node.declaration = template.smart(
              /* js */ `
                function ${componentName}Page({ ...rest }) {
                  const props = { frontmatter, ...rest }
                  return <Layout {...props}>
                    {frontmatter.title && <>has title</>}
                    <OriginalPage {...props} />
                  </Layout>;
                }
              `,
              { plugins: ['jsx'] },
            )() as types.FunctionDeclaration
          } else {
            throw new Error(
              `Default export must be FunctionDeclaration. Illegal ${path.node.declaration.type} found!`,
            )
          }
        },
      })

      if (fc) {
        ast.program.body.push(fc)
      }

      const result = format(ast)
      console.log(result)
      return result
    },
  }
}
