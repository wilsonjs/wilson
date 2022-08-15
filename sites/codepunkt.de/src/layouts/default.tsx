import type { RenderableProps } from 'preact'
import { Link } from 'wouter-preact'

export default function DefaultLayout({ children }: RenderableProps<{}>) {
  return (
    <>
      <header>
        <Link href="/">Home</Link>
        <Link href="/islands">Islands</Link>
        <Link href="/blog">Blog</Link>
      </header>
      <main>{children}</main>
    </>
  )
}
