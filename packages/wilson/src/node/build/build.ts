import { resolveConfig } from '../config'
import { debug, rmDir, timeSince, withSpinner } from '../utils'
import { bundle } from './bundle'
import { bundleIslands } from './islands'
import { renderPages } from './render'
import { writePages } from './write'

// TODO: write sitemap after `pagesToRender` are available
export async function build(root: string = process.cwd()) {
  const startTime = performance.now()

  process.env.NODE_ENV = 'production'
  const siteConfig = await resolveConfig(root, {
    command: 'build',
    mode: 'production',
  })

  rmDir(siteConfig.outDir)

  const bundleResult = await withSpinner(
    'building client + server bundles',
    async () => await bundle(siteConfig),
  )

  const { pagesToRender, islandsByPath } = await renderPages(
    siteConfig,
    bundleResult,
  )
  pagesToRender.map(({ route, outputFilename }) =>
    debug.build(`rendering page ${route} to ${outputFilename}`),
  )

  await withSpinner(
    'building islands bundle',
    async () => await bundleIslands(siteConfig, islandsByPath),
  )

  await withSpinner(
    'writing pages',
    async () => await writePages(siteConfig, pagesToRender, islandsByPath),
  )

  rmDir(siteConfig.tempDir)
  console.info(`build complete in ${timeSince(startTime)}.`)
}
