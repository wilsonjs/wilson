import routes from 'virtual:wilson-routes'
import { Router } from 'preact-router'
import render from 'preact-render-to-string'
import { cloneElement, ComponentChild, options, toChildArray } from 'preact'
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

/**
 * Wraps island in a `wilson-island` web component and prepends a
 * `text/hydration` script tag with a placeholder for hydration code.
 *
 * Also constructs an `island` object that is used to replace the
 * placeholder script tag with the real code performing the partial,
 * possibly lazy hydration.
 */
function createLazyHydrationWrapper(islandPath: string) {
  return function LazyHydrationWrapper({
    children,
    ...propsWithoutChildren
  }: RenderableProps<{}>) {
    const islandChildren = ((children as ComponentChild[])[0] as VNode).props
      .children
    const defaultSlot = render(toChildArray(islandChildren)[0] as VNode)
    const no = islands.length + 1
    const island = {
      componentPath: islandPath,
      id: `island-${no}`,
      placeholder: `island-hydration-${no}`,
      script: /* js */ `
        import { hydrateNow } from '@wilson/hydration';
        import { default as component } from '${islandPath}';
        hydrateNow(
          component,
          'island-${no}',
          ${JSON.stringify(propsWithoutChildren)},
          {default:'${defaultSlot}'}
        );
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

interface IslandVNode<
  T extends LazyHydrationAttributes = LazyHydrationAttributes,
> extends VNode<T> {
  wrapped?: true
  __source?: { islandPath?: string }
}

let busy = false
let counter = 0

async function prepareLazyHydrationHook(vnode: IslandVNode) {
  if (
    vnode.props.clientLoad &&
    !busy &&
    !vnode.wrapped &&
    typeof vnode.type !== 'string' &&
    // components that have clientLoad, but don't have an islandPath in __source
    !!vnode.__source &&
    vnode.__source.islandPath
  ) {
    // important because cloneElement calls options.vnode
    busy = true
    const clone = cloneElement(vnode, vnode.props) as IslandVNode
    busy = false
    clone.wrapped = true
    vnode.type = createLazyHydrationWrapper(vnode.__source!.islandPath)
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
