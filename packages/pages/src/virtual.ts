import type { PageFrontmatter, RenderedPath, Route } from '@wilson/types'
import pc from 'picocolors'
import { getPageByImportPath, getSortedPages } from './api'
import type { Options } from './types'
import { DATA_MODULE_ID, ROUTES_MODULE_ID } from './types'
import { debug } from './utils'

type ExtendRoutes = Options['extendRoutes']

/**
 * Returns import statement source code for the given route, e.g.
 * `import BlogIndex from './src/pages/blog/index.tsx';`
 */
function getRouteImportCode({ componentName, importPath }: Route): string {
  return `import ${componentName} from '${importPath}';`
}

/**
 * Returns displayName assignment source code for the given route, e.g.
 * `BlogIndex.displayName = 'BlogIndex';`
 */
function getRouteDisplayNameCode({ componentName }: Route): string {
  return `${componentName}.displayName = '${componentName}';`
}

/**
 * Returns createElement preact source code for the given route, e.g.
 * `h(BlogIndex, { path: '/blog', element: BlogIndex })`
 */
function getRouteCreateElementCode({ componentName, route }: Route): string {
  return `h(PageWrapper, { ${
    route === '*' ? `default: true` : `path: "${route}"`
  }, element: ${componentName} })`
}

/**
 * Returns an array of Route objets, potentially extended via `extendRoutes`
 * user configuration.
 *
 * @param extendRoutes User-configurable function to access and optionally modify routes
 * @returns An array of routes
 */
async function getRoutes(extendRoutes: ExtendRoutes): Promise<Route[]> {
  const pages = getSortedPages()
  const routes: Route[] = pages.map(({ componentName, importPath, route }) => ({
    componentName,
    importPath,
    route,
  }))
  return (await extendRoutes?.(routes)) || routes
}

/**
 * Returns an object that maps dynamic route paths to props for specific
 * parameter matches.
 *
 * @param routes An array of routes
 */
function getSpecificRouteProps(routes: Route[]): {
  [dynamicRoutePath: string]: {
    matches: { [routeParameter: string]: string }
    props: Record<string, any>
  }
} {
  return routes.reduce((acc, { importPath, route }: Route) => {
    const page = getPageByImportPath(importPath)
    if (!page || !page.isDynamic) return acc

    const toMatchedProps = (acc: any[], i: RenderedPath) =>
      i.props ? [...acc, { matches: i.params, props: i.props }] : acc

    const matchedProps = page.renderedPaths.reduce(toMatchedProps, [])
    return matchedProps.length > 0 ? { ...acc, [route]: matchedProps } : acc
  }, {})
}

// TODO: comment this function
/**
 *
 * @param routes
 * @returns
 */
function getFrontmatterByPath(routes: Route[]): { [route: string]: PageFrontmatter } {
  return routes.reduce((acc, { importPath, route }) => {
    const page = getPageByImportPath(importPath)
    return page ? { ...acc, [route]: page.frontmatter } : acc
  }, {})
}

/**
 * Debug output that shows generatede source code for a virtual module.
 *
 * @param code Source code
 * @param module virtual module
 */
function debugCodeForModule(code: string, module: string): void {
  debug.virtual(
    `generated code for ${pc.green(module)}:\n${code
      .split('\n')
      .map((line) => pc.gray(`  ${line}`))
      .join('\n')}`,
  )
}

/**
 * Generates routes module, which exports an array of preact-router
 * route components.
 *
 * @param extendRoutes User-configurable function to access and optionally modify routes
 * @returns Source code for routes module.
 */
export async function generateRoutesModule(extendRoutes: ExtendRoutes): Promise<string> {
  const routes = await getRoutes(extendRoutes)
  const specificMatchProps = getSpecificRouteProps(routes)
  const frontMatterByPath = getFrontmatterByPath(routes)

  const code = /* js */ `
    import { h } from 'preact';
    import { shallowEqual } from 'fast-equals';
    ${routes.map(getRouteImportCode).join('\n')}\n
    ${routes.map(getRouteDisplayNameCode).join('\n')}\n
    const specificMatchProps = ${JSON.stringify(specificMatchProps, null, 2)};
    const frontMatterByPath = ${JSON.stringify(frontMatterByPath, null, 2)};

    const PageWrapper = ({ path, element, matches, url, ...rest }) => {
      const frontmatter = frontMatterByPath[path] ?? {};
      const specific = specificMatchProps[path]?.find(({ matches: m }) => shallowEqual(m, matches))
      return h(element, { params: matches, path, url, frontmatter, ...(specific ? specific.props : {}) });
    }

    export default [
      ${routes.map(getRouteCreateElementCode).join(',\n  ')}
    ];
  `

  debugCodeForModule(code, ROUTES_MODULE_ID)
  return code
}

/**
 * Generates routes data module, which exports an array of route objects.
 *
 * @param extendRoutes User-configurable function to access and optionally modify routes
 * @returns Source code for routes data module.
 */
export async function generateDataModule(extendRoutes: ExtendRoutes): Promise<string> {
  const routes = await getRoutes(extendRoutes)

  const code = /* js */ `
    export default ${JSON.stringify(routes, null, 2)}
  `

  debugCodeForModule(code, DATA_MODULE_ID)
  return code
}
