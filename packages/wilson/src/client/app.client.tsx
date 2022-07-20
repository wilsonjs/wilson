import routes from 'virtual:wilson-routes'
import { render } from 'preact'
import { Router } from 'preact-router'
import 'preact/debug'

export default function App() {
  return <Router>{routes}</Router>
}

if (!import.meta.env.SSR) render(<App />, document.getElementById('root') as HTMLElement)
