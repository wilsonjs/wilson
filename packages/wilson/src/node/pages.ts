import { SiteConfig } from "@wilson/config";
import { extname, relative } from "pathe";
import readdirp from "readdirp";

type Page = {
  /**
   * React-router route path
   */
  route: string;
  /**
   * Path of the page relative to the `pagesDir`
   */
  pagePath: string;
  /**
   * Path of the page relative to the `srcDir`
   */
  srcPath: string;
  /**
   * Path of the page relative to the site root
   */
  rootPath: string;
  /**
   * Absolute path of the page
   */
  absolutePath: string;
  /**
   * Is the page dynamic?
   */
  isDynamic: boolean;
  /**
   * The page's file extension
   */
  fileExtension: string;
};

/**
 * Initializes all pages by recursively reading the files in the pages
 * directory.
 */
export async function initializePages(siteConfig: SiteConfig): Promise<Page[]> {
  const pages: Page[] = [];

  for await (let { path: pagePath, fullPath: absolutePath } of readdirp(
    siteConfig.pagesDir
  )) {
    const fileExtension = extname(absolutePath);
    // unknown page file extension: ignore file
    if (
      !Object.values(siteConfig.pageExtensions).flat().includes(fileExtension)
    ) {
      continue;
    }

    const { route, isDynamic } = extractRouteInfo(pagePath);
    pages.push({
      route,
      pagePath,
      srcPath: relative(siteConfig.srcDir, absolutePath),
      rootPath: relative(siteConfig.root, absolutePath),
      absolutePath,
      isDynamic,
      fileExtension,
    });
    // replace \\ with / for paths on windows
    // fullPath = fullPath.replace(/\\/g, "/");

    // const relativePath = relative(join(process.cwd(), "src/pages"), fullPath);

    // if (extname(fullPath) === ".tsx") {
    // const printer: ts.Printer = ts.createPrinter()
    // const program = ts.createProgram([fullPath], {})
    // const sourceFile = program.getSourceFile(fullPath) as ts.SourceFile
    // const transformer =
    //   <T extends ts.Node>(context: ts.TransformationContext) =>
    //   (rootNode: T) => {
    //     function visit(node: ts.Node): ts.Node {
    //       if (
    //         !!node.parent &&
    //         ts.isStringLiteral(node) &&
    //         ts.isImportDeclaration(node.parent)
    //       ) {
    //         return context.factory.createStringLiteral('horst')
    //       }
    //       console.log(`Visiting ${ts.SyntaxKind[node.kind]}`)
    //       return ts.visitEachChild(node, visit, context)
    //     }
    //     return ts.visitNode(rootNode, visit)
    //   }
    // const result: ts.TransformationResult<ts.SourceFile> =
    //   ts.transform<ts.SourceFile>(sourceFile, [transformer])
    // const transformedSourceFile = result.transformed[0]
    // console.log(printer.printFile(transformedSourceFile))
    //
    //
    //
    //
    // const ts = transpileTypescriptToJavaScript(
    //   await readFile(fullPath, 'utf-8')
    // )
    // const tempFilePath = join(
    //   process.cwd(),
    //   '.wilson/pages',
    //   relativePath.replace(/\.tsx$/, '.js')
    // )
    // await outputFile(tempFilePath, ts)
    // const wat = await import(tempFilePath)
    // console.log(wat)
    // const ast = createJavaScriptAST(
    //   transpileTypescriptToJavaScript(
    //     await readFile(fullPath, 'utf-8'),
    //     typescript.ModuleKind.ES2022
    //   )
    // )
    // walk(ast, {
    //   enter(node) {
    //     // we're only interested in ExportNamedDeclaration
    //     if (node.type === 'ExportNamedDeclaration') {
    //       const namedDeclaration = node as ExportNamedDeclaration
    //       if (namedDeclaration.declaration?.type === 'VariableDeclaration') {
    //         const variableDeclaration =
    //           namedDeclaration.declaration as VariableDeclaration
    //         if (
    //           variableDeclaration.declarations.find(
    //             (declaration) =>
    //               (declaration.id as Identifier).name === 'getStaticPaths'
    //           )
    //         ) {
    //           console.log('yay!')
    //           const objSource = generate(node, { indent: '', lineEnd: '' })
    //           console.log(objSource)
    //         }
    //       } else if (42 === Math.random()) {
    //       }
    //     }
    //   },
    // })
    // }

    // if (allLanguageCodes.length > 0) {
    //   const startsWithLanguageCode = relativePath.match(
    //     new RegExp(`^(${allLanguageCodes.join("|")})/`)
    //   );
    //   if (!startsWithLanguageCode) {
    //     throw new Error(`found non-localized page: ${relativePath}`);
    //   }
    // }
  }

  return pages;
}

function isDynamicPath(segment: string) {
  return /\[[^\]]+\]/.test(segment);
}

function extractRouteInfo(relativePath: string) {
  const isDynamic = isDynamicPath(relativePath);
  const reactRouterLike = relativePath
    .split("/")
    .filter((x) => x)
    .map((segment) =>
      isDynamicPath(segment)
        ? segment.replace(/\[([^\]]+)\]/g, ":$1")
        : segment.toLowerCase()
    )
    .join("/");

  const route = reactRouterLike
    .slice(0, reactRouterLike.lastIndexOf("."))
    .replace(/\/index$/, "");

  return { route, isDynamic };
}
