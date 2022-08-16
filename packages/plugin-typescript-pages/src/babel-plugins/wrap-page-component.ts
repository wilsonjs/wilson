import type { PluginObj } from '@babel/core'
import types from '@babel/types'
import z from 'zod'
import validateOptions from '../util/validate-options'

let program: types.Program
let exportDefault: types.ExportDefaultDeclaration

const pluginOptions = z.object({
  componentName: z.string(),
  isDynamic: z.boolean(),
})

export default function wrapPageComponentPlugin(): PluginObj<{
  opts: z.infer<typeof pluginOptions>
}> {
  return {
    name: '@wilson/babel-plugin-wrap-page-component',
    visitor: {
      Program: {
        enter(path, { opts }) {
          validateOptions(pluginOptions, opts)
          program = path.node
        },
        exit(path) {
          if (!exportDefault) {
            throw path.buildCodeFrameError(
              'No default export found. Page component must be exported as default!',
            )
          }
        },
      },
      ExportDefaultDeclaration(path, { opts }) {
        exportDefault = path.node

        if (!types.isFunctionDeclaration(path.node.declaration)) {
          throw path.buildCodeFrameError(
            `Default export must be FunctionDeclaration. Illegal ${path.node.declaration.type} found!`,
          )
        }

        const fc = path.node.declaration
        fc.id = types.identifier('OriginalPage')

        path.node.declaration = types.functionDeclaration(
          types.identifier(`${opts.componentName}Page`),
          [
            types.objectPattern([
              types.objectProperty(
                types.identifier('params'),
                types.identifier('withUndefined'),
              ),
              types.restElement(types.identifier('rest')),
            ]),
          ],
          types.blockStatement([
            types.variableDeclaration('const', [
              types.variableDeclarator(
                types.identifier('params'),
                types.callExpression(
                  types.memberExpression(
                    types.callExpression(
                      types.memberExpression(
                        types.identifier('Object'),
                        types.identifier('keys'),
                      ),
                      [types.identifier('withUndefined')],
                    ),
                    types.identifier('reduce'),
                  ),
                  [
                    types.arrowFunctionExpression(
                      [types.identifier('acc'), types.identifier('key')],
                      types.objectExpression([
                        types.spreadElement(types.identifier('acc')),
                        types.objectProperty(
                          types.identifier('key'),
                          types.logicalExpression(
                            '??',
                            types.memberExpression(
                              types.identifier('withUndefined'),
                              types.identifier('key'),
                              true,
                            ),
                            types.stringLiteral(''),
                          ),
                          true,
                        ),
                      ]),
                    ),
                    types.objectExpression([]),
                  ],
                ),
              ),
            ]),
            types.functionDeclaration(
              types.identifier('Title'),
              [],
              types.blockStatement([
                types.expressionStatement(
                  types.callExpression(types.identifier('useTitle'), [
                    types.memberExpression(
                      types.identifier('frontmatter'),
                      types.identifier('title'),
                    ),
                  ]),
                ),
                types.returnStatement(types.nullLiteral()),
              ]),
            ),
            ...(opts.isDynamic
              ? [
                  types.variableDeclaration('const', [
                    types.variableDeclarator(
                      types.identifier('staticPath'),
                      types.callExpression(
                        types.memberExpression(
                          types.identifier('staticPaths'),
                          types.identifier('find'),
                        ),
                        [
                          types.arrowFunctionExpression(
                            [
                              types.objectPattern([
                                types.objectProperty(
                                  types.identifier('params'),
                                  types.identifier('p'),
                                ),
                              ]),
                            ],
                            types.callExpression(
                              types.identifier('shallowEqual'),
                              [
                                types.identifier('p'),
                                types.identifier('params'),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ]),
                  // // console.log
                  // types.expressionStatement(
                  //   types.callExpression(
                  //     types.memberExpression(
                  //       types.identifier('console'),
                  //       types.identifier('dir'),
                  //     ),
                  //     [
                  //       types.objectExpression([
                  //         types.objectProperty(
                  //           types.identifier('params'),
                  //           types.identifier('params'),
                  //         ),
                  //         types.objectProperty(
                  //           types.identifier('staticPaths'),
                  //           types.identifier('staticPaths'),
                  //         ),
                  //         types.objectProperty(
                  //           types.identifier('staticPath'),
                  //           types.identifier('staticPath'),
                  //         ),
                  //       ]),
                  //       types.objectExpression([
                  //         types.objectProperty(
                  //           types.identifier('depth'),
                  //           types.numericLiteral(8),
                  //         ),
                  //       ]),
                  //     ],
                  //   ),
                  // ),
                  types.variableDeclaration('const', [
                    types.variableDeclarator(
                      types.identifier('props'),
                      types.objectExpression([
                        types.objectProperty(
                          types.identifier('frontmatter'),
                          types.identifier('frontmatter'),
                          false,
                          true,
                        ),
                        types.objectProperty(
                          types.identifier('params'),
                          types.identifier('params'),
                          false,
                          true,
                        ),
                        types.spreadElement(
                          types.logicalExpression(
                            '??',
                            types.memberExpression(
                              types.identifier('staticPath'),
                              types.identifier('props'),
                            ),
                            types.objectExpression([]),
                          ),
                        ),
                        types.spreadElement(types.identifier('rest')),
                      ]),
                    ),
                  ]),
                ]
              : [
                  types.variableDeclaration('const', [
                    types.variableDeclarator(
                      types.identifier('props'),
                      types.objectExpression([
                        types.objectProperty(
                          types.identifier('frontmatter'),
                          types.identifier('frontmatter'),
                          false,
                          true,
                        ),
                        types.objectProperty(
                          types.identifier('params'),
                          types.identifier('params'),
                          false,
                          true,
                        ),
                        types.spreadElement(types.identifier('rest')),
                      ]),
                    ),
                  ]),
                ]),
            types.returnStatement(
              types.jsxElement(
                types.jsxOpeningElement(types.jsxIdentifier('Layout'), [
                  types.jsxSpreadAttribute(types.identifier('props')),
                ]),
                types.jsxClosingElement(types.jsxIdentifier('Layout')),
                [
                  types.jsxExpressionContainer(
                    types.logicalExpression(
                      '&&',
                      types.memberExpression(
                        types.identifier('frontmatter'),
                        types.identifier('title'),
                      ),
                      types.jsxElement(
                        types.jsxOpeningElement(
                          types.jsxIdentifier('Title'),
                          [],
                          true,
                        ),
                        null,
                        [],
                      ),
                    ),
                  ),
                  types.jsxElement(
                    types.jsxOpeningElement(
                      types.jsxIdentifier('OriginalPage'),
                      [types.jsxSpreadAttribute(types.identifier('props'))],
                      true,
                    ),
                    null,
                    [],
                  ),
                ],
              ),
            ),
          ]),
        )

        //     isDynamic
        //       ? `
        //         const staticPath = staticPaths.find(({ params: p }) => shallowEqual(p, params));
        //         const props = { frontmatter, params, ...(staticPath.props ?? {}), ...rest };
        //       `
        //       : `const props = { frontmatter, params, ...rest };`

        program.body.push(fc)
      },
    },
  }
}
