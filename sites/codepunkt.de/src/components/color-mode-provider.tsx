import { createContext, FunctionalComponent } from 'preact'
import { useEffect, useMemo, useState } from 'preact/hooks'

type ColorMode = 'light' | 'dark' | undefined

export type State = {
  colorMode: ColorMode
  setColorMode: (newColorMode: NonNullable<ColorMode>) => void
} | null

export const ColorModeContext = createContext<State>(null)

/**
 * @TODO with js enabled, navigate in dark mode. toggle resets to light mode
 */
const ColorModeProvider: FunctionalComponent = ({ children }) => {
  const [colorMode, rawSetColorMode] = useState<ColorMode>(undefined)

  useEffect(() => {
    rawSetColorMode(
      document.documentElement.getAttribute('data-mode') as ColorMode
    )
  }, [])

  const contextValue: State = useMemo(() => {
    const setColorMode = (newValue: NonNullable<ColorMode>): void => {
      localStorage.setItem('color-mode', newValue)
      document.documentElement.setAttribute('data-mode', newValue)
      rawSetColorMode(newValue)
    }

    return {
      colorMode,
      setColorMode,
    }
  }, [colorMode, rawSetColorMode])

  return (
    <ColorModeContext.Provider value={contextValue}>
      {children}
    </ColorModeContext.Provider>
  )
}

export default ColorModeProvider
