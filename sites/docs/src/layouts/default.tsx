import type { RenderableProps } from 'preact'

export default function DefaultLayout({ children }: RenderableProps<{}>) {
  return (
    <>
      <header>header</header>
      <main>{children}</main>
    </>
  )
}
