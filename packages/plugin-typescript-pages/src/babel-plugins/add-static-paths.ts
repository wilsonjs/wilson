import type * as BabelCoreNamespace from '@babel/core'
import type { PluginObj } from '@babel/core'
import types from '@babel/types'
import z from 'zod'
import validateOptions from '../util/validate-options'

const pluginOptions = z.object({
  defaultLanguage: z.string(),
  defaultLanguageInSubdir: z.boolean(),
  languages: z.array(
    z.tuple([z.string(), z.object({ languageName: z.string() })]),
  ),
  relativePagesDir: z.string(),
  relativePath: z.string(),
})

type Babel = typeof BabelCoreNamespace

export default function addStaticPathsPlugin({ traverse }: Babel): PluginObj<{
  opts: z.infer<typeof pluginOptions>
}> {
  return {
    name: '@wilson/babel-plugin-add-static-paths',
    visitor: {
      Program(path, { opts }) {
        validateOptions(pluginOptions, opts)

        const binding = path.scope.getOwnBinding('getStaticPaths')

        if (!binding) {
          throw path.buildCodeFrameError(
            'Dynamic pages must export "getStaticPaths"!',
          )
        }

        const exportPath = binding.referencePaths.find((path) =>
          types.isExportNamedDeclaration(path),
        )

        if (!exportPath) {
          throw path.buildCodeFrameError(
            'Dynamic pages must export "getStaticPaths"!',
          )
        }

        let getPagesPattern: string | null = null
        traverse(
          binding.path.node,
          {
            CallExpression(path) {
              if (
                path.node.callee.type === 'Identifier' &&
                path.node.callee.name === 'getPages' &&
                path.node.arguments.length > 0 &&
                path.node.arguments[0].type === 'StringLiteral'
              ) {
                getPagesPattern = (
                  path.node.arguments[0] as types.StringLiteral
                ).value
              }
            },
          },
          binding.scope,
          binding.path,
        )

        const insertIndex =
          1 + path.node.body.findIndex((s) => s === exportPath.node)

        path.node.body.splice(
          insertIndex,
          0,
          types.exportNamedDeclaration(
            types.variableDeclaration('const', [
              types.variableDeclarator(
                types.identifier('staticPaths'),
                types.awaitExpression(
                  types.callExpression(types.identifier('getStaticPaths'), [
                    types.objectExpression([
                      types.objectProperty(
                        types.identifier('getPages'),
                        types.arrowFunctionExpression(
                          [types.identifier('pattern')],
                          getPagesPattern === null
                            ? types.arrayExpression([])
                            : types.blockStatement([
                                types.returnStatement(
                                  types.callExpression(
                                    types.memberExpression(
                                      types.identifier('Object'),
                                      types.identifier('values'),
                                    ),
                                    [
                                      types.callExpression(
                                        types.memberExpression(
                                          types.metaProperty(
                                            types.identifier('import'),
                                            types.identifier('meta'),
                                          ),
                                          types.identifier('glob'),
                                        ),
                                        [
                                          types.stringLiteral(
                                            `/${opts.relativePagesDir}/${getPagesPattern}`,
                                          ),
                                          types.objectExpression([
                                            types.objectProperty(
                                              types.identifier('eager'),
                                              types.booleanLiteral(true),
                                            ),
                                          ]),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ]),
                        ),
                      ),
                      types.objectProperty(
                        types.identifier('paginate'),
                        types.callExpression(
                          types.identifier('createPaginationHelper'),
                          [
                            types.stringLiteral(opts.relativePath),
                            types.stringLiteral(opts.defaultLanguage),
                            types.booleanLiteral(opts.defaultLanguageInSubdir),
                            types.arrayExpression(
                              opts.languages.map(([id, config]) =>
                                types.arrayExpression([
                                  types.stringLiteral(id),
                                  types.objectExpression([
                                    types.objectProperty(
                                      types.identifier('languageName'),
                                      types.stringLiteral(config.languageName),
                                    ),
                                  ]),
                                ]),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ]),
                  ]),
                ),
              ),
            ]),
          ),
        )
      },
    },
  }
}
