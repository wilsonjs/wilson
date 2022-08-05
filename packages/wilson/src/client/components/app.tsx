import { RenderableProps } from 'preact'
import Router from 'preact-router'
import Meta from './meta'
import routes from 'virtual:wilson-routes'

export default function App({
  urlToBeRendered,
}: RenderableProps<{
  urlToBeRendered?: string
}>) {
  return (
    <>
      <Meta />
      <Router url={urlToBeRendered}>{routes}</Router>
    </>
  )
}
