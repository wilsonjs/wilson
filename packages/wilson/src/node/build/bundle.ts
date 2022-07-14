import { SiteConfig } from "@wilson/config";
import { dirname, join, resolve } from "pathe";
import glob from "fast-glob";
import { build, mergeConfig, UserConfig as ViteUserConfig } from "vite";
import type { RollupOutput } from "rollup";
import wilsonPlugins from "../plugin";
import { fileURLToPath } from "url";

const _dirname = dirname(fileURLToPath(import.meta.url));
export const DIST_CLIENT_PATH = join(_dirname, "../client");
export const APP_PATH = join(DIST_CLIENT_PATH, "app.js");

// Internal: Currently SSG supports a single stylesheet for all pages.
function resolveEntrypoints(config: SiteConfig): Entrypoints {
  return { app: APP_PATH };
}

type Entrypoints = Record<string, string>;

export async function bundle(siteConfig: SiteConfig) {
  const entrypoints = resolveEntrypoints(siteConfig);

  const [clientResult, serverResult] = await Promise.all([
    bundleWithVite(siteConfig, entrypoints, { ssr: false }),
    bundleWithVite(siteConfig, entrypoints, { ssr: true }),
    bundleHtmlEntrypoints(siteConfig),
  ]);

  return { clientResult, serverResult };
}

async function bundleHtmlEntrypoints(siteConfig: SiteConfig) {
  const entrypoints = glob.sync(resolve(siteConfig.pagesDir, "./**/*.html"), {
    cwd: siteConfig.root,
    ignore: ["node_modules/**"],
  });

  if (entrypoints.length > 0)
    await bundleWithVite(siteConfig, entrypoints, {
      htmlBuild: true,
      ssr: false,
    });
}

async function bundleWithVite(
  siteConfig: SiteConfig,
  entrypoints: string[] | Entrypoints,
  options: { ssr: boolean; htmlBuild?: boolean }
) {
  const { htmlBuild = false, ssr } = options;

  const config = mergeConfig(siteConfig.vite, {
    logLevel: "warn",
    ssr: {
      external: ["vue", "@vue/server-renderer"],
      noExternal: ["wilson"],
    },
    plugins: wilsonPlugins(siteConfig),
    build: {
      ssr,
      cssCodeSplit: htmlBuild,
      minify: ssr ? false : "esbuild",
      emptyOutDir: ssr,
      outDir: ssr ? siteConfig.tempDir : siteConfig.outDir,
      sourcemap: false,
      rollupOptions: {
        input: entrypoints,
        preserveEntrySignatures: htmlBuild ? undefined : "allow-extension",
        treeshake: htmlBuild,
      },
    },
  } as ViteUserConfig);

  console.log(`ssr ${options.ssr}`);
  console.dir(config, { depth: 5 });

  return (await build(config)) as RollupOutput;
}
