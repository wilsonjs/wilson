import { Element, Node, Parent, Properties, Text } from 'hast'
import { Heading } from '../../types'
import { Transformer } from 'unified'

function findHeadings(node: Node): Heading[] {
  const headingNodes: Heading[] = []
  findHeadingsRecursive(node, headingNodes)
  return headingNodes
}

const headingTagNames = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']

function findHeadingsRecursive(node: Node, headingNodes: Heading[]): void {
  if (node.type === 'element') {
    const { tagName, children, properties } = node as Element
    if (headingTagNames.includes(tagName) && children[0]) {
      headingNodes.push({
        level: parseInt(tagName[1], 10),
        text: (children[0] as Text).value,
        slug: (properties as Properties).id as string,
      })
    }
  }
  const parent = node as Parent
  if (parent.children) {
    for (const child of parent.children) {
      findHeadingsRecursive(child, headingNodes)
    }
  }
}

const toString: (heading: Heading) => string = (h) =>
  `<h${h.level}>${h.text}</h${h.level}>`

const validateHeadings: (headings: Heading[]) => string | void = (headings) => {
  const lowestLevel = Math.min(...headings.map((h) => h.level))
  let previous: Heading | null = null
  for (const i in headings) {
    const current = headings[i]
    if (!previous && current.level > lowestLevel) {
      return `Starts with wrong heading: Page includes <h${lowestLevel}>, but starts with ${toString(
        current
      )}!`
    }
    if (previous) {
      if (previous.level < current.level - 1) {
        return `Skipped heading level: Page has ${toString(
          previous
        )} followed by ${toString(current)}!`
      }
    }
    previous = current
  }
}

/**
 *
 */
const rehypeExtractToc: () => Transformer = () => {
  return (tree, file) => {
    const headings = findHeadings(tree)
    const message = validateHeadings(headings)
    if (message) throw new Error(message)
    ;(file.data as Record<string, unknown>).headings = headings
  }
}

export default rehypeExtractToc
