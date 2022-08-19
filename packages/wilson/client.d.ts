import 'preact'
import type { LazyHydrationAttributes } from './types/hydration'

declare module 'preact' {
  namespace JSX {
    interface IntrinsicAttributes extends LazyHydrationAttributes {}
    interface IntrinsicElements {
      'wilson-island': preact.JSX.HTMLAttributes<HTMLElement>
      'wilson-slot': preact.JSX.HTMLAttributes<HTMLElement>
    }
  }
}

declare module '*.svg?component' {
  import { FunctionComponent, JSX } from 'preact'
  const src: FunctionComponent<JSX.SVGAttributes>
  export default src
}
