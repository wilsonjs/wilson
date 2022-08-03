import type { RenderableProps } from 'preact'
import Clock from '../islands/Clock'

export default function DefaultLayout({ children }: RenderableProps<{}>) {
  return (
    <>
      <header>
        <a href="/">Home</a>
        <a href="/blog">Blog</a>
        <Clock clientVisible />
      </header>
      <main>{children}</main>
    </>
  )
}
