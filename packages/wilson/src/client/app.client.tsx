import { render } from 'preact'
import 'preact/debug'
import App from './components/app'

export default App

if (!import.meta.env.SSR)
  render(<App />, document.getElementById('site') as HTMLElement)
