import routes from 'virtual:wilson-routes'
import { Router } from 'preact-router'
import render from 'preact-render-to-string'
import { RenderableProps } from 'preact'

function App({
  renderedUrl,
}: RenderableProps<{
  renderedUrl: string
}>) {
  // @ts-ignore
  return <Router url={renderedUrl}>{routes}</Router>
}

export interface ServerRenderResult {
  /**
   * Page component rendered to a string.
   */
  html: string
}

export type RenderToStringFn = (renderedUrl: string) => Promise<ServerRenderResult>

export default async function renderToString(renderedUrl: string): Promise<ServerRenderResult> {
  const html = render(<App renderedUrl={renderedUrl} />)
  return { html }
}
