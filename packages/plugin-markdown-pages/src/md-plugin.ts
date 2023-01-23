import grayMatter from 'gray-matter'

import type { PluginOption } from 'vite'
import type { TransformResult } from 'rollup'
import type { SiteConfig, UserFrontmatter } from '@wilson/types'
import { relative } from 'pathe'
import { format } from 'prettier'
import wilsonUtils from '@wilson/utils'
import { getTranslationKeys } from '@wilson/client-utils'
import utils from './utils/index'

const {
  createJsx,
  getAssetImports,
  parseFrontmatter,
  processMarkdown,
  replaceAssetUrls,
} = utils

const { createComponentName, getRoutingInfo, isPage, userToPageFrontmatter } =
  wilsonUtils

/**
 * Wilson markdown pages plugin
 */
export default function markdownPagesPlugin(config: SiteConfig): PluginOption {
  return {
    name: 'wilson-plugin-markdown-pages',
    enforce: 'pre',

    async transform(code: string, id: string): Promise<TransformResult> {
      if (!isPage(id, config.pagesDir, ['.md'])) {
        return null
      }

      const parseResult = parseFrontmatter(code, grayMatter)
      const { jsx, assetUrls } = await processMarkdown(
        parseResult.markdown,
        config.syntaxHighlighting,
      )
      const jsxWithReplacedAssetUrls = replaceAssetUrls(jsx, assetUrls)

      // change assetUrls to URLs that work for relative javascript imports
      const relativePath = relative(config.pagesDir, id)
      const assetImports = getAssetImports(assetUrls, relativePath)

      const frontmatter = await userToPageFrontmatter(
        parseResult.frontmatter as UserFrontmatter,
        id,
        config,
      )
      const layoutPath = `${config.layoutsDir}/${frontmatter.layout}.tsx`
      const { route, translations: translatedPages } = getRoutingInfo(
        relativePath,
        config,
      )
      const componentName = createComponentName(relativePath)
      const { languageId, translationKeys } = getTranslationKeys(
        id,
        config.languages,
        config.defaultLanguage,
      )

      const newCode = createJsx(
        layoutPath,
        assetImports,
        route,
        languageId,
        config.defaultLanguage,
        frontmatter,
        translatedPages,
        translationKeys,
        componentName,
        jsxWithReplacedAssetUrls,
        config.site.titleTemplate,
      )

      return format(newCode, { filepath: 'markdown.tsx' })
    },
  }
}
