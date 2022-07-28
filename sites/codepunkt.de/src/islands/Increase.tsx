import { useState } from 'preact/hooks'

export default function Increase(props: { initialValue: number }) {
  const [i, set] = useState(props.initialValue)
  return <button onClick={() => set((i) => i + 1)}>{i}</button>
}
