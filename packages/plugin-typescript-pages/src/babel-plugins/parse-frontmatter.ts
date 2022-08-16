// import type * as BabelCoreNamespace from '@babel/core';
// import type * as BabelTypesNamespace from '@babel/types';
// import type { PluginObj, PluginPass } from '@babel/core';

// export type Babel = typeof BabelCoreNamespace;
// export type BabelTypes = typeof BabelTypesNamespace;

import type * as BabelCoreNamespace from '@babel/core'
import type { PluginObj } from '@babel/core'
import { generate } from '../util/babel-import'
import * as types from '@babel/types'
import { UserFrontmatter } from '@wilson/types'

type Babel = typeof BabelCoreNamespace

interface PluginOpts {
  frontmatter?: UserFrontmatter
}

export default function parseFrontmatterPlugin({
  traverse,
}: Babel): PluginObj<{ opts: PluginOpts }> {
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
      Program(path, state) {
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

            const userFrontmatter = new Function(
              `return ${generate(frontmatterBinding.path.node.init).code}`,
            )() as UserFrontmatter

            state.opts.frontmatter = userFrontmatter
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
