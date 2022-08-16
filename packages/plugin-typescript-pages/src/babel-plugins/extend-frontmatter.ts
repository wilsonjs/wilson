import template from '@babel/template'
import type { PluginObj, types } from '@babel/core'
import { PageFrontmatter } from '@wilson/types'
import { isObject } from '@wilson/utils'
import z from 'zod'

const frontmatterOption = z.object({
  title: z.string(),
})

export default function extendFrontmatterPlugin(): PluginObj<{
  opts: { frontmatter: z.infer<typeof frontmatterOption> }
}> {
  return {
    name: '@wilson/babel-plugin-extend-frontmatter',
    visitor: {
      Program(path, { opts: { frontmatter } }) {
        if (frontmatter === undefined)
          throw new Error(`options.frontmatter is required!`)

        try {
          frontmatterOption.parse(frontmatter)
        } catch (e) {
          if (e instanceof z.ZodError) {
            throw new Error(
              `Invalid plugin options: ${JSON.stringify(e.issues)}`,
            )
          }
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
