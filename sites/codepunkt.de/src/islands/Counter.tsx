import type { RenderableProps } from 'preact'
import { useState } from 'preact/hooks'
import styles from './Counter.module.scss'

export default function Counter({
  children,
  startValue,
}: RenderableProps<{ startValue?: number }>) {
  const [count, setCount] = useState(startValue ?? 0)
  const add = () => setCount((i) => i + 1)
  const subtract = () => setCount((i) => i - 1)

  return (
    <>
      <div class={styles.counter}>
        <button onClick={subtract}>-</button>
        <pre>{count}</pre>
        <button onClick={add}>+</button>
      </div>
      <div class={styles.counterMessage}>{children}</div>
    </>
  )
}
