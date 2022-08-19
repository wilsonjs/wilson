import { FunctionalComponent } from 'preact'
import { memo } from 'preact/compat'
import { useContext } from 'preact/hooks'
// import { motion } from 'framer-motion'
import { ColorModeContext } from './color-mode-provider'
import styles from './mode-toggle.module.scss'

const lightPath =
  'M 12 7 C 13.4 7 14.65 7.55 15.55 8.45 C 16.45 9.35 17 10.6 17 12 C 17 12.7 16.863 13.363 16.613 13.963 C 16.363 14.563 16 15.1 15.55 15.55 C 15.1 16 14.563 16.363 13.963 16.613 C 13.363 16.863 12.7 17 12 17 C 10.6 17 9.35 16.45 8.45 15.55 C 7.55 14.65 7 13.4 7 12 C 7 10.6 7.55 9.35 8.45 8.45 C 9.35 7.55 10.6 7 12 7 C 12 7 12 7 12 7 M 12 1 L 12 3 M 12 21 L 12 23 M 4.2 4.2 L 5.6 5.6 M 18.4 18.4 L 19.8 19.8 M 1 12 L 3 12 M 21 12 L 23 12 M 5.6 18.4 L 4.2 19.8 M 19.8 4.2 L 18.4 5.6'
const darkPath =
  'M 9.859 7.681 C 9.983 9.353 10.704 10.925 11.889 12.111 C 13.075 13.296 14.647 14.017 16.319 14.141 C 17.99 14.266 19.652 13.786 21 12.79 C 21 12.79 21 12.79 21 12.79 C 20.789 15.071 19.715 17.187 17.999 18.704 C 16.283 20.222 14.051 21.028 11.762 20.958 C 9.472 20.887 7.294 19.945 5.674 18.326 C 4.055 16.706 3.113 14.528 3.042 12.238 C 2.972 9.949 3.778 7.717 5.296 6.001 C 6.813 4.285 8.929 3.211 11.21 3 C 10.214 4.348 9.734 6.01 9.859 7.681 M 12 1 L 12 1 M 12 21 L 12 21 M 4.2 4.2 L 4.2 4.2 M 18.4 18.4 L 18.4 18.4 M 1 12 L 1 12 M 21 12 L 21 12 M 5.6 18.4 L 5.6 18.4 M 19.8 4.2 L 19.8 4.2'

const ModeToggle: FunctionalComponent = memo(() => {
  const state = useContext(ColorModeContext)

  // If, for whatever reason, no colorMode is set, omit this component
  if (state == null) {
    return null
  }

  const { colorMode, setColorMode } = state

  return (
    <button
      class={styles.button}
      aria-label="Dark mode"
      aria-pressed={colorMode === 'dark'}
      onClick={() => setColorMode(colorMode === 'dark' ? 'light' : 'dark')}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        {/* <motion.path
          class={css`
            stroke-width: 1.2;
            stroke: currentColor;
          `}
          fill="transparent"
          initial={{ d: lightPath }}
          animate={{ d: colorMode === 'dark' ? lightPath : darkPath }}
        /> */}
        <path
          fill="transparent"
          d={colorMode === 'dark' ? lightPath : darkPath}
        />
      </svg>
    </button>
  )
})

export default ModeToggle
