import { SiteConfig } from '@wilson/config'
import { PageToRender } from './pages'
import { promises as fs } from 'fs'
import { dirname, resolve } from 'pathe'

export async function writePages(
  siteConfig: SiteConfig,
  pagesToRender: PageToRender[]
): Promise<void> {
  await Promise.all(pagesToRender.map(async (page) => await writePage(siteConfig, page)))
}

async function writePage(siteConfig: SiteConfig, page: PageToRender): Promise<void> {
  const filename = resolve(siteConfig.outDir, page.outputFilename)
  await fs.mkdir(dirname(filename), { recursive: true })
  await fs.writeFile(filename, page.rendered, 'utf-8')
}
