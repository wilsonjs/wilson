import { useEffect, useState } from 'preact/hooks'

export default function Timer() {
  const [num, setNum] = useState(0)
  useEffect(() => {
    window.setInterval(() => {
      setNum((num) => num + 1)
    }, 100)
  }, [])
  return <div>{num}</div>
}
