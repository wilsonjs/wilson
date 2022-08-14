import type { SiteConfig, UserFrontmatter } from '@wilson/types'
import type { Plugin } from 'vite'
import { TransformResult } from 'rollup'
import { isPage } from '@wilson/utils'
import template from '@babel/template'
import types from '@babel/types'
import { userToPageFrontmatter } from '@wilson/utils'
import parse from './util/parse'
import format from './util/format'
import { generate, traverse } from './util/babel-import'

export default function tsxFrontmatterPlugin(config: SiteConfig): Plugin {
  return {
    name: 'wilson:tsx-frontmatter',
    enforce: 'pre',

    async transform(code: string, id: string): Promise<TransformResult> {
      if (!isPage(id, config.pagesDir, ['.tsx'])) {
        return null
      }

      const ast = parse(code)

      let userFrontmatter: Record<string, any> = {}
      let frontmatterExport: types.VariableDeclarator | undefined

      traverse(ast, {
        Program(path) {
          const binding = path.scope.getOwnBinding('frontmatter')

          if (
            binding &&
            types.isVariableDeclarator(binding.path.node) &&
            types.isObjectExpression(binding.path.node.init) &&
            binding.referencePaths.some((path) =>
              types.isExportNamedDeclaration(path),
            )
          ) {
            const titleProp = binding.path.node.init.properties.find(
              (prop) =>
                types.isObjectProperty(prop) &&
                types.isIdentifier(prop.key) &&
                prop.key.name === 'title',
            ) as types.ObjectProperty | undefined

            if (titleProp === undefined) {
              throw new Error(`Frontmatter does not include "title"!`)
            }

            const baseError = 'Frontmatter export must be JSON.'

            traverse(
              binding.path.node,
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
                    throw new Error(`${baseError} Illegal ${path.type} found!`)
                  }
                },
                ObjectProperty(path) {
                  if (path.node.computed) {
                    throw new Error(
                      `${baseError} Illegal computed ObjectProperty found!`,
                    )
                  }
                  if (types.isIdentifier(path.node.value)) {
                    throw new Error(
                      `${baseError} Illegal Identifier "${path.node.value.name}" in ObjectProperty found!`,
                    )
                  }
                },
                TemplateLiteral(path) {
                  const identifier = path.node.expressions.find((e) =>
                    types.isIdentifier(e),
                  ) as types.Identifier
                  if (identifier) {
                    throw new Error(
                      `${baseError} Illegal Identifier "${identifier.name}" found in TemplateLiteral`,
                    )
                  }
                },
              },
              binding.scope,
              binding.path,
            )

            frontmatterExport = binding.path.node
            userFrontmatter = new Function(
              `return ${generate(binding.path.node.init).code}`,
            )()
          } else {
            throw new Error('Page must export "frontmatter"!')
          }
        },
      })

      const frontmatter = await userToPageFrontmatter(
        userFrontmatter as UserFrontmatter,
        id,
        config,
      )

      const layout = frontmatter.layout
      const layoutPath = `${config.layoutsDir}/${layout}.tsx`
      ast.program.body = [
        template.statement(`import Layout from '${layoutPath}';`)(),
        ...ast.program.body,
      ]

      if (frontmatterExport) {
        frontmatterExport.init = template.expression(
          `${JSON.stringify(frontmatter)}`,
        )()
      } else {
        ast.program.body.push(
          template.statement(
            `export const frontmatter = ${JSON.stringify(frontmatter)};`,
          )(),
        )
      }

      return format(ast)
    },
  }
}
