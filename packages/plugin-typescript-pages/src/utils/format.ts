import prettier from 'prettier'
import type { File } from '@babel/types'
import { generate } from './babel-import'

export default function format(ast: File): string {
  return prettier.format(generate(ast).code, { filepath: 'page.tsx' })
}
