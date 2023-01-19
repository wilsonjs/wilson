interface ThemeSettings {
  default: string
  dark?: string
  parentSelector?: Record<string, string>
  media?: Array<{ match: string; theme: string }>
}

interface CodeData {
  language: string
  node: Node
}

/**
 * The syntax highlighting options reflect the options of `gatsby-remark-vscode`
 * @see https://github.com/andrewbranch/gatsby-remark-vscode#options-reference
 */
export interface SyntaxHighlightingOptions {
  theme?: string | ThemeSettings | ((data: CodeData) => string | ThemeSettings)
  wrapperClassName?: string | ((data: CodeData) => string)
  languageAliases?: Record<string, string>
  extensions?: string[]
  inlineCode?: {
    marker: string
    className?: string | ((data: CodeData) => string)
    theme?:
      | string
      | ThemeSettings
      | ((data: CodeData) => string | ThemeSettings)
  }
  injectStyles?: boolean
  replaceColor?: (colorValue: string, theme: string) => string
  logLevel?: 'trace' | 'debug' | 'info' | 'warn' | 'error'
}
