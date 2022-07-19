import type { Options } from 'tsup'

export const tsup: Options = {
  dts: true,
  target: 'node16',
  splitting: true,
  sourcemap: false,
  format: ['esm'],
  outDir: 'dist/node',
  external: ['vite'],
}
