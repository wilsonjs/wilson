import type { PageFrontmatter } from './types'

export interface OpengraphImageText {
  text: (page: PageFrontmatter) => string
  font: string
  fontSize?: number
  color?: string
  x?: number
  y?: number
  maxWidth?: number
  maxHeight?: number
  horizontalAlign?: 'left' | 'center' | 'right'
  verticalAlign?: 'top' | 'center' | 'bottom'
}
