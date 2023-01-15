import { useEffect, useState } from 'preact/hooks'

export default function useIsSsr() {
  // initialized with true so initial browser matches ssr render
  const [isSsr, setIsSsr] = useState(true)
  useEffect(() => setIsSsr(false), [])
  return isSsr
}
