import { useEffect, useState } from 'preact/hooks'
import { useWindowSize } from '@react-hook/window-size'
import useDeviceOrientation from './use-device-orientation'
import useElementCenter from './use-element-center'
import useMousePosition from './use-mouse-position'
import type { TimestampedPosition } from './types'

const clamp = (num: number, [min, max]: [min: number, max: number]) =>
  Math.min(Math.max(num, min), max)

const DIZZY_CALCULATION_INTERVAL = 2500
const DIZZY_CALCULATION_THRESHOLD = 15
const POINTER_PRECEDENCE_THRESHOLD = 2000

const useOffset = () => {
  const [offsets, setOffsets] = useState<TimestampedPosition[]>([])
  const [isDizzy, setIsDizzy] = useState(false)
  const [windowWidth, windowHeight] = useWindowSize({ wait: 100 })
  const initialValue = { x: windowWidth / 2, y: windowHeight / 2 }
  const {
    elementRef: centerRef,
    x: cx,
    y: cy,
  } = useElementCenter<SVGCircleElement>(initialValue)
  const { x: mx, y: my, timestamp: mouseTimestamp } = useMousePosition()
  const { inferred } = useDeviceOrientation()
  const { beta, gamma } = inferred

  // calculate new offset and push it to offset history whenver one of the
  // dependencies change
  useEffect(() => {
    const timestamp = Date.now()
    const mousePositionInThresholdExists =
      mouseTimestamp &&
      timestamp - mouseTimestamp < POINTER_PRECEDENCE_THRESHOLD

    let offset: TimestampedPosition | null
    // if we have a mouse position in the last POINTER_PRECEDENCE_THRESHOLD
    // miliseconds, use it!
    if (mousePositionInThresholdExists) {
      // only calculate offset if mouse position values is not null (mouse moved
      // out of window)
      offset =
        mx !== null && my !== null
          ? {
              timestamp,
              x: clamp(
                mx < cx ? -1 + mx / cx : (mx - cx) / (windowWidth - cx),
                [-1, 1],
              ),
              y: clamp(
                my < cy ? -1 + my / cy : (my - cy) / (windowHeight - cy),
                [-1, 1],
              ),
            }
          : null
    }
    // otherwise, use orientation
    // TODO: only if orientation timestamps are fresh. otherwise, fall back
    // to latest mx and my regardless of age
    else {
      offset = {
        timestamp,
        x: -1 * clamp(gamma / 22.5, [-1, 1]),
        y: -1 * clamp(beta / 22.5, [-1, 1]),
      }
    }

    setOffsets((offsets) => [
      ...(offset === null ? [] : [offset]),
      ...offsets.filter(
        (o) => timestamp - DIZZY_CALCULATION_INTERVAL < o.timestamp,
      ),
    ])
  }, [cx, cy, mx, my, mouseTimestamp, beta, gamma, windowWidth, windowHeight])

  // re-calculate isDizzy whenever offset history changes
  useEffect(() => {
    const offsetDistance = offsets.reduce((count, h, i, all) => {
      return i === 0
        ? count
        : count + Math.abs(h.x - all[i - 1].x) + Math.abs(h.y - all[i - 1].y)
    }, 0)

    setIsDizzy(offsetDistance > DIZZY_CALCULATION_THRESHOLD)
  }, [offsets])

  useEffect(() => {
    if (isDizzy) {
      setTimeout(() => {
        setIsDizzy(false)
      }, 4500)
    }
  }, [isDizzy])

  return { centerRef, isDizzy, ...(offsets[0] ?? { x: 0, y: 0 }) }
}

export default useOffset
