import template from '@babel/template'
import type { PluginObj, types } from '@babel/core'
import { PageFrontmatter } from '@wilson/types'
import { isObject } from '@wilson/utils'

interface PluginOpts {
  frontmatter: PageFrontmatter
}

export default function extendFrontmatterPlugin(): PluginObj<{
  opts: PluginOpts
}> {
  return {
    name: '@wilson/babel-plugin-extend-frontmatter',
    visitor: {
      Program(path, { opts: { frontmatter } }) {
        if (frontmatter === undefined) {
          throw new Error(`options.frontmatter is required!`)
        }
        if (!isObject(frontmatter)) {
          throw new Error(`options.frontmatter must be an object!`)
        }

        const binding = path.scope.getOwnBinding('frontmatter')
        const declarator = binding!.path.node as types.VariableDeclarator

        declarator.init = template.expression(
          `${JSON.stringify(frontmatter)}`,
        )()
      },
    },
  }
}
