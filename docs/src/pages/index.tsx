import { ContentPageProps, Frontmatter } from 'wilson'
import { FunctionalComponent } from 'preact'
import classes from './index.module.scss'
import Logo from '../assets/wilson-wordmark.svg?component'
import InstallButton from '../components/install-button'

/**
 * landing page inspiration:
 * - product hunt https://readme.so/
 */
export const Page: FunctionalComponent<ContentPageProps> = () => {
  return (
    <>
      <div className={classes.hero}>
        <Logo className={classes.logo} />
        <h1 className={classes.claim}>{frontmatter.title}.</h1>
        <p className={classes.description}>
          Based on state of the art libraries and patterns, Wilson makes the
          hardest parts of building an amazing experience simple and stays out
          of your way for everything else.
        </p>
        <div className={classes.ctaWrapper}>
          <a href="/docs/" className={classes.cta}>
            Get started
          </a>
          <InstallButton />
        </div>
      </div>
      <div className={classes.features}>
        <ul>
          <li>
            <b>Instant Server Start</b> On demand file serving over native ESM,
            no bundling required!
          </li>
          <li>
            <b>Lightning Fast HMR</b>Hot Module Replacement (HMR) that stays
            fast regardless of app size.
          </li>
          <li>
            <b>Preact + SPA</b>
            JSX, Performance optimized, all SPA benefits, none of the cruft
          </li>
          <li>
            <b>Optimized Build</b>
            Pre-configured Rollup build with automated page-level lazy loading.
          </li>
          <li>
            <b>Markdown support</b>
            Automatic TOC creation, linking of headers
          </li>
          <li>
            <b>Syntax highlighting</b>
            Best in class syntax highlighting based on Visual Studio Code
          </li>
          <li>
            <b>Opengraph support</b>
            Amazing, feature complete open graph image generation. Automatically
            defines opengraph meta tags.
          </li>
          <li>
            <b>Fully Typed APIs</b>
            Flexible programmatic APIs with full TypeScript typing.
          </li>
          <li>
            <b>Taxonomies</b>
            Supports user-defined groupings of content called taxonomies
          </li>
        </ul>
      </div>
    </>
  )
}

export const frontmatter: Frontmatter = {
  title: 'Blazing fast static sites for the modern web',
}
