import type { PluginObj } from '@babel/core'
import types from '@babel/types'
import z from 'zod'

const importsOption = z.array(
  z.object({
    source: z.string(),
    identifiers: z
      .array(
        z.object({ default: z.literal(true), name: z.string() }).or(
          z.object({
            default: z.literal(false),
            name: z.string(),
            alias: z.string().optional(),
          }),
        ),
      )
      .nonempty(),
  }),
)

export default function prependDefaultImportPlugin(): PluginObj<{
  opts: { imports: z.infer<typeof importsOption> }
}> {
  return {
    name: '@wilson/babel-plugin-prepend-imports',
    visitor: {
      Program(path, { opts: { imports } }) {
        if (imports === undefined)
          throw new Error('options.imports is required!')

        try {
          importsOption.parse(imports)
        } catch (e) {
          if (e instanceof z.ZodError) {
            throw new Error(
              `Invalid plugin options: ${JSON.stringify(e.issues)}`,
            )
          }
        }

        imports.forEach((i) => {
          i.identifiers.forEach((identifier) => {
            const bindingName =
              identifier.default === false
                ? identifier.alias ?? identifier.name
                : identifier.name
            if (path.scope.hasOwnBinding(bindingName)) {
              throw path.buildCodeFrameError(
                `Top-level identifier "${bindingName}" already exists!`,
              )
            }
          })
        })

        const reverseIndex = [...path.node.body]
          .reverse()
          .findIndex((node) => types.isImportDeclaration(node))
        const insertIndex =
          reverseIndex === -1 ? 0 : path.node.body.length - reverseIndex

        path.node.body.splice(
          insertIndex,
          0,
          ...(imports.map((i) =>
            types.importDeclaration(
              i.identifiers.map((id) =>
                id.default
                  ? types.importDefaultSpecifier(types.identifier(id.name))
                  : types.importSpecifier(
                      types.identifier(id.alias ?? id.name),
                      types.identifier(id.name),
                    ),
              ),
              types.stringLiteral(i.source),
            ),
          ) as types.Statement[]),
        )
      },
    },
  }
}
