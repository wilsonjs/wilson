import 'preact'
import type { LazyHydrationAttributes } from './types/hydration'

declare module 'preact' {
  namespace JSX {
    interface IntrinsicAttributes extends LazyHydrationAttributes {}
    interface IntrinsicElements {
      'wilson-island': preact.JSX.HTMLAttributes<HTMLElement>
    }
  }
}
