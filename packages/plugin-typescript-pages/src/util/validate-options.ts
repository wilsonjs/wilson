import z from 'zod'

export default function validateOptions(
  pluginOptions: z.AnyZodObject,
  opts: any,
) {
  try {
    pluginOptions.parse(opts)
  } catch (e) {
    if (e instanceof z.ZodError) {
      throw new Error(`Invalid plugin options: ${JSON.stringify(e.issues)}`)
    }
  }
}
