import type * as BabelCoreNamespace from '@babel/core'
import * as types from '@babel/types'
import type { UserFrontmatter } from '@wilson/types'
import z from 'zod'
import { generate } from '../utils/babel-import'
import validateOptions from '../utils/validate-options'

type Babel = typeof BabelCoreNamespace

const pluginOptions = z.object({
  frontmatter: z.object({}),
})

export default function parseFrontmatterPlugin({
  traverse,
}: Babel): BabelCoreNamespace.PluginObj<{
  opts: z.infer<typeof pluginOptions>
}> {
  function findTitle(
    frontmatterObjectExpression: types.ObjectExpression,
  ): types.ObjectProperty | undefined {
    return frontmatterObjectExpression.properties.find(
      (prop) =>
        types.isObjectProperty(prop) &&
        types.isIdentifier(prop.key) &&
        prop.key.name === 'title',
    ) as types.ObjectProperty | undefined
  }

  return {
    name: '@wilson/babel-plugin-parse-frontmatter',
    visitor: {
      Program(path, { opts }) {
        validateOptions(pluginOptions, opts)

        const frontmatterBinding = path.scope.getOwnBinding('frontmatter')

        if (
          frontmatterBinding &&
          types.isVariableDeclarator(frontmatterBinding.path.node) &&
          types.isObjectExpression(frontmatterBinding.path.node.init)
        ) {
          if (
            frontmatterBinding.referencePaths.some((path) =>
              types.isExportNamedDeclaration(path),
            )
          ) {
            const baseError = 'Frontmatter export must be JSON.'

            traverse(
              frontmatterBinding.path.node,
              {
                enter(path) {
                  if (
                    ![
                      'Identifier',
                      'ArrayExpression',
                      'ObjectExpression',
                      'ObjectProperty',
                      'TemplateLiteral',
                      'TemplateElement',
                      'StringLiteral',
                      'BooleanLiteral',
                      'NullLiteral',
                      'NumericLiteral',
                      'TSTypeAnnotation',
                      'TSTypeReference',
                    ].includes(path.type)
                  ) {
                    throw path.buildCodeFrameError(
                      `${baseError} Illegal ${path.type} found!`,
                    )
                  }
                },
                ArrayExpression(path) {
                  const identifier = path.node.elements.find((element) =>
                    types.isIdentifier(element),
                  ) as types.Identifier | undefined
                  if (identifier !== undefined) {
                    throw path.buildCodeFrameError(
                      `${baseError} Illegal Identifier "${identifier.name}" in ArrayExpression found!`,
                    )
                  }
                },
                ObjectProperty(path) {
                  if (path.node.computed) {
                    throw path.buildCodeFrameError(
                      `${baseError} Illegal computed ObjectProperty found!`,
                    )
                  }
                  if (types.isIdentifier(path.node.value)) {
                    throw path.buildCodeFrameError(
                      `${baseError} Illegal Identifier "${path.node.value.name}" in ObjectProperty found!`,
                    )
                  }
                },
                TemplateLiteral(path) {
                  const identifier = path.node.expressions.find((e) =>
                    types.isIdentifier(e),
                  ) as types.Identifier
                  if (identifier) {
                    throw path.buildCodeFrameError(
                      `${baseError} Illegal Identifier "${identifier.name}" found in TemplateLiteral`,
                    )
                  }
                },
              },
              frontmatterBinding.scope,
              frontmatterBinding.path,
            )

            if (findTitle(frontmatterBinding.path.node.init) === undefined) {
              throw frontmatterBinding.path.buildCodeFrameError(
                `Page frontmatter does not include "title"!`,
              )
            }

            // eslint-disable-next-line no-new-func
            const userFrontmatter = new Function(
              `return ${generate(frontmatterBinding.path.node.init).code}`,
            )() as UserFrontmatter

            opts.frontmatter = userFrontmatter
          } else {
            throw frontmatterBinding.path.buildCodeFrameError(
              'Pages must export "frontmatter"!',
            )
          }
        } else {
          throw path.buildCodeFrameError('Pages must export "frontmatter"!')
        }
      },
    },
  }
}
