import btraverse from '@babel/traverse'
import bgenerate from '@babel/generator'

function getTypedDefault<T>(input: any): T {
  return (input as { default: T }).default
}

export const traverse = getTypedDefault<typeof btraverse>(btraverse)
export const generate = getTypedDefault<typeof bgenerate>(bgenerate)
