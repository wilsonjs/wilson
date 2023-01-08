import { useEffect, useState } from 'preact/hooks'
import styles from './Clock.module.scss'

export default function Clock() {
  const [date, setDate] = useState(new Date())
  useEffect(() => {
    window.setInterval(() => {
      setDate(new Date())
    }, 100)
  }, [])
  const decimals = Math.round(date.getMilliseconds() / 100)
  return (
    <div className={styles.clock}>
      {typeof document === 'undefined'
        ? ''
        : `${date.toLocaleTimeString()}.${decimals === 10 ? '0' : decimals}`}
    </div>
  )
}
