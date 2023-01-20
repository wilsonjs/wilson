import type { GetManualChunk, GetManualChunkApi } from 'rollup'

export function extendManualChunks(): GetManualChunk {
  // const userChunks = config.ssg.manualChunks
  const cache = new Map<string, string | undefined>()
  const chunkForExtension = {
    tsx: `vendor-preact`,
  }
  return (id, api) => {
    // const name = userChunks?.(id, api)
    const name = undefined
    if (name) return name
    if (id.includes('vite/') || id.includes('@preact/preset-vite'))
      return 'vite'
    if (id.includes('hydration/dist')) return 'wilson'
    if (id.includes('node_modules'))
      return vendorPerFramework(chunkForExtension, id, api, cache)
  }
}

// Internal: Categorizes dependencies based on which islands are importing them.
//
// This heuristic ensures that framework-specific dependencies don't end up in a
// shared chunk which would delay hydration for all islands.
function vendorPerFramework(
  chunkForExtension: Record<string, string>,
  id: string,
  api: GetManualChunkApi,
  cache: Map<string, string | undefined>,
  importStack: string[] = [],
): string | undefined {
  if (cache.has(id)) return cache.get(id)

  // handle circular dependencies
  if (importStack.includes(id)) {
    cache.set(id, undefined)
    return
  }

  const mod = api.getModuleInfo(id)
  if (!mod) {
    cache.set(id, undefined)
    return
  }

  if (mod.isEntry) {
    const queryIndex = id.lastIndexOf('?')
    const idWithoutQuery = queryIndex > -1 ? id.slice(0, queryIndex) : id
    const extension = idWithoutQuery.slice(idWithoutQuery.lastIndexOf('.') + 1)
    const name = chunkForExtension[extension]
    cache.set(id, name)
    return name
  }

  let name
  for (const importer of mod.importers) {
    const importerChunk = vendorPerFramework(
      chunkForExtension,
      importer,
      api,
      cache,
      importStack.concat(id),
    )
    if (!name) name = importerChunk
    if (importerChunk && importerChunk !== name) break
  }
  cache.set(id, name)
  return name
}
