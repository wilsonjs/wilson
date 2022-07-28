import routes from 'virtual:wilson-routes'
import { Router } from 'preact-router'
import render from 'preact-render-to-string'
import { cloneElement, options } from 'preact'
import type { RenderableProps, VNode } from 'preact'
import type { LazyHydrationAttributes } from '../../types/hydration'
import { readFileSync } from 'fs'
import * as parser from '@babel/parser'
import babelTraverse from '@babel/traverse'
import type { ImportDefaultSpecifier } from '@babel/types'
import { dirname, resolve } from 'pathe'

// TODO: in prepareLazyHydrationHook, first AST-parse, then replace vnode.type
// if a default import of an island has been found!
// TODO: cache AST-parse results for same VNodeSource
const traverse = (babelTraverse as any).default as typeof babelTraverse

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

interface VNodeSource {
  fileName: string
  lineNumber: number
  columnNumber: number
}

function createLazyHydrationWrapper(source: VNodeSource) {
  let componentPath: string | undefined = undefined
  const code = readFileSync(source.fileName, 'utf-8')
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  })
  traverse(ast, {
    JSXIdentifier(path) {
      const lineMatches = path.node.loc?.start.line === source.lineNumber
      const columnMatches = path.node.loc?.start.column === source.columnNumber
      if (lineMatches && columnMatches) {
        const jsxIdentifier = path.node.name
        traverse(ast, {
          ImportDeclaration(path) {
            if (path.node.importKind === 'value') {
              const defaultImport = path.node.specifiers.find(
                ({ type }) => type === 'ImportDefaultSpecifier',
              ) as ImportDefaultSpecifier | undefined
              if (defaultImport && defaultImport.local.name === jsxIdentifier) {
                componentPath =
                  resolve(dirname(source.fileName), path.node.source.value) +
                  '.tsx'
              }
            }
          },
        })
      }
    },
  })

  /**
   * Prepends a `text/hydration` script tag.
   */
  return function LazyHydrationWrapper({
    children,
    ...props
  }: RenderableProps<{}>) {
    // didn't find path where the island was imported from as a default import
    if (componentPath === undefined) {
      return null
    }

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
  __source?: VNodeSource
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
    vnode.type = createLazyHydrationWrapper(vnode.__source!)
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
