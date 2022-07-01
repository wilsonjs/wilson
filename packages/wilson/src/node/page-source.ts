import {
  ContentFrontmatterWithDefaults,
  Frontmatter,
  FrontmatterWithDefaults,
  Heading,
  SelectFrontmatterWithDefaults,
  TaxonomyFrontmatterWithDefaults,
  TermsFrontmatterWithDefaults,
} from '../types'
import { readFileSync } from 'fs'
import { ContentPage, SelectPage, TaxonomyPage, TermsPage } from './page.js'
import { getContentPages, getTaxonomyTerms } from './state.js'
import { hasCommonElements, transformJsx } from './util.js'
import { dirname, extname, relative } from 'path'
import { getConfig } from './config.js'
import { transformMarkdown } from './markdown.js'
import { assetUrlPrefix } from './constants.js'
import FrontmatterParser from './frontmatter-parser.js'

/**
 * Represents a page source file in `pages` directory.
 */
abstract class PageSource {
  public path: string
  public language: string | undefined
  public relativePath: string
  public transformedCode: string | null = null
  abstract pages: unknown[]
  public headings?: Heading[]
  public frontmatter: Frontmatter = {} as Frontmatter

  constructor(path: string, relativePath: string) {
    this.path = path
    this.relativePath = relativePath
    const { languages } = getConfig()
    const startWithLanguageCode = new RegExp(
      `^(${languages.map((language) => language.code).join('|')})\\/`
    )
    const languageMatch = this.relativePath.match(startWithLanguageCode)
    this.language = languageMatch !== null ? languageMatch[1] : undefined
  }

  public async initialize(): Promise<void> {
    const originalCode = readFileSync(this.path, 'utf-8')
    this.transformedCode = await this.transformCode(originalCode)
  }

  public abstract createPages(): void

  protected async transformCode(originalSource: string): Promise<string> {
    return originalSource
  }
}

export class ContentPageSource extends PageSource {
  public pages: ContentPage[] = []
  public frontmatter: ContentFrontmatterWithDefaults

  constructor(
    fullPath: string,
    relativePath: string,
    frontmatter: FrontmatterWithDefaults
  ) {
    super(fullPath, relativePath)
    this.frontmatter = frontmatter as ContentFrontmatterWithDefaults
  }

  public createPages(): void {
    this.pages = []
    this.pages.push(new ContentPage(this))
  }
}

export class MarkdownPageSource extends ContentPageSource {
  public headings: Heading[] = []

  protected async transformCode(markdownCode: string): Promise<string> {
    const relativePath = dirname(`src/pages/${this.relativePath}`)
    const result = await transformMarkdown(markdownCode, relativePath)
    const { html, headings } = result

    // store headings for further use
    this.headings = headings

    // replace relative asset URL string attributes with react-style variable
    // interpolations
    let htmlCode = html
    result.assetUrls.forEach((_, i) => {
      htmlCode = htmlCode.replace(
        new RegExp(`"${assetUrlPrefix}${i}"`, 'g'),
        `{${assetUrlPrefix}${i}}`
      )
    })
    htmlCode = htmlCode.replace(
      /srcSet="((?:[^"\s,]+\s*(?:\s+(?:\d+w|[\d\.]+x))?(?:,\s*)?)+)"/g,
      (_, value) => {
        result.assetUrls.forEach((_, i) => {
          value = value.replace(
            new RegExp(`${assetUrlPrefix}${i}`, 'g'),
            `$\{${assetUrlPrefix}${i}}`
          )
        })
        return `srcSet={\`${value}\`}`
      }
    )

    // change assetUrls to URLs that work for relative javascript imports
    result.assetUrls = result.assetUrls.map((assetUrl) => {
      return assetUrl.startsWith('./')
        ? assetUrl
        : `./${relative(relativePath, assetUrl)}`
    })
    const relativeAssetImports = result.assetUrls.map(
      (url, i) => `import ${assetUrlPrefix}${i} from '${url}';`
    )

    const preactCode = `
    import { h, Fragment } from "preact";
    ${relativeAssetImports.join('\n')}
    export const Page = () => <div id="__wilson-markdown">${htmlCode}</div>;
    `

    const jsCode = transformJsx(preactCode)
    return jsCode
  }

  public async handleHotUpdate(): Promise<void> {
    const frontmatterParser = new FrontmatterParser(this.path)
    this.frontmatter =
      frontmatterParser.parseFrontmatter() as ContentFrontmatterWithDefaults
    await this.initialize()
  }
}

