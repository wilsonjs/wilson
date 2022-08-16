import type { PluginObj } from '@babel/core'
import template from '@babel/template'
import type * as BabelCoreNamespace from '@babel/core'

type Babel = typeof BabelCoreNamespace

interface PluginOptions {
  exportIdentifier: string
  exportString: string
}

export default function addNamedStringExportPlugin({
  types,
}: Babel): PluginObj<{
  opts: PluginOptions
}> {
  return {
    name: '@wilson/babel-plugin-add-named-string-export',
    visitor: {
      Program(path, { opts: { exportIdentifier, exportString } }) {
        if (exportIdentifier === undefined) {
          throw new Error(`options.exportIdentifer is required!`)
        }
        if (exportString === undefined) {
          throw new Error(`options.exportString is required!`)
        }

        if (path.scope.hasOwnBinding(exportIdentifier)) {
          throw path.buildCodeFrameError(
            `Top-level identifier "${exportIdentifier}" already exists!`,
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
          template.statement(
            `export const ${exportIdentifier} = '${exportString}';`,
          )(),
        )
      },
    },
  }
}
