import { resolveConfig } from '../config'
import { debug, rmDir, timeSince, withSpinner } from '../utils'
import { bundle } from './bundle'
import { renderPages } from './render'
import { writePages } from './write'

// TODO: write sitemap after `pagesToRender` are available
export async function build(root: string = process.cwd()) {
  const startTime = performance.now()

  process.env.NODE_ENV = 'production'
  const siteConfig = await resolveConfig(root, { command: 'build', mode: 'production' })

  rmDir(siteConfig.outDir)

  const bundleResult = await withSpinner(
    'building client + server bundles',
    async () => await bundle(siteConfig),
  )

  const pagesToRender = await renderPages(siteConfig, bundleResult)
  pagesToRender.map(({ path, outputFilename }) =>
    debug.build(`rendering page ${path} to ${outputFilename}`),
  )

  await withSpinner('writing pages', async () => await writePages(siteConfig, pagesToRender))

  rmDir(siteConfig.tempDir)
  console.info(`build complete in ${timeSince(startTime)}.`)
}
