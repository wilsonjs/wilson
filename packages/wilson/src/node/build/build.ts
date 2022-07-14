import { resolveConfig } from "@wilson/config";
import fs from "fs";
// import { initializePages } from "../pages";
import { withSpinner } from "../utils";
import { bundle } from "./bundle";
import { renderPages } from "./render";

export async function build(root: string = process.cwd()) {
  const start = Date.now();

  process.env.NODE_ENV = "production";
  const siteConfig = await resolveConfig(root, {
    command: "build",
    mode: "production",
  });

  console.log(`started building site ${root} at ${start}`, { siteConfig });
  fs.rmSync(siteConfig.outDir, { recursive: true, force: true });

  const bundleResult = await withSpinner(
    "building client + server bundles",
    async () => await bundle(siteConfig)
  );

  // const pages = await initializePages(siteConfig);
  // console.log({ pages });

  const pagesResult = await renderPages(siteConfig, bundleResult);
  console.dir(pagesResult, { depth: 10 });
  //   console.log({ bundleResult, pagesResult });
}
