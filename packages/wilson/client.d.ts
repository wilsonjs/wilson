import 'preact'
import type { LazyHydrationAttributes } from './types/hydration'

declare module 'preact' {
  export namespace JSX {
    export interface IntrinsicAttributes extends LazyHydrationAttributes {}
  }
}
