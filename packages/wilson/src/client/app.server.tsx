import routes from 'virtual:wilson-routes'
import { Router } from 'preact-router'
import render from 'preact-render-to-string'
import { cloneElement, options } from 'preact'
import type { RenderableProps, VNode } from 'preact'
import type { LazyHydrationAttributes } from '../../types/hydration'

/**
 * Provides preact-router with the `urlToBeRendered`.
 */
function App({
  urlToBeRendered,
}: RenderableProps<{
  urlToBeRendered: string
}>) {
  return <Router url={urlToBeRendered}>{routes}</Router>
}

export interface IslandDefinition {
  id: string
  script: string
  placeholder: string
  componentPath: string
  entryFilename?: string
}
export type IslandsByPath = Record<string, IslandDefinition[]>

let islands: IslandDefinition[] = []

function createLazyHydrationWrapper(fileName: string) {
  /**
   * Prepends a `text/hydration` script tag.
   */
  return function LazyHydrationWrapper({
    children,
    ...props
  }: RenderableProps<{}>) {
    console.log({ fileName })
    // TODO: retrieve componentPath
    //    might work by comparing type with all types found in /src/islands
    const componentPath =
      '/home/christoph/projects/wilson2/sites/codepunkt.de/src/islands/Decrease.tsx'
    // cwd()                                              /src/islands/.....
    const no = islands.length + 1
    const island = {
      componentPath,
      id: `island-${no}`,
      placeholder: `island-hydration-${no}`,
      script: /* js */ `
        import { hydrateNow } from '@wilson/hydration';
        import { default as component } from '${componentPath}';
        hydrateNow(component, 'island-${no}', ${JSON.stringify(props)}, {});
      `,
    }
    islands.push(island)
    return (
      <>
        <wilson-island id={island.id}>{children}</wilson-island>
        <script type="text/hydration">/*{island.placeholder}*/</script>
      </>
    )
  }
}

interface PotentiallyLazyHydratedVNode<
  T extends LazyHydrationAttributes = LazyHydrationAttributes,
> extends VNode<T> {
  wrapped?: true
  __source?: { fileName: string }
  __self?: unknown
}

let busy = false
let counter = 0

async function prepareLazyHydrationHook(vnode: PotentiallyLazyHydratedVNode) {
  if (
    vnode.props.clientLoad &&
    !busy &&
    !vnode.wrapped &&
    typeof vnode.type !== 'string'
  ) {
    // important because cloneElement calls options.vnode
    busy = true
    // @ts-ignore
    const clone = cloneElement(
      vnode,
      vnode.props,
    ) as PotentiallyLazyHydratedVNode
    busy = false
    clone.wrapped = true
    vnode.type = createLazyHydrationWrapper(vnode.__source!.fileName as string)
    vnode.props.children = [clone]
    counter = counter + 1
  }
}

const originalHook = options.vnode
options.vnode = (vnode: VNode) => {
  prepareLazyHydrationHook(vnode)
  if (originalHook) originalHook(vnode)
}

export interface ServerRenderResult {
  /**
   * Page component rendered to a string.
   */
  html: string
  /**
   * Islands that were found.
   */
  islands: IslandDefinition[]
}

export type RenderToStringFn = (
  renderedUrl: string,
) => Promise<ServerRenderResult>

export default async function renderToString(
  urlToBeRendered: string,
): Promise<ServerRenderResult> {
  islands = []
  const html = render(<App urlToBeRendered={urlToBeRendered} />)
  return { html, islands }
}
