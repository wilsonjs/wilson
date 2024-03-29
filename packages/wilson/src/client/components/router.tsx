import type { PageFrontmatter } from '@wilson/types'
import type { ComponentType, RenderableProps } from 'preact'
import { Switch, Route as Woute, Router as Wouter } from 'wouter-preact'
// @ts-expect-error wouter-preact/static-location is not typed
import staticLocationHook from 'wouter-preact/static-location'
import NotFound from './not-found'

interface Page {
  default: ComponentType
  frontmatter: PageFrontmatter
  path: string
}

const pages: Record<string, Page> = import.meta.glob(
  '/src/pages/**/*.{md,tsx}',
  { eager: true },
)

/**
 * Counts how often a string occurs in a string.
 *
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
function byPathSegmentsAndDynamicParams(
  { props: { path: a } }: Route,
  { props: { path: b } }: Route,
) {
  if (a === '/') return -1
  if (b === '/') return 1
  const slashDiff = countOccurence(a, '/') - countOccurence(b, '/')
  if (slashDiff) return slashDiff
  const paramDiff = countOccurence(a, ':') - countOccurence(b, ':')
  if (paramDiff) return paramDiff
  return a.localeCompare(b)
}

interface Route {
  props: Record<string, any>
  importPath?: string
  component: ComponentType<any>
  frontmatter?: PageFrontmatter
}

const routes: Route[] = Object.entries(pages)
  .map(([file, { path, default: Page, frontmatter }]) => {
    return {
      importPath: file,
      component: Page,
      frontmatter,
      props: { path },
    }
  })
  .sort(byPathSegmentsAndDynamicParams)

if (!import.meta.env.SSR)
  routes.push({
    component: NotFound,
    props: {
      routes: routes.map(({ component, importPath, props: { path } }) => ({
        path,
        component: component.displayName,
        importPath,
      })),
    },
  })

type AppProps = RenderableProps<{
  urlToBeRendered?: string
}>

export default function Router({ urlToBeRendered }: AppProps) {
  return (
    <Wouter
      {...(urlToBeRendered === undefined
        ? {}
        : { hook: staticLocationHook(urlToBeRendered) })}
    >
      <Switch>
        {routes.map(({ component: Page, frontmatter, props }) => (
          <Woute
            {...props}
            component={(params) => (
              <>
                <div
                  dangerouslySetInnerHTML={{
                    __html: `<!-- frontmatter ${JSON.stringify(
                      frontmatter,
                    )} -->`,
                  }}
                />
                <Page {...params} {...props} />
              </>
            )}
          />
        ))}
      </Switch>
    </Wouter>
  )
}
