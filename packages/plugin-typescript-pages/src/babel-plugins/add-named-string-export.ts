import type { PluginObj } from '@babel/core'
import types from '@babel/types'
import z from 'zod'
import validateOptions from '../utils/validate-options'

const pluginOptions = z.object({
  exportIdentifier: z.string(),
  exportString: z.string(),
})

export default function addNamedStringExportPlugin(): PluginObj<{
  opts: z.infer<typeof pluginOptions>
}> {
  return {
    name: '@wilson/babel-plugin-add-named-string-export',
    visitor: {
      Program(path, { opts }) {
        validateOptions(pluginOptions, opts)

        if (path.scope.hasOwnBinding(opts.exportIdentifier)) {
          throw path.buildCodeFrameError(
            `Top-level identifier "${opts.exportIdentifier}" already exists!`,
          )
        }

        const firstExportIndex = path.node.body.findIndex(
          (node) =>
            types.isExportNamedDeclaration(node) ||
            types.isExportDefaultDeclaration(node),
        )

        path.node.body.splice(
          firstExportIndex === -1 ? path.node.body.length : firstExportIndex,
          0,
          types.exportNamedDeclaration(
            types.variableDeclaration('const', [
              types.variableDeclarator(
                types.identifier(opts.exportIdentifier),
                types.stringLiteral(opts.exportString),
              ),
            ]),
          ),
        )
      },
    },
  }
}
