import type { Options } from "tsup";
export const tsup: Options = {
  dts: true,
  target: "node16",
  splitting: false,
  sourcemap: false,
  format: ["cjs"],
  outDir: "dist/node-cjs",
  external: [],
};
