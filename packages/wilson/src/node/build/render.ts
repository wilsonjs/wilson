import { SiteConfig } from "@wilson/config";
import { existsSync } from "fs";
import { join } from "pathe";
import type { FunctionComponent } from "react";
// import { withSpinner } from "../utils";
// import { RollupOutput } from "rollup";
import type { bundle } from "./bundle";
// import routes from "virtual:wilson-route-data";

// async function getRoutesToRender(siteConfig: SiteConfig) {
//   return routes;
// }

export async function renderPages(
  config: SiteConfig,
  { clientResult }: Awaited<ReturnType<typeof bundle>>
) {
  const appPath = ["js", "mjs", "cjs"]
    .map((ext) => join(config.tempDir, `app.${ext}`))
    .find(existsSync);

  if (!appPath)
    throw new Error(
      `Could not find the SSR build for the app in ${config.tempDir}`
    );

  const App: FunctionComponent = await import(appPath);
  console.log({ App });

  // const routesToRender = await withSpinner(
  //   "resolving static paths",
  //   async () => await getRoutesToRender(config)
  // );

  // const clientChunks = clientResult.output;
  // console.log({ appPath, App });

  // await withSpinner("rendering pages", async () => {
  //   for (const route of routesToRender)
  //     route.rendered = await renderPage(config, clientChunks, route, createApp);
  // });

  //   return { routesToRender };
}

// export async function renderPage(
//   config: SiteConfig,
//   clientChunks: RollupOutput["output"],
//   route: RouteToRender,
//   createApp: CreateAppFactory
// ) {
//   const { app, head } = await createApp({
//     routePath: route.path,
//     ssrProps: route.ssrProps,
//   });
//   let content = await renderToString(app, { islandsByPath, renderers });

//   // Remove comments from Vue renderer to allow plain text, RSS, or JSON output.
//   content = content.replace(commentsRegex, "");

//   // Skip HTML shell to allow Vue to render plain text, RSS, or JSON output.
//   if (!route.outputFilename.endsWith(".html")) return content;

//   const { headTags, htmlAttrs, bodyAttrs } = renderHeadToString(head);

//   return `<!DOCTYPE html>
//   <html ${htmlAttrs}>
//     <head>
//       ${headTags}
//       ${stylesheetTagsFrom(config, clientChunks)}
//       ${await scriptTagsFrom(config, islandsByPath[route.path])}
//     </head>
//     <body ${bodyAttrs}>
//       <div id="app">${content}</div>
//     </body>
//   </html>`;
// }
