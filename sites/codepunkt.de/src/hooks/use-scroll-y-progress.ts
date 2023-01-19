import useScrollPosition from '@react-hook/window-scroll'
import { useWindowSize } from '@react-hook/window-size'
import { useEffect, useLayoutEffect, useState } from 'preact/hooks'
import useSsr from './use-ssr'

/**
 * Listens for scrolling and provides position and percentage that the page
 * has been scrolled down.
 *
 * @param fps How many frames per second of scrolling should be recognized
 * @returns An object containing the current scrollY value and the percentage
 * that the page has been has been scrolled down.
 */
const useScrollYProgress = (fps = 60) => {
  const scrollY = useScrollPosition(fps)
  const [windowWidth, windowHeight] = useWindowSize()
  const [scrollYProgress, setScrollYProgress] = useState<number>(0)

  const { isBrowser } = useSsr()
  const useIsomorphicLayoutEffect = isBrowser ? useLayoutEffect : useEffect

  useIsomorphicLayoutEffect(() => {
    const maxScrollY = document.body.clientHeight - window.innerHeight
    setScrollYProgress(scrollY / maxScrollY)
  }, [windowWidth, windowHeight, scrollY])

  return { scrollY, scrollYProgress }
}

export default useScrollYProgress
