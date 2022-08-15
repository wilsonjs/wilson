import { declare } from '@babel/helper-plugin-utils'
import { NodePath, types as t } from '@babel/core'
import type {
  JSXAttribute,
  JSXExpressionContainer,
  JSXIdentifier,
  JSXOpeningElement,
  JSXSpreadAttribute,
  ObjectExpression,
  Program,
} from '@babel/types'
import { dirname, resolve } from 'path'

interface Options {
  islandsDir: string
  layoutsDir: string
  pagesDir: string
}

const partialHydrationProps = [
  'clientIdle',
  'clientLoad',
  'clientMedia',
  'clientOnly',
  'clientVisible',
]

function isPartialHydrationAttribute(
  attribute: JSXAttribute | JSXSpreadAttribute,
): boolean {
  return (
    t.isJSXAttribute(attribute) &&
    t.isJSXIdentifier(attribute.name) &&
    partialHydrationProps.includes(attribute.name.name)
  )
}

function isSelfAttribute(
  attribute: JSXAttribute | JSXSpreadAttribute,
): boolean {
  return t.isJSXAttribute(attribute) && attribute.name.name === '__self'
}

function isSourceAttribute(
  attribute: JSXAttribute | JSXSpreadAttribute,
): boolean {
  return t.isJSXAttribute(attribute) && attribute.name.name === '__source'
}

function findIslandPath(
  fileName: string,
  jsxName: string,
  path: NodePath<Program>,
): string | undefined {
  let islandPath: string | undefined = undefined

  path.traverse({
    ImportDeclaration(path) {
      if (path.node.importKind === 'value') {
        const defaultImport = path.node.specifiers.find(
          ({ type }) => type === 'ImportDefaultSpecifier',
        )
        if (defaultImport && defaultImport.local.name === jsxName) {
          islandPath =
            resolve(dirname(fileName), path.node.source.value) + '.tsx'
        }
      }
    },
  })

  return islandPath
}

function removeDevelopmentAttributes(jsxElement: JSXOpeningElement): void {
  jsxElement.attributes = jsxElement.attributes.filter(
    (attribute) => !isSelfAttribute(attribute) && !isSourceAttribute(attribute),
  )
}

function addIslandPathAttribute(
  sourceAttribute: JSXAttribute,
  islandPath: string,
): void {
  const expression = (sourceAttribute.value as JSXExpressionContainer)
    .expression as ObjectExpression
  expression.properties.push(
    t.objectProperty(t.identifier('islandPath'), t.stringLiteral(islandPath)),
  )
}

export default declare((api, { islandsDir, layoutsDir, pagesDir }: Options) => {
  return {
    name: 'wat',
    visitor: {
      Program(programPath, state) {
        const fileName = state.file.opts.filename!
        const isPageOrLayout =
          fileName.startsWith(pagesDir) || fileName.startsWith(layoutsDir)

        programPath.traverse({
          JSXOpeningElement(path) {
            const hasPartialHydrationAttribute =
              path.node.attributes.find(isPartialHydrationAttribute) !==
              undefined

            // delete __self and __source attributes added by
            // @babel/plugin-transform-react-jsx-development for
            // JSXOpeningElements that are not on a wilson page or layout or
            // don't have partial hydration attributes.
            if (!isPageOrLayout || !hasPartialHydrationAttribute) {
              return removeDevelopmentAttributes(path.node)
            }

            const sourceAttribute = path.node.attributes.find(
              isSourceAttribute,
            ) as JSXAttribute | undefined

            // if there is no __source attribute, something went wrong
            // on the configuration and order of plugins between this plugin
            // and @babel/plugin-transform-react-jsx-development
            if (!sourceAttribute) {
              throw new Error(
                `__source not found on JSXOpeningElement with partial hydration attribute`,
              )
            }

            const jsxName = (path.node.name as JSXIdentifier).name
            const islandPath = findIslandPath(fileName, jsxName, programPath)

            // delete __self and __source attributes added by
            // @babel/plugin-transform-react-jsx-development for
            // JSXOpeningElements with partial hydration attributes on a
            // wilson page that are either not imported as a default
            // import into the page or are not imported from the wilson
            // islands folder
            if (!islandPath || !islandPath.startsWith(islandsDir)) {
              return removeDevelopmentAttributes(path.node)
            }

            addIslandPathAttribute(sourceAttribute, islandPath)
          },
        })
      },
    },
  }
})
