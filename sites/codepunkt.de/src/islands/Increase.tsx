import { RenderableProps } from 'preact'
import { useState } from 'preact/hooks'

export default function Increase(
  props: RenderableProps<{ initialValue: number }>,
) {
  const [i, set] = useState(props.initialValue)
  return (
    <button onClick={() => set((i) => i + 1)}>
      {i} <div>{props.children}</div>
    </button>
  )
}
