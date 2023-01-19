import { useEffect, useRef, useState } from 'preact/hooks'
import useWindowScroll from '@react-hook/window-scroll'
import { useWindowSize } from '@react-hook/window-size'
import type { Position, PositionAndElementRef } from './types'

/**
 * Returns the center position of an element.
 *
 * @param initialValue Initial value for the center position
 * @returns An object containing the x and y coordinates of the center
 * position and a mutable ref object for the element to be observed.
 */
export default function useElementCenter<E extends Element>(
  initialValue: Position,
): PositionAndElementRef<E> {
  const elementRef = useRef<E>(null)
  const [center, setCenter] = useState<Position>(initialValue)
  const scrollY = useWindowScroll()
  const [windowWidth, windowHeight] = useWindowSize({ wait: 100 })

  useEffect(() => {
    if (elementRef.current) {
      const bcr = elementRef.current.getBoundingClientRect()
      setCenter({
        x: bcr.x + bcr.width / 2,
        y: bcr.y + bcr.height / 2,
      })
    }
  }, [elementRef, scrollY, windowWidth, windowHeight])

  return { elementRef, ...center }
}
