import type { RefObject } from 'preact'

/** An interface for a x/y position on the screen */
export interface Position {
  /** X position */
  x: number
  /** Y position */
  y: number
}

/** An interface for a x/y position on the screen with a timestamp */
export interface TimestampedPosition extends Position {
  /** Position timestamp */
  timestamp: number
}

/** An interface for a x/y position on the screen and an element reference */
export interface PositionAndElementRef<E extends Element> extends Position {
  /** Element reference */
  elementRef: RefObject<E>
}
