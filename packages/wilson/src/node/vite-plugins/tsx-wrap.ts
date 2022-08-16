import { createComponentName, isPage } from '@wilson/utils'
import { TransformResult } from 'rollup'
import { relative } from 'pathe'
import template from '@babel/template'
import type { Plugin } from 'vite'
import type { SiteConfig } from '@wilson/types'
import types from '@babel/types'
import parse from './util/parse'
import format from './util/format'
import { traverse } from './util/babel-import'

export default function tsxWrapPlugin(config: SiteConfig): Plugin {
  return {
    name: 'wilson:tsx-wrap',
    enforce: 'pre',

    async transform(
      code: string,
      absolutePath: string,
    ): Promise<TransformResult> {
      if (!isPage(absolutePath, config.pagesDir, ['.tsx'])) {
        return null
      }

      const pagePath = relative(config.pagesDir, absolutePath)
      const componentName = createComponentName(pagePath)
      const dynamicParameterMatches = [...pagePath.matchAll(/\[([^\]]+)\]/g)]
      const isDynamic = dynamicParameterMatches.length > 0

      const ast = parse(code)

      let fc: types.FunctionDeclaration | undefined = undefined

      // TODO check that OriginalPage has no binding in global scope
      // TODO if isDynamic, check that `getStaticPaths` is exported
      traverse(ast, {
        ExportDefaultDeclaration(path) {
          if (types.isFunctionDeclaration(path.node.declaration)) {
            fc = path.node.declaration
            fc.id = { type: 'Identifier', name: 'OriginalPage' }

            path.node.declaration = template.smart(
              `
                function ${componentName}Page({ params: withUndefined, ...rest }) {
                  const params = Object.keys(withUndefined).reduce(
                    (acc, key) => ({ ...acc, [key]: withUndefined[key] ?? '' }),
                    {}
                  );
                  ${
                    isDynamic
                      ? `
                        const staticPath = staticPaths.find(({ params: p }) => shallowEqual(p, params));
                        const props = { frontmatter, params, ...(staticPath.props ?? {}), ...rest };
                      `
                      : `const props = { frontmatter, params, ...rest };`
                  }
                  function Title() { useTitle(frontmatter.title); return null; };
                  return <Layout {...props}>
                    {frontmatter.title && <Title />}
                    <OriginalPage {...props} />
                  </Layout>;
                }
              `,
              { plugins: ['jsx'] },
            )() as types.FunctionDeclaration
          } else {
            throw new Error(
              `Default export must be FunctionDeclaration. Illegal ${path.node.declaration.type} found!`,
            )
          }
        },
      })

      if (fc) {
        ast.program.body.push(fc)
      }

      return format(ast)
    },
  }
}
