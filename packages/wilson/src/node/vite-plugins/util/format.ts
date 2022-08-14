import prettier from 'prettier'
import bgenerate from '@babel/generator'
import type { File } from '@babel/types'
import type { ParseResult } from '@babel/parser'
import { generate } from './babel-import'

export default function format(ast: ParseResult<File>): string {
  return prettier.format(generate(ast).code, { filepath: 'page.tsx' })
}
