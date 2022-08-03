import type { RenderableProps } from 'preact'
import DefaultLayout from './default'

export default function IndexLayout({ children }: RenderableProps<{}>) {
  return (
    <>
      INDEEEEEX
      <DefaultLayout>{children}</DefaultLayout>
    </>
  )
}
