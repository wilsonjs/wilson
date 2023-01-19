import throttlefn from 'lodash/throttle'
import { useEffect, useState } from 'preact/hooks'
import type { TimestampedPosition } from './types'

/**
 * Listens for mouse movement and provides position and timestamp of the last
 * detected movement.
 *
 * @param fps How many frames per second of mouse movement should be recognized
 * @returns An object containing the x and y coordinates of the mouse position
 * and the timestamp of the last movement
 */
export default function useMousePosition(fps = 30): TimestampedPosition {
  const [position, setPosition] = useState<TimestampedPosition>({
    x: 0,
    y: 0,
    timestamp: Date.now(),
  })

  const handleMouseMove = (event: MouseEvent) => {
    setPosition({ x: event.clientX, y: event.clientY, timestamp: Date.now() })
  }

  useEffect(() => {
    const handleMouseMoveThrottled = throttlefn(handleMouseMove, 1000 / fps)
    document.addEventListener('mousemove', handleMouseMoveThrottled)

    return () => {
      document.removeEventListener('mousemove', handleMouseMoveThrottled)
    }
  }, [handleMouseMove, fps])

  return { ...position }
}
