import { useState } from 'preact/hooks'

export default function Decrease(props: { initialValue: number }) {
  const [i, set] = useState(props.initialValue)
  return <button onClick={() => set((i) => i - 1)}>{i}</button>
}
