import type { ComponentChildren } from 'preact'

export default function DefaultLayout({
  children,
}: {
  children: ComponentChildren
}) {
  return (
    <>
      <header>
        <a href="/">Home</a>
        <a href="/blog">Blog</a>
      </header>
      <main>{children}</main>
    </>
  )
}