export class TaxonomyPageSource extends PageSource {
  public pages: TaxonomyPage[] = []
  public frontmatter: TaxonomyFrontmatterWithDefaults
  constructor(
    fullPath: string,
    relativePath: string,
    frontmatter: FrontmatterWithDefaults
  ) {
    super(fullPath, relativePath)
    this.frontmatter = frontmatter as TaxonomyFrontmatterWithDefaults
  }
  public createPages(): void {
    const terms = getTaxonomyTerms(this.frontmatter.taxonomyName)
    const config = getConfig()

    this.pages = []
    for (const term of terms) {
      const pages = getContentPages()
        .filter((contentPage) =>
          contentPage.taxonomies?.[this.frontmatter.taxonomyName]?.includes(
            term
          )
        )
        // sort by page date, descending
        .sort((a, b) => +b.date - +a.date)

      const pageSize = config.pagination.pageSize
      let currentPage = 1
      for (let i = 0, j = pages.length; i < j; i += pageSize) {
        this.pages.push(
          new TaxonomyPage(this, term, pages.slice(i, i + pageSize), {
            count: pages.length,
            currentPage,
            pageSize,
          })
        )
        currentPage++
      }
    }
  }
}

export class TermsPageSource extends PageSource {
  public pages: TermsPage[] = []
  public frontmatter: TermsFrontmatterWithDefaults
  constructor(
    fullPath: string,
    relativePath: string,
    frontmatter: FrontmatterWithDefaults
  ) {
    super(fullPath, relativePath)
    this.frontmatter = frontmatter as TermsFrontmatterWithDefaults
  }
  public createPages(): void {
    this.pages = []
    this.pages.push(new TermsPage(this))
  }
}

export class SelectPageSource extends PageSource {
  public pages: SelectPage[] = []
  public frontmatter: SelectFrontmatterWithDefaults
  constructor(
    fullPath: string,
    relativePath: string,
    frontmatter: FrontmatterWithDefaults
  ) {
    super(fullPath, relativePath)
    this.frontmatter = frontmatter as SelectFrontmatterWithDefaults
  }
  public createPages(): void {
    const { selectedTerms, taxonomyName } = this.frontmatter
    const config = getConfig()
    const pages = getContentPages()
      .reduce(
        (acc, p) =>
          hasCommonElements(selectedTerms, p.taxonomies?.[taxonomyName] ?? [])
            ? [...acc, p]
            : acc,
        [] as ContentPage[]
      )
      // sort by page date, descending
      .sort((a, b) => +b.date - +a.date)

    const pageSize = config.pagination.pageSize ?? 2
    let currentPage = 1
    this.pages = []
    for (let i = 0, j = pages.length; i < j; i += pageSize) {
      this.pages.push(
        new SelectPage(this, pages.slice(i, i + pageSize), {
          count: pages.length,
          currentPage,
          pageSize,
        })
      )
      currentPage++
    }
  }
}

export const createPageSource = async (
  fullPath: string,
  relativePath: string,
  frontmatter: FrontmatterWithDefaults
): Promise<PageSourceType> => {
  let pageSource: PageSourceType
  const constructorArgs: Parameters<typeof createPageSource> = [
    fullPath,
    relativePath,
    frontmatter,
  ]

  switch (frontmatter.type) {
    case 'taxonomy':
      pageSource = new TaxonomyPageSource(...constructorArgs)
      break
    case 'terms':
      pageSource = new TermsPageSource(...constructorArgs)
      break
    case 'select':
      pageSource = new SelectPageSource(...constructorArgs)
      break
    case 'content':
    default:
      pageSource =
        extname(fullPath) === '.md'
          ? new MarkdownPageSource(...constructorArgs)
          : new ContentPageSource(...constructorArgs)
      break
  }

  await pageSource.initialize()
  return pageSource
}

export type PageSourceType =
  | ContentPageSource
  | TaxonomyPageSource
  | TermsPageSource
  | SelectPageSource

export default PageSource
