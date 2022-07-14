import { promises as fs } from "fs";
import glob from "fast-glob";
import deepEqual from "deep-equal";
import { dirname, extname, relative, resolve } from "pathe";
import type { RawPageMatter, Route, Options, Page } from "./types";
import pc from "picocolors";
import { parsePageMatter } from "./frontmatter";
import { debug, slash } from "./utils";
import { DATA_MODULE_ID, ROUTES_MODULE_ID } from "./types";

export function createApi({
  extendRoutes,
  pageExtensions,
  pagesDir,
  root,
  server,
  srcDir,
}: Options) {
  let addedAllPages: Promise<void>;
  let pageByPath = new Map<string, Page>();

  const extensionsRE = new RegExp(`(${pageExtensions.join("|")})$`);

  return {
    get pages() {
      return pageByPath;
    },
    isPage(file: string) {
      file = slash(file);
      return file.startsWith(pagesDir) && extensionsRE.test(file);
    },
    pageForFilename(file: string) {
      return pageByPath.get(resolve(root, file));
    },
    async forceAddAllPages() {
      const absolutePaths = await glob(
        `${pagesDir}/**/*{${pageExtensions.join(",")}}`,
        { onlyFiles: true }
      );
      await Promise.all(
        absolutePaths.map(
          async (absolutePath) => await this.addPage(slash(absolutePath))
        )
      );
    },
    async addAllPages() {
      addedAllPages ||= this.forceAddAllPages();
      await addedAllPages;
    },
    errorOnDuplicateRoutes() {
      const allPages = Array.from(pageByPath).map(([_, p]) => p);
      const duplicateRoutePages = allPages.filter((p1) =>
        allPages.some((p2) => p1.path !== p2.path && p1.route === p2.route)
      );
      if (duplicateRoutePages.length > 0) {
        throw new Error(
          `Multiple pages with route "${
            duplicateRoutePages[0].route
          }" detected: [${duplicateRoutePages.map((r) => r.path).join(", ")}]"`
        );
      }
    },
    errorOnDisallowedCharacters(path: string) {
      if (path.match(/^[0-9a-z._\-\/\[\]]+$/i) === null) {
        throw new Error(
          `Page "${path}" has forbidden characters. Pages can only have 0-9a-zA-Z._-/[]\n`
        );
      }
    },
    async addPage(absolutePath: string) {
      const path = relative(pagesDir, absolutePath);
      this.errorOnDisallowedCharacters(path);
      const { route, isDynamic } = this.extractRouteInfo(path);
      const frontmatter = await this.frontmatterForFile(absolutePath);
      const rootPath = relative(root, absolutePath);
      const srcPath = relative(srcDir, absolutePath);
      const fileExtension = extname(absolutePath);
      const componentName = this.createComponentName(path);
      const page: Page = {
        path,
        fileExtension,
        route,
        isDynamic,
        frontmatter,
        absolutePath,
        rootPath,
        srcPath,
        componentName,
      };
      pageByPath.set(absolutePath, page);
      this.errorOnDuplicateRoutes();
      return page;
    },
    removePage(absolutePath: string) {
      pageByPath.delete(absolutePath);
    },
    async updatePage(pagePath: string) {
      const prevMatter = this.pageForFilename(pagePath)?.frontmatter;
      const { frontmatter } = await this.addPage(pagePath);
      debug.hmr("%s old: %O", pagePath, prevMatter);
      debug.hmr("%s new: %O", pagePath, frontmatter);
      return {
        changed: !deepEqual(prevMatter, frontmatter),
        needsReload: !deepEqual(prevMatter?.route, frontmatter?.route),
      };
    },
    createComponentName(path: string) {
      const withoutExtension = path.slice(0, path.lastIndexOf("."));
      const pascalCased = withoutExtension
        .split("/")
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join("");
      const variablesReplaced = pascalCased.replace(/\[([^\]]+)\]/g, "$$$1");
      const onlyAllowedChars = variablesReplaced.replace(/[^a-z0-9$_]/gi, "");
      return onlyAllowedChars.replace(
        /\$(.{1})/g,
        (s: string) => s.charAt(0) + s.charAt(1).toUpperCase()
      );
    },
    isDynamicPath(segment: string) {
      return /\[[^\]]+\]/.test(segment);
    },
    extractRouteInfo(relativePath: string) {
      const isDynamic = this.isDynamicPath(relativePath);
      const reactRouterLike = relativePath
        .split("/")
        .filter((x) => x)
        .map((segment) =>
          this.isDynamicPath(segment)
            ? segment.replace(/\[([^\]]+)\]/g, ":$1")
            : segment.toLowerCase()
        )
        .join("/");
      let route =
        reactRouterLike
          .slice(0, reactRouterLike.lastIndexOf("."))
          .replace(/index$/, "")
          .replace(/^\/|\/$/g, "") ?? "/";
      if (route === "") route = "/";
      return { route, isDynamic };
    },
    async getExtendedRoutes(id: string): Promise<Route[]> {
      const routes: Route[] = Array.from(pageByPath.values()).map(
        ({ componentName, route: path, rootPath }) => {
          return {
            path,
            componentName,
            importPath: "./" + rootPath,
          };
        }
      );
      return (await extendRoutes?.(routes)) || routes;
    },
    async generateDataModule(id: string): Promise<string> {
      const routes = await this.getExtendedRoutes(id);
      const code = `export default ${JSON.stringify(routes, null, 2)}`;
      debug.virtual(
        `generated code for ${pc.green(DATA_MODULE_ID)}:\n${code
          .split("\n")
          .map((line) => pc.gray(`  ${line}`))
          .join("\n")}`
      );
      return code;
    },
    async generateRoutesModule(id: string): Promise<string> {
      const routes = await this.getExtendedRoutes(id);
      // TODO sort byDynamicParams
      const code = `${routes
        .map(
          (route) =>
            `import ${route.componentName} from '${route.importPath}';${route.componentName}.displayName = '${route.componentName}';`
        )
        .join("\n")}\nexport default [\n${routes
        .map(
          (route) =>
            `  { path: "${route.path}", element: <${route.componentName} /> }`
        )
        .join(",\n")}\n];`;
      debug.virtual(
        `generated code for ${pc.green(ROUTES_MODULE_ID)}:\n${code
          .split("\n")
          .map((line) => pc.gray(`  ${line}`))
          .join("\n")}`
      );
      return code;
    },

    ///
    async frontmatterForPageOrFile(
      file: string,
      content?: string
    ): Promise<RawPageMatter> {
      file = resolve(root, file);
      return this.isPage(file)
        ? (this.pageForFilename(file) || (await this.addPage(file))).frontmatter
        : await this.frontmatterForFile(file, content);
    },
    async frontmatterForFile(
      file: string,
      content?: string
    ): Promise<RawPageMatter> {
      try {
        file = resolve(root, file);
        if (content === undefined) content = await fs.readFile(file, "utf8");
        file = relative(root, file);
        const matter = await parsePageMatter(file, content!);
        return matter;
        // return (await options.extendFrontmatter?.(matter, file)) || matter;
      } catch (error: any) {
        if (!server) throw error;
        server.config.logger.error(error.message, {
          timestamp: true,
          error,
        });
        server.ws.send({ type: "error", err: error });
        return { frontmatter: {}, meta: {} as any, route: {}, layout: false };
      }
    },
  };
}

export function countSlash(value: string) {
  return (value.match(/\//g) || []).length;
}

// Internal: Ensures that paths with less dynamic params are added before.
function byDynamicParams({ route: a }: Page, { route: b }: Page) {
  const diff = countSlash(a) - countSlash(b);
  if (diff) return diff;
  const aDynamic = a.includes(":");
  const bDynamic = b.includes(":");
  return aDynamic === bDynamic ? a.localeCompare(b) : aDynamic ? 1 : -1;
}
