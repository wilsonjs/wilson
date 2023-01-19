import type { LinkProps } from 'wouter-preact'
import { Link as WouterLink, useLocation, useRoute } from 'wouter-preact'

export default function Link(
  props: Omit<LinkProps, 'href'> &
    Required<Pick<LinkProps, 'href'>> & {
      exact?: boolean
      usedInIsland?: boolean
    },
) {
  const [active] = useRoute(props.href)
  const [path] = useLocation()

  const exact = props.exact ?? false
  const isActive = exact ? active : path.startsWith(props.href)

  const useNormalLink =
    process.env.NODE_ENV === 'production' && props.usedInIsland === true

  if (useNormalLink) {
    return isActive ? (
      <a data-active href={props.href} class={props.class}>
        {props.children}
      </a>
    ) : (
      <a href={props.href} class={props.class}>
        {props.children}
      </a>
    )
  }

  return (
    <WouterLink {...(props as LinkProps)}>
      {isActive ? (
        <a data-active class={props.class}>
          {props.children}
        </a>
      ) : (
        <a class={props.class}>{props.children}</a>
      )}
    </WouterLink>
  )
}
