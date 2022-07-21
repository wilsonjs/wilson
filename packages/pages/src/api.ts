import glob from 'fast-glob'
import deepEqual from 'deep-equal'
import { extname, relative, resolve } from 'pathe'
import pc from 'picocolors'
import type { Page, RenderedPath, Route } from '@wilson/types'
import type { Options } from './types'
import { debug, slash } from './utils'
import { DATA_MODULE_ID, ROUTES_MODULE_ID } from './types'
import { clearPageBuild } from './vite'
import { getFrontmatter, getRenderedPaths } from './typescript'

const pageByPath = new Map<string, Page>()

/**
 * Returns one or all pages.
 *
 * @param absolutePath The absolute path to the page
 * @returns An array of pages when no path is given, or the page when a path is given.
 */
export async function getPages(absolutePath?: undefined): Promise<Page[]>
export async function getPages(absolutePath: string): Promise<Page | undefined>
export async function getPages(
  absolutePath: string | undefined,
): Promise<Page[] | Page | undefined> {
  return absolutePath === undefined
    ? (Array.from(pageByPath.values()) as Page[])
    : pageByPath.get(absolutePath)
}

export function createApi(options: Options) {
  const { extendRoutes, pageExtensions, pagesDir, root, srcDir } = options
  let addedAllPages: Promise<void>

  const extensionsRE = new RegExp(`(${pageExtensions.join('|')})$`)

  return {
    get pages() {
      return pageByPath
    },
    isPage(file: string) {
      file = slash(file)
      return file.startsWith(pagesDir) && extensionsRE.test(file)
    },
    pageForFilename(file: string) {
      return pageByPath.get(resolve(root, file))
    },
    async forceAddAllPages() {
      const absolutePaths = await glob(`${pagesDir}/**/*{${pageExtensions.join(',')}}`, {
        onlyFiles: true,
      })
      await Promise.all(
        absolutePaths.map(async (absolutePath) => await this.addPage(slash(absolutePath))),
      )
    },
    async addAllPages() {
      addedAllPages ||= this.forceAddAllPages()
      await addedAllPages
    },
    errorOnDuplicateRoutes() {
      const allPages = Array.from(pageByPath).map(([_, p]) => p)
      const duplicateRoutePages = allPages.filter((p1) =>
        allPages.some((p2) => p1.path !== p2.path && p1.route === p2.route),
      )
      if (duplicateRoutePages.length > 0) {
        throw new Error(
          `Multiple pages with route "${
            duplicateRoutePages[0].route
          }" detected: [${duplicateRoutePages.map((r) => r.path).join(', ')}]"`,
        )
      }
    },
    /**
     * Throws an error when the given path includes forbidden characters.
     *
     * @param path The path of a page file.
     */
    errorOnDisallowedCharacters(path: string) {
      if (path.match(/^[0-9a-z._\-\/\[\]]+$/i) === null) {
        throw new Error(
          `Page "${path}" has forbidden characters. Pages can only have 0-9a-zA-Z._-/[]\n`,
        )
      }
    },

    async addPage(absolutePath: string) {
      const path = relative(pagesDir, absolutePath)
      this.errorOnDisallowedCharacters(path)
      const { route, isDynamic } = this.extractRouteInfo(path)
      const renderedPaths = isDynamic
        ? await getRenderedPaths(options, absolutePath, path, route)
        : [{ params: {}, url: route }]
      const frontmatter = await getFrontmatter(absolutePath, options.tempDir, options.pagesDir)
      const rootPath = relative(root, absolutePath)
      const page: Page = {
        path,
        fileExtension: extname(absolutePath),
        route,
        isDynamic,
        frontmatter,
        absolutePath,
        rootPath,
        importPath: `./${rootPath}`,
        srcPath: relative(srcDir, absolutePath),
        renderedPaths,
        componentName: this.createComponentName(path),
      }
      pageByPath.set(absolutePath, page)
      this.errorOnDuplicateRoutes()
      return page
    },
    removePage(absolutePath: string) {
      pageByPath.delete(absolutePath)
    },

    async updatePage(absolutePath: string) {
      const page = this.pageForFilename(absolutePath)
      const prevMatter = page?.frontmatter
      const prevInstances = page?.renderedPaths
      clearPageBuild(absolutePath)
      const { frontmatter, renderedPaths } = await this.addPage(absolutePath)
      // Could do this comparison of previous and new page
      // with jest-diff or similar for better readability.
      debug.hmr('%s old: %O', absolutePath, prevMatter, prevInstances)
      debug.hmr('%s new: %O', absolutePath, frontmatter, renderedPaths)
      return {
        changed: !deepEqual(prevMatter, frontmatter) || !deepEqual(prevInstances, renderedPaths),
        needsReload:
          !deepEqual(prevMatter?.route, frontmatter?.route) ||
          !deepEqual(prevInstances, renderedPaths),
      }
    },

    createComponentName(path: string) {
      const withoutExtension = path.slice(0, path.lastIndexOf('.'))
      const pascalCased = withoutExtension
        .split('/')
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join('')
      const variablesReplaced = pascalCased.replace(/\[([^\]]+)\]/g, '$$$1')
      const onlyAllowedChars = variablesReplaced.replace(/[^a-z0-9$_]/gi, '')
      return onlyAllowedChars.replace(
        /\$(.{1})/g,
        (s: string) => s.charAt(0) + s.charAt(1).toUpperCase(),
      )
    },
    isDynamicPath(segment: string) {
      return /\[[^\]]+\]/.test(segment)
    },
    extractRouteInfo(relativePath: string) {
      const isDynamic = this.isDynamicPath(relativePath)
      const reactRouterLike = relativePath
        .split('/')
        .filter((x) => x)
        .map((segment) =>
          this.isDynamicPath(segment)
            ? segment.replace(/\[([^\]]+)\]/g, ':$1')
            : segment.toLowerCase(),
        )
        .join('/')
      let route = reactRouterLike
        .slice(0, reactRouterLike.lastIndexOf('.'))
        .replace(/index$/, '')
        .replace(/^\/|\/$/g, '')
        .replace(/(:[^/]+)$/, '$1?')

      if (route === '') route = '/'
      return { route, isDynamic }
    },

    async getExtendedRoutes(pages: Page[]): Promise<Route[]> {
      const routes: Route[] = pages.map(({ componentName, route, importPath }) => ({
        route,
        componentName,
        importPath,
      }))
      return (await extendRoutes?.(routes)) || routes
    },

    /**
     * Returns an array of all pages, sorted by path segments and dynamic params.
     * @returns Array of pages.
     */
    getSortedPages(): Page[] {
      return Array.from(pageByPath.values()).sort(byPathSegmentsAndDynamicParams)
    },

    async generateDataModule(): Promise<string> {
      const pages = this.getSortedPages()
      const routes = await this.getExtendedRoutes(pages)
      const code = `export default ${JSON.stringify(routes, null, 2)}`
      debug.virtual(
        `generated code for ${pc.green(DATA_MODULE_ID)}:\n${code
          .split('\n')
          .map((line) => pc.gray(`  ${line}`))
          .join('\n')}`,
      )
      return code
    },

    /**
     * Returns the page for the given importPath.
     * @param importPath page importPath, e.g. `src/pages/blog/[page].tsx`
     */
    getPageByImportPath(importPath: string): Page | undefined {
      return Array.from(pageByPath.values()).find((page) => page.importPath === importPath)
    },

    /**
     * Returns an object that maps dynamic route paths to props for specific
     * parameter matches.
     * @param routes An array of routes
     */
    getSpecificRouteProps(routes: Route[]): {
      [dynamicRoutePath: string]: {
        matches: { [routeParameter: string]: string }
        props: Record<string, any>
      }
    } {
      return routes.reduce((acc: {}, { importPath, route }: Route) => {
        const page = this.getPageByImportPath(importPath)
        if (!page || !page.isDynamic) return acc

        const toMatchedProps = (acc: any[], i: RenderedPath) =>
          i.props ? [...acc, { matches: i.params, props: i.props }] : acc

        const matchedProps = page.renderedPaths.reduce(toMatchedProps, [])
        return matchedProps.length > 0 ? { ...acc, [route]: matchedProps } : acc
      }, {})
    },

    /**
     * Returns import statement source code for the given route, e.g.
     * `import BlogIndex from './src/pages/blog/index.tsx';`
     */
    getRouteImportCode({ componentName, importPath }: Route): string {
      return `import ${componentName} from '${importPath}';`
    },

    /**
     * Returns displayName assignment source code for the given route, e.g.
     * `BlogIndex.displayName = 'BlogIndex';`
     */
    getRouteDisplayNameCode({ componentName }: Route): string {
      return `${componentName}.displayName = '${componentName}';`
    },

    /**
     * Returns createElement preact source code for the given route, e.g.
     * `h(BlogIndex, { path: '/blog', element: BlogIndex })`
     */
    getRouteCreateElementCode({ componentName, route }: Route): string {
      return `h(PageWrapper, { path: "${route}", element: ${componentName} })`
    },

    /**
     * Generates routes module, which exports an array of preact-router
     * route components.
     * @returns Source code for routes module.
     */
    async generateRoutesModule(): Promise<string> {
      const pages = this.getSortedPages()
      const routes = await this.getExtendedRoutes(pages)
      const specificMatchProps = this.getSpecificRouteProps(routes)

      const code = `import { h } from 'preact';
import { shallowEqual } from 'fast-equals';
${routes.map(this.getRouteImportCode).join('\n')}\n
${routes.map(this.getRouteDisplayNameCode).join('\n')}\n
const specificMatchProps = ${JSON.stringify(specificMatchProps, null, 2)};

const PageWrapper = ({ path, element, matches, url, ...rest }) => {
  const specificPathProps = specificMatchProps[path]
  const specific = specificPathProps?.find(({ matches: m }) => shallowEqual(m, matches))
  return h(element, { params: matches, path, url, ...(specific ? specific.props : {}) });
}

export default [
  ${routes.map(this.getRouteCreateElementCode).join(',\n  ')}
];`
      debug.virtual(
        `generated code for ${pc.green(ROUTES_MODULE_ID)}:\n${code
          .split('\n')
          .map((line) => pc.gray(`  ${line}`))
          .join('\n')}`,
      )
      return code
    },
  }
}

/**
 * Counts how often a string occurs in a string.
 * @param value String to be searched in
 * @param char String to be searched for
 * @returns Number of occurrences
 */
export function countOccurence(search: string, char: string) {
  return (search.match(new RegExp(char, 'g')) || []).length
}

/**
 * Compares two pages by their number of path segments and dynamic params.
 */
function byPathSegmentsAndDynamicParams({ route: a }: Page, { route: b }: Page) {
  if (a === '/') return -1
  if (b === '/') return 1
  const slashDiff = countOccurence(a, '/') - countOccurence(b, '/')
  if (slashDiff) return slashDiff
  const paramDiff = countOccurence(a, ':') - countOccurence(b, ':')
  if (paramDiff) return paramDiff
  return a.localeCompare(b)
}
