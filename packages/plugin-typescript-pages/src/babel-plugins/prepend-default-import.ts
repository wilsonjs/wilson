import type { PluginObj } from '@babel/core'
import template from '@babel/template'

interface PluginOpts {
  importIdentifier: string
  importSource: string
}

export default function prependDefaultImportPlugin(): PluginObj<{
  opts: PluginOpts
}> {
  return {
    name: '@wilson/babel-plugin-prepend-default-import',
    visitor: {
      Program(path, { opts: { importIdentifier, importSource } }) {
        if (importIdentifier === undefined) {
          throw new Error(`options.importIdentifier is required!`)
        }
        if (importSource === undefined) {
          throw new Error(`options.importSource is required!`)
        }

        if (path.scope.hasOwnBinding(importIdentifier)) {
          throw path.buildCodeFrameError(
            `Top-level identifier "${importIdentifier}" already exists!`,
          )
        }

        path.node.body = [
          template.statement(
            `import ${importIdentifier} from '${importSource}';`,
          )(),
          ...path.node.body,
        ]
      },
    },
  }
}
