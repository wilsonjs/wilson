import btraverse from '@babel/traverse'
import bgenerate from '@babel/generator'

export const generate: typeof bgenerate = (
  bgenerate as any as { default: typeof bgenerate }
).default

export const traverse: typeof btraverse = (
  btraverse as any as { default: typeof btraverse }
).default
