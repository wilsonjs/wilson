import type { PluginObj } from '@babel/core'
import types from '@babel/types'
import z from 'zod'

const pluginOptions = z.object({
  relativePath: z.string(),
})

export default function addNamedStringExportPlugin(): PluginObj<{
  opts: z.infer<typeof pluginOptions>
}> {
  return {
    name: '@wilson/babel-plugin-add-static-paths',
    visitor: {
      Program(path, { opts }) {
        try {
          pluginOptions.parse(opts)
        } catch (e) {
          if (e instanceof z.ZodError) {
            throw new Error(
              `Invalid plugin options: ${JSON.stringify(e.issues)}`,
            )
          }
        }

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

        const insertIndex =
          1 + path.node.body.findIndex((s) => s === exportPath.node)

        path.node.body.splice(
          insertIndex,
          0,
          types.variableDeclaration('const', [
            types.variableDeclarator(
              types.identifier('staticPaths'),
              types.awaitExpression(
                types.callExpression(types.identifier('getStaticPaths'), [
                  types.objectExpression([
                    types.objectProperty(
                      types.identifier('getPages'),
                      types.arrowFunctionExpression(
                        [types.identifier('path')],
                        types.arrayExpression([]),
                      ),
                    ),
                    types.objectProperty(
                      types.identifier('paginate'),
                      types.callExpression(
                        types.identifier('createPaginationHelper'),
                        [types.stringLiteral(`${opts.relativePath}`)],
                      ),
                    ),
                  ]),
                ]),
              ),
            ),
          ]),
        )
      },
    },
  }
}
