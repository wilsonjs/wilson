import routes from 'virtual:wilson-routes'
import { Router } from 'preact-router'
import render from 'preact-render-to-string'
import { Attributes, cloneElement, ComponentChild, options } from 'preact'
import type { RenderableProps, VNode, JSX } from 'preact'
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

/**
 * Representation of an interactive island
 */
export interface Island {
  /**
   * Unique id
   */
  id: string
  /**
   * Script that is executed to hydrate the island
   */
  hydrationScript: string
  /**
   * Path to the island component
   */
  componentPath: string
  /**
   * The resulting island filename
   */
  entryFilename?: string
}

/**
 * Maps page paths to an array of island definitions.
 */
export type IslandsByPath = Record<string, Island[]>

/**
 * Stores all islands encountered in the current page's rendering
 */
let islands: Island[] = []

/**
 * Empties the island list.
 */
function clearIslands() {
  islands = []
}

function getHydrationScript(
  hydrationType: keyof typeof hydrationFns,
  islandId: number,
  islandPath: string,
  islandProps: Record<string, unknown>,
): string {
  const hydrationFn = hydrationFns[hydrationType]
  let importStatements = ''
  let componentImportVariable = ''

  switch (hydrationType) {
    case 'clientLoad':
      componentImportVariable = 'component'
      importStatements = /* js */ `
        import { ${hydrationFn} } from '@wilson/hydration';
        import { default as ${componentImportVariable} } from '${islandPath}';
        `
      break
    case 'clientMedia':
    case 'clientVisible':
      componentImportVariable = 'componentFn'
      importStatements = /* js */ `
        import { ${hydrationFn} } from '@wilson/hydration';
        const ${componentImportVariable} = async () => (await import('${islandPath}')).default;
        `
      break
  }

  return /* js */ `
    ${importStatements}
    ${hydrationFn}(
      ${componentImportVariable},
      'island-${islandId}',
      ${JSON.stringify(islandProps)}
    );
  `
}

/**
 * Wraps island in a `<wilson-island>` element, wraps the island children
 * in a `<wilson-slot>` element and appends a `text/hydration` script tag
 * with a placeholder for hydration code to the `<wilson-island>`.
 *
 * Constructs an `Island` object that is used to replace the
 * placeholder script with the real code performing the partial hydration when
 * the resulting pages are written to disk.
 *
 * When interactive islands are nested in one another, the LazyHydrationWrapper
 * component is rendered not only when it's own VNode is encountered, but also
 * when a parent island is rendering itself and it's island children to wrap
 * them into `<wilson-slot>`.
 *
 * This leads to additional island being created,
 * completely messing up the resulting hydration. To prevent it, we cache the
 * rendered JSX.Element on the VNode and reuse it when available.
 */
function createLazyHydrationWrapper(vnode: IslandVNode, hydrationType: string) {
  return function LazyHydrationWrapper({
    children: [islandVnode],
    ...propsWithoutChildren
  }: Readonly<Attributes & { children: ComponentChild[] }>) {
    if (vnode.renderCache) return vnode.renderCache

    const renderedIsland = render(<>{islandVnode}</>)
    const renderedChildren = render(
      <>{(islandVnode as VNode).props.children}</>,
    )

    let result = renderedIsland
    if (renderedChildren !== '') {
      result = result.replace(
        renderedChildren,
        `<wilson-slot>${renderedChildren}</wilson-slot>`,
      )
    }

    const no = islands.length + 1
    const islandPath = vnode.__source?.islandPath!
    const island = {
      componentPath: islandPath,
      id: `island-${no}`,
      hydrationScript: getHydrationScript(
        hydrationType as keyof typeof hydrationFns,
        no,
        islandPath,
        propsWithoutChildren as Record<string, any>,
      ),
    }
    islands.push(island)

    const element = (
      <>
        <wilson-island
          id={island.id}
          dangerouslySetInnerHTML={{
            __html: result,
          }}
        />
        <script type="text/hydration">/*{island.id}-hydration*/</script>
      </>
    )

    vnode.renderCache = element
    return element
  }
}

interface IslandVNode<
  T extends LazyHydrationAttributes = LazyHydrationAttributes,
> extends VNode<T> {
  wrapped?: true
  renderCache?: JSX.Element
  __source?: { islandPath?: string }
}

let busy = false

export const hydrationFns = {
  clientLoad: 'hydrateNow',
  clientMedia: 'hydrateOnMediaQuery',
  clientVisible: 'hydrateWhenVisible',
}

function getHydrationType(vnode: VNode): string | undefined {
  return Object.keys(vnode.props).find((key) =>
    Object.keys(hydrationFns).includes(key),
  )
}

async function prepareLazyHydrationHook(vnode: IslandVNode) {
  if (
    // exclude components that have a lazy hydration prop, but don't have
    // an islandPath in __source
    !!vnode.__source &&
    vnode.__source.islandPath &&
    // don't hook into a vnode when busy (vnode just cloned)
    !busy &&
    // don't hook into a vnode that was already wrapped
    !vnode.wrapped &&
    typeof vnode.type !== 'string'
  ) {
    const hydrationType = getHydrationType(vnode)
    if (hydrationType) {
      // the "busy-dance" is performed because cloneElement calls options.vnode
      // and we'd run into an endless clone/hook/clone/hook loop otherwise
      busy = true
      const clone = cloneElement(vnode, vnode.props) as IslandVNode
      busy = false
      clone.wrapped = true
      vnode.type = createLazyHydrationWrapper(
        vnode,
        hydrationType,
      ) as IslandVNode['type']
      vnode.props.children = [clone]
    }
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
  islands: Island[]
}

export type RenderToStringFn = (
  renderedUrl: string,
) => Promise<ServerRenderResult>

export default async function renderToString(
  urlToBeRendered: string,
): Promise<ServerRenderResult> {
  clearIslands()
  const html = render(<App urlToBeRendered={urlToBeRendered} />)
  return { html, islands }
}
