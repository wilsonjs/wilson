import { Plugin } from 'vite'
import { LoadResult } from 'rollup'
import { readFile } from 'fs/promises'
import { transform as transformSVG } from '@svgr/core'
import { transformJsx } from '../util.js'

const cache = new Map()

const svgPlugin = async (): Promise<Plugin> => {
  return {
    name: 'wilson-plugin-svg',
    enforce: 'pre',

    async load(id): Promise<LoadResult> {
      if (!id.match(/\.svg\?component$/)) return

      id = id.replace(/\?component$/, '')
      let result = cache.get(id)

      if (!result) {
        const buffer = await readFile(id)
        const jsx = await transformSVG(buffer.toString())
        result = `import { h } from 'preact';\n${transformJsx(jsx)}`
        cache.set(id, result)
      }

      return result
    },
  }
}

export default svgPlugin
