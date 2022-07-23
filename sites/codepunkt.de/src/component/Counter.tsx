import { useState } from 'preact/hooks'

export default function Counter() {
  const [i, set] = useState(0)
  return <button onClick={() => set((i) => i + 1)}>{i}</button>
}
