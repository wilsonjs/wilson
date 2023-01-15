import { useEffect, useRef } from 'preact/hooks'

export default function usePrevious<T>(value: T, initialPreviousValue: T): T {
  const ref = useRef<T>(initialPreviousValue)
  useEffect(() => {
    ref.current = value
  }, [value])
  return ref.current
}
