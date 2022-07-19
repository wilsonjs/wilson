import { h, Fragment } from "preact";
export function getRenderedPaths() {
  return [{ params: { wat: "oink" } }];
}
export default function Page() {
  return /* @__PURE__ */ h("h1", null, "page-[wat]");
}
