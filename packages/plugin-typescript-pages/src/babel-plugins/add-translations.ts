import type { PluginObj } from '@babel/core'
import types from '@babel/types'
import z from 'zod'
import validateOptions from '../util/validate-options'

const pluginOptions = z.object({
  translations: z.set(z.object({ route: z.string(), title: z.string() })),
})

export default function addTranslationsPlugin(): PluginObj<{
  opts: z.infer<typeof pluginOptions>
}> {
  return {
    name: '@wilson/babel-plugin-add-translations',
    visitor: {
      Program(path, { opts }) {
        validateOptions(pluginOptions, opts)

        if (path.scope.hasOwnBinding('translations')) {
          throw path.buildCodeFrameError(
            `Top-level identifier "translations" already exists!`,
          )
        }

        path.node.body = [
          ...path.node.body,
          types.variableDeclaration('const', [
            types.variableDeclarator(
              types.identifier('translations'),
              types.arrayExpression(
                Array.from(opts.translations).map((translation) => {
                  return types.objectExpression([
                    types.objectProperty(
                      types.identifier('route'),
                      types.stringLiteral(translation.route),
                    ),
                    types.objectProperty(
                      types.identifier('title'),
                      types.stringLiteral(translation.title),
                    ),
                  ])
                }),
              ),
            ),
          ]),
        ]
      },
    },
  }
}
