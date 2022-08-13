import { render } from 'preact'
import 'preact/debug'
import Router from './components/router'

export default Router

if (!import.meta.env.SSR)
  render(<Router />, document.getElementById('site') as HTMLElement)
