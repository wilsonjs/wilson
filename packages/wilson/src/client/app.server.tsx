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

/**
 * Prepends a `text/hydration` script tag.
 */
function LazyHydrationWrapper({ children, ...props }: RenderableProps<{}>) {
  return (
    <>
      {children}
      <script
        type="text/hydration"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({ props }),
        }}
      />
    </>
  )
}

interface PotentiallyLazyHydratedVNode<
  T extends LazyHydrationAttributes = LazyHydrationAttributes,
> extends VNode<T> {
  wrapped?: true
}

const existingVnodeHook = options.vnode
let busy = false
options.vnode = (vnode: PotentiallyLazyHydratedVNode) => {
  if (vnode.props.clientLoad && !busy && !vnode.wrapped) {
    // important because cloneElement calls options.vnode
    busy = true
    const clone = cloneElement(
      vnode,
      vnode.props,
    ) as PotentiallyLazyHydratedVNode
    busy = false
    clone.wrapped = true
    vnode.type = LazyHydrationWrapper
    vnode.props.children = [clone]
  }

  if (existingVnodeHook) existingVnodeHook(vnode)
}

export interface ServerRenderResult {
  /**
   * Page component rendered to a string.
   */
  html: string
}

export type RenderToStringFn = (
  renderedUrl: string,
) => Promise<ServerRenderResult>

export default async function renderToString(
  urlToBeRendered: string,
): Promise<ServerRenderResult> {
  const html = render(<App urlToBeRendered={urlToBeRendered} />)
  return { html }
}
