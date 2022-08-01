import { promises as fs } from 'fs'
import type { SiteConfig } from '@wilson/types'
import { dirname, join, resolve } from 'pathe'
import type { PageToRender } from './pages'
import glob from 'fast-glob'
import { VIRTUAL_PREFIX } from './islands'
import { IslandsByPath } from './build'
import { Manifest } from 'vite'
import { uniq } from '../utils'
import { posix } from 'path'
import MagicString from 'magic-string'
import { init as initESLexer, parse as parseESModules } from 'es-module-lexer'
import beautify from 'js-beautify'
import { IslandDefinition } from 'src/client/app.server'

export async function writePages(
  config: SiteConfig,
  pagesToRender: PageToRender[],
  islandsByPath: IslandsByPath,
): Promise<void> {
  const manifest: Manifest = await parseManifest(config.outDir, islandsByPath)

  await Promise.all(
    pagesToRender.map(
      async (page) =>
        await writePage(config, page, manifest, islandsByPath[page.path] ?? []),
    ),
  )

  // Remove temporary island script files.
  const temporaryIslandsGlob = join(config.outDir, `**/${VIRTUAL_PREFIX}*.js`)
  const tempIslandFiles = await glob(temporaryIslandsGlob)
  for (const temp of tempIslandFiles) await fs.unlink(temp)
}

async function writePage(
  config: SiteConfig,
  page: PageToRender,
  manifest: Manifest,
  islands: IslandDefinition[],
): Promise<void> {
  let content = page.rendered
  const preloadScripts: string[] = []

  for (const island of islands) {
    const entry = manifest[`${VIRTUAL_PREFIX}${island.entryFilename!}`]

    if (!entry) {
      const message = `Unable to find entry for island '${island.entryFilename}' in manifest.json`
      throw new Error(message)
    }

    if (entry.imports) preloadScripts.push(...entry.imports)
    const filename = resolve(config.outDir, entry.file)
    const code = await fs.readFile(filename, 'utf-8')
    const rebasedCode = await rebaseImportsToAssetsDir(config, code)
    content = content.replace(
      `<script type="text/hydration">/*${island.placeholder}*/</script>`,
      // TODO: Remove additional script tag once Firefox is fixed
      // https://bugzilla.mozilla.org/show_bug.cgi?id=1737882
      `<script></script><script type="module" async>${rebasedCode}</script>`,
    )
  }

  page.rendered = beautify.html(
    content.replace(
      '</head>',
      `<style>wilson-island,wilson-slot{display:contents;}</style>${stringifyScripts(
        config,
        manifest,
        preloadScripts,
      )}</head>`,
    ),
    {
      indent_size: 2,
      content_unformatted: ['script'],
    },
  )
  const filename = resolve(config.outDir, page.outputFilename)
  await fs.mkdir(dirname(filename), { recursive: true })
  await fs.writeFile(filename, page.rendered, 'utf-8')
}

function stringifyScripts(
  { base }: SiteConfig,
  manifest: Manifest,
  hrefs: string[],
) {
  return [stringifyPreload(base, manifest, hrefs)].filter((x) => x).join('')
}

function stringifyPreload(base: string, manifest: Manifest, hrefs: string[]) {
  return uniq(resolveManifestEntries(manifest, hrefs))
    .map(
      (href) => `<link rel="modulepreload" href="${base}${href}" crossorigin/>`,
    )
    .join('')
}

function resolveManifestEntries(
  manifest: Manifest,
  entryNames: string[],
): string[] {
  return entryNames.flatMap((entryName) => {
    const entry = manifest[entryName]
    return [
      entry.file,
      ...resolveManifestEntries(manifest, entry.imports || []),
    ]
  })
}

async function parseManifest(outDir: string, islandsByPath: IslandsByPath) {
  const manifestPath = join(outDir, 'manifest.json')
  try {
    return JSON.parse(await fs.readFile(manifestPath, 'utf-8'))
  } catch (err) {
    if (Object.keys(islandsByPath).length > 0) throw err
    return {}
  }
}

async function rebaseImportsToAssetsDir(config: SiteConfig, code: string) {
  const assetsBase = posix.join(config.base, config.assetsDir)

  try {
    await initESLexer
    const [imports] = parseESModules(code)
    const ms = new MagicString(code)
    imports.forEach(({ s, e, d }) => {
      // Skip quotes if dynamic import.
      if (d > -1) {
        s += 1
        e -= 1
      }
      ms.overwrite(s, e, posix.join(assetsBase, ms.slice(s, e)), {
        contentOnly: true,
      })
    })
    return ms.toString()
  } catch (error) {
    console.error(error)
    return code
  }
}
