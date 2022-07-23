import 'preact'

/**
 * You can define which components should remain interactive in the
 * production build by using client: attributes in your components.
 */
interface HydrationAttributes {
  /**
   * Hydrates the component immediately as the page loads.
   */
  clientLoad?: true
  /**
   * Hydrate the component as soon as the main thread is free.
   */
  clientIdle?: true
  /**
   * Hydrates the component as soon as the element enters the viewport.
   */
  clientVisible?: true
  /**
   * Hydrates the component as soon as the browser matches the given media query.
   * Useful to avoid unnecessary work depending on the available viewport, such as in mobile devices.
   */
  clientMedia?: string
  /**
   * Does not prerender the component during build.
   */
  clientOnly?: true
}

declare module 'preact' {
  export namespace JSX {
    export interface IntrinsicAttributes extends HydrationAttributes {}
  }
}
