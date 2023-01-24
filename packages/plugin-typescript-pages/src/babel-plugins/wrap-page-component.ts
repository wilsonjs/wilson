import type { PluginObj } from '@babel/core'
import types from '@babel/types'
import z from 'zod'
import validateOptions from '../utils/validate-options'

function buildTranslateFunction(translationKeys: Record<string, string>) {
  return types.objectProperty(
    types.identifier('translate'),
    types.arrowFunctionExpression(
      [types.identifier('key')],
      types.logicalExpression(
        '??',
        types.memberExpression(
          types.objectExpression(
            Object.entries(translationKeys).map(([key, value]) =>
              types.objectProperty(
                types.stringLiteral(key),
                types.stringLiteral(value as string),
              ),
            ),
          ),
          types.identifier('key'),
          true,
        ),
        types.identifier('key'),
      ),
    ),
  )
}

function buildLocalizeUrlFunction(
  isDefaultLanguage: boolean,
  languageId: string,
) {
  return types.objectProperty(
    types.identifier('localizeUrl'),
    types.arrowFunctionExpression(
      [types.identifier('url')],
      isDefaultLanguage
        ? types.identifier('url')
        : types.callExpression(
            types.memberExpression(
              types.templateLiteral(
                [
                  types.templateElement({
                    raw: `/${languageId}`,
                    cooked: `/${languageId}`,
                  }),
                  types.templateElement({ raw: '', cooked: '' }, true),
                ],
                [types.identifier('url')],
              ),
              types.identifier('replace'),
            ),
            [types.regExpLiteral('\\/$'), types.stringLiteral('')],
          ),
    ),
  )
}

// function createConsoleDir(identifiers: string[]) {
//   return types.expressionStatement(
//     types.callExpression(
//       types.memberExpression(
//         types.identifier('console'),
//         types.identifier('dir'),
//       ),
//       [
//         types.objectExpression(
//           identifiers.map((identifier) =>
//             types.objectProperty(
//               types.identifier(identifier),
//               types.identifier(identifier),
//             ),
//           ),
//         ),
//         types.objectExpression([
//           types.objectProperty(
//             types.identifier('depth'),
//             types.numericLiteral(8),
//           ),
//         ]),
//       ],
//     ),
//   )
// }

let program: types.Program
let exportDefault: types.ExportDefaultDeclaration

const pluginOptions = z.object({
  componentName: z.string(),
  isDefaultLanguage: z.boolean(),
  isDynamic: z.boolean(),
  languageId: z.string(),
  translationKeys: z.object({}),
  title: z.string(),
  titleTemplate: z.string(),
  titleMeta: z.object({
    properties: z.array(z.string()),
    useTemplate: z.boolean(),
  }),
  description: z.string(),
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
                        types.objectProperty(
                          types.identifier('language'),
                          types.stringLiteral(opts.languageId),
                          false,
                          true,
                        ),
                        types.objectProperty(
                          types.identifier('translations'),
                          types.callExpression(
                            types.memberExpression(
                              types.identifier('translations'),
                              types.identifier('map'),
                            ),
                            [
                              types.arrowFunctionExpression(
                                [types.identifier('t')],
                                types.objectExpression([
                                  types.objectProperty(
                                    types.identifier('languageName'),
                                    types.memberExpression(
                                      types.identifier('t'),
                                      types.identifier('languageName'),
                                    ),
                                  ),
                                  types.objectProperty(
                                    types.identifier('languageId'),
                                    types.memberExpression(
                                      types.identifier('t'),
                                      types.identifier('languageId'),
                                    ),
                                  ),
                                  types.objectProperty(
                                    types.identifier('route'),
                                    types.callExpression(
                                      types.identifier('replaceRouteParams'),
                                      [
                                        types.memberExpression(
                                          types.identifier('t'),
                                          types.identifier('route'),
                                        ),
                                        types.identifier('params'),
                                      ],
                                    ),
                                  ),
                                ]),
                              ),
                            ],
                          ),
                          false,
                          true,
                        ),
                        buildTranslateFunction(opts.translationKeys),
                        buildLocalizeUrlFunction(
                          opts.isDefaultLanguage,
                          opts.languageId,
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
                        types.objectProperty(
                          types.identifier('language'),
                          types.stringLiteral(opts.languageId),
                          false,
                          true,
                        ),
                        types.objectProperty(
                          types.identifier('translations'),
                          types.identifier('translations'),
                          false,
                          true,
                        ),
                        buildTranslateFunction(opts.translationKeys),
                        buildLocalizeUrlFunction(
                          opts.isDefaultLanguage,
                          opts.languageId,
                        ),
                        types.spreadElement(types.identifier('rest')),
                      ]),
                    ),
                  ]),
                ]),
            types.expressionStatement(
              types.callExpression(types.identifier('useTitleTemplate'), [
                types.stringLiteral(opts.titleTemplate),
              ]),
            ),
            types.expressionStatement(
              types.callExpression(types.identifier('useTitle'), [
                types.memberExpression(
                  types.identifier('frontmatter'),
                  types.identifier('title'),
                ),
              ]),
            ),
            types.expressionStatement(
              types.callExpression(types.identifier('useHead'), [
                types.objectExpression([
                  types.objectProperty(
                    types.identifier('language'),
                    types.memberExpression(
                      types.identifier('props'),
                      types.identifier('language'),
                    ),
                  ),
                  types.objectProperty(
                    types.identifier('metas'),
                    types.arrayExpression([
                      types.objectExpression([
                        types.objectProperty(
                          types.identifier('name'),
                          types.stringLiteral('description'),
                        ),
                        types.objectProperty(
                          types.identifier('content'),
                          types.stringLiteral(opts.description),
                        ),
                      ]),
                      ...opts.titleMeta.properties.map((property) => {
                        return types.objectExpression([
                          types.objectProperty(
                            types.identifier('property'),
                            types.stringLiteral(property),
                          ),
                          types.objectProperty(
                            types.identifier('content'),
                            types.stringLiteral(
                              opts.titleMeta.useTemplate
                                ? opts.titleTemplate.replace('%s', opts.title)
                                : opts.title,
                            ),
                          ),
                        ])
                      }),
                    ]),
                  ),
                ]),
              ]),
            ),
            types.returnStatement(
              types.jsxElement(
                types.jsxOpeningElement(types.jsxIdentifier('Layout'), [
                  types.jsxSpreadAttribute(types.identifier('props')),
                ]),
                types.jsxClosingElement(types.jsxIdentifier('Layout')),
                [
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

        program.body.push(fc)
      },
    },
  }
}
