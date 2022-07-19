import type { RenderedPath } from 'wilson'

export function getRenderedPaths(): RenderedPath<'wat'>[] {
  return [{ params: { wat: 'oink' } }]
}

export default function Page() {
  return <h1>page-[wat]</h1>
}
