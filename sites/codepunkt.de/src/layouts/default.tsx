import type { RenderableProps } from 'preact'

export default function DefaultLayout({ children }: RenderableProps<{}>) {
  return (
    <>
      <header>
        <a href="/">Home</a>
        <a href="/islands">Islands</a>
        <a href="/blog">Blog</a>
      </header>
      <main>{children}</main>
    </>
  )
}
