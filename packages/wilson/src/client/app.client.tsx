import { render } from 'preact'
import Router from './components/router'
import 'preact/debug'

render(<Router />, document.getElementById('site') as HTMLElement)
