import { createComponentName, getRouteForPage, isPage } from '@wilson/utils'
import { TransformResult } from 'rollup'
import { relative } from 'pathe'
import template from '@babel/template'
import type { Plugin } from 'vite'
import type { GetRenderedPathsFn, SiteConfig } from '@wilson/types'
import types from '@babel/types'
import parse from './util/parse'
import format from './util/format'
import { traverse } from './util/babel-import'
import path from 'path'

export default function tsxWrapPlugin(config: SiteConfig): Plugin {
  return {
    name: 'wilson:tsx-wrap',
    enforce: 'pre',

    async transform(
      code: string,
      absolutePath: string,
    ): Promise<TransformResult> {
      if (!isPage(absolutePath, config.pagesDir, ['.tsx'])) {
        return null
      }

      const pagePath = relative(config.pagesDir, absolutePath)
      const componentName = createComponentName(pagePath)
      const dynamicParameterMatches = [...pagePath.matchAll(/\[([^\]]+)\]/g)]
      const isDynamic = dynamicParameterMatches.length > 0

      const ast = parse(code)

      let fc: types.FunctionDeclaration | undefined = undefined

      // TODO check that OriginalPage has no binding in global scope
      // TODO if isDynamic, check that getRenderedPaths is exported
      traverse(ast, {
        Program(path) {
          if (isDynamic) {
            if (path.scope.hasOwnBinding('getRenderedPaths')) {
              const binding = path.scope.getOwnBinding('getRenderedPaths')
              if (
                binding &&
                // types.isVariableDeclarator(binding.path.node) &&
                // types.isObjectExpression(binding.path.node.init) &&
                binding.referencePaths.some((path) =>
                  types.isExportNamedDeclaration(path),
                )
              ) {
                if (types.isVariableDeclarator(binding.path.node)) {
                  // console.log(binding.path.node)
                } else if (types.isFunctionDeclaration(binding.path.node)) {
                  // console.log(
                  //   binding.path
                  //     .getScope(binding.path.scope)
                  //     .getBinding('getPages'),
                  // )
                } else {
                  throw new Error('wat 1')
                }
                // console.log(binding.path.node.init.type)
                return
              }
            }
            throw new Error('wat 3 pages must have getRenderedPaths Export')
          }
        },
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
              `
                function ${componentName}Page({ matches, ...rest }) {
                  ${
                    isDynamic
                      ? `
                        const renderedPath = renderedPaths.find(({ params }) => shallowEqual(params, matches))
                        const props = { frontmatter, matches, ...renderedPath.props, ...rest }
                      `
                      : `const props = { frontmatter, matches, ...rest }`
                  }
                  function Title() { useTitle(frontmatter.title); return null; };
                  return <Layout {...props}>
                    {frontmatter.title && <Title />}
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

      ast.program.body = [
        template.statement(`import { useTitle } from 'hoofd/preact';`)(),
        ...(isDynamic
          ? template.statements(`
              import { createPaginationHelper } from 'wilson';
              import { shallowEqual } from 'fast-equals';
            `)()
          : []),
        ...ast.program.body,
        ...(isDynamic
          ? [
              template.statement(
                `const renderedPaths = await getRenderedPaths({ getPages: (path) => {
                  return [];
                }, paginate: createPaginationHelper('${pagePath}') });`,
              )(),
            ]
          : []),
      ]

      if (fc) {
        ast.program.body.push(fc)
      }

      return format(ast)
    },
  }
}
