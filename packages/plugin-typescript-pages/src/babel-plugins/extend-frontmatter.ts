import template from '@babel/template'
import type { PluginObj, types } from '@babel/core'
import z from 'zod'
import validateOptions from '../util/validate-options'

const pluginOptions = z.object({
  frontmatter: z.object({
    title: z.string(),
  }),
})

export default function extendFrontmatterPlugin(): PluginObj<{
  opts: z.infer<typeof pluginOptions>
}> {
  return {
    name: '@wilson/babel-plugin-extend-frontmatter',
    visitor: {
      Program(path, { opts }) {
        validateOptions(pluginOptions, opts)

        const binding = path.scope.getOwnBinding('frontmatter')
        const declarator = binding!.path.node as types.VariableDeclarator

        declarator.init = template.expression(
          `${JSON.stringify(opts.frontmatter)}`,
        )()
      },
    },
  }
}
