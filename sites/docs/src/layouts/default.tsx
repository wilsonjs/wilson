import type { RenderableProps } from 'preact'
import { Link } from 'wouter-preact'

export default function DefaultLayout({ children }: RenderableProps<{}>) {
  return (
    <>
      <header>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/islands">Islands</Link>
        </nav>
      </header>
      <main>{children}</main>
    </>
  )
}
