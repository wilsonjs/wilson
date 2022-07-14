import type { SiteConfig, UserConfig } from "./types";
import type { ConfigEnv, UserConfig as ViteOptions } from "vite";
import { loadConfigFromFile, mergeConfig as mergeViteConfig } from "vite";
import createDebugger from "debug";
import pc from "picocolors";
import { dirname, join, resolve } from "pathe";
import { fileURLToPath } from "url";

const debug = createDebugger("@wilson/config");

function defineConfig(config: UserConfig) {
  return config;
}

function isObject(value: unknown): value is Record<string, any> {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function mergeConfig<T = Record<string, any>>(
  a: T,
  b: T,
  isRoot = true
): SiteConfig {
  const merged: Record<string, any> = { ...a };
  for (const key in b) {
    const value = b[key as keyof T];
    if (value == null) continue;

    const existing = merged[key];
    if (Array.isArray(existing) && Array.isArray(value)) {
      merged[key] = [...existing, ...value];
      continue;
    }
    if (isObject(existing) && isObject(value)) {
      if (isRoot && key === "vite")
        merged[key] = mergeViteConfig(existing, value);
      else merged[key] = mergeConfig(existing, value, false);

      continue;
    }
    merged[key] = value;
  }
  return merged as SiteConfig;
}

async function resolveUserConfig(root: string, env: ConfigEnv) {
  let config = { root } as SiteConfig;
  const { ...userConfig } = await loadUserConfigFile(root, env);
  config = mergeConfig(config, siteConfigDefaults(config, userConfig, env));
  config = mergeConfig(config, userConfig);

  const siteUrl = config.siteUrl || "";
  const protocolIndex = siteUrl.indexOf("//");
  const baseIndex = siteUrl.indexOf(
    "/",
    protocolIndex > -1 ? protocolIndex + 2 : 0
  );
  config.siteUrl = baseIndex > -1 ? siteUrl.slice(0, baseIndex) : siteUrl;
  config.base = baseIndex > -1 ? siteUrl.slice(baseIndex) : "/";
  if (!config.base.endsWith("/")) config.base = `${config.base}/`;
  config.vite.base = config.base;
  config.vite.build!.assetsDir = config.assetsDir;

  return config;
}

/**
 *
 * @param root
 * @param configEnv
 * @returns
 */
async function loadUserConfigFile(
  root: string,
  env: ConfigEnv
): Promise<UserConfig> {
  try {
    const { path, config = {} } =
      (await loadConfigFromFile(env, "wilson.config.ts", root)) || {};
    if (path && config) {
      (config as SiteConfig).configPath = path;
      debug(`loaded config at ${pc.yellow(path)}`);
    } else {
      debug("no wilson.config.ts file found.");
    }
    return config as UserConfig;
  } catch (error) {
    if (error instanceof Error && error.message.includes("Could not resolve")) {
      debug("no wilson.config.ts file found.");
      return {};
    }
    throw error;
  }
}

const _dirname = dirname(fileURLToPath(import.meta.url));
export const DIST_CLIENT_PATH = join(_dirname, "../client");

/**
 *
 * @param root
 * @param userConfig
 * @returns
 */
function viteConfigDefaults(root: string, userConfig: UserConfig): ViteOptions {
  return {
    root,
    clearScreen: false,
    resolve: {
      // TODO: add aliases, for example ~/ for resolve(root, srcDir)
    },
    server: {
      fs: { allow: [root, DIST_CLIENT_PATH] },
    },
    build: {
      cssCodeSplit: false,
    },
    plugins: [],
    define: {},
    optimizeDeps: {
      include: [],
      exclude: [],
    },
  };
}

/**
 *
 * @param siteConfig
 * @param userConfig
 * @param env
 * @returns
 */
function siteConfigDefaults(
  siteConfig: SiteConfig,
  userConfig: UserConfig,
  env: ConfigEnv
): Omit<SiteConfig, "mode"> {
  const { root } = siteConfig;
  const isDevelopmentMode = env.mode === "development";
  const { drafts = isDevelopmentMode, srcDir = "src" } = userConfig;

  return {
    assetsDir: "assets",
    base: "/",
    configPath: resolve(root, "wilson.config.ts"),
    debug: true,
    drafts,
    layoutsDir: "layouts",
    outDir: "dist",
    pagesDir: "pages",
    tempDir: ".wilson",
    prettyUrls: true,
    root,
    siteUrl: "",
    srcDir,
    pageExtensions: [".md", ".tsx"],
    vite: viteConfigDefaults(root, userConfig),
    extendRoutes(routes) {
      if (isDevelopmentMode)
        return [
          ...routes,
          {
            path: "*",
            importPath: "wilson/dist/client/components/not-found",
            componentName: "NotFound",
          },
        ];
      // else if (!drafts)
      //   return routes.filter(route => !route.frontmatter?.draft)
    },
  };
}

/**
 *
 * @param root
 * @param env
 * @returns The site config
 */
async function resolveConfig(
  root: string = process.cwd(),
  env: ConfigEnv = { mode: "development", command: "serve" }
): Promise<SiteConfig> {
  const siteConfig = await resolveUserConfig(root, env);
  siteConfig.mode = env.mode;

  const srcDir = resolve(root, siteConfig.srcDir);
  Object.assign(siteConfig, {
    srcDir,
    pagesDir: resolve(srcDir, siteConfig.pagesDir),
    outDir: resolve(root, siteConfig.outDir),
    tempDir: resolve(root, siteConfig.tempDir),
    layoutsDir: resolve(srcDir, siteConfig.layoutsDir),
  });

  return siteConfig;
}

export * from "./types";
export { defineConfig, resolveConfig };
