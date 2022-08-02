import type { RenderableProps } from 'preact'
import { useState } from 'preact/hooks'
import styles from './Counter.module.scss'

export default function Counter({
  children,
  startValue,
}: RenderableProps<{ startValue?: number }>) {
  const [count, setCount] = useState(startValue ?? 0)
  const add = (a: number) => () => setCount((i) => i + a)
  const subtract = (a: number) => () => setCount((i) => i - a)

  return (
    <div class={styles.wrapper}>
      <div class={styles.grid}>
        <button onClick={subtract(1)}>-1</button>
        <pre>{count}</pre>
        <button onClick={add(1)}>+1</button>
      </div>
      <div class={styles.children}>{children}</div>
      <div class={styles.grid}>
        <button onClick={subtract(10)}>-10</button>
        <pre>{count}</pre>
        <button onClick={add(10)}>+10</button>
      </div>
    </div>
  )
}
