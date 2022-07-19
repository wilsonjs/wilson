import { h, Fragment } from "preact";
export function getRenderedPaths() {
  return [{ params: { page: "foo" } }, { params: { page: "bar" }, props: { hu1h: 1234 } }];
}
export default function Page(props) {
  return /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h("h1", null, "Paginated writing"), /* @__PURE__ */ h("pre", null, JSON.stringify(props, null, 2)), /* @__PURE__ */ h("div", null, props.url), /* @__PURE__ */ h("div", null, props.path), /* @__PURE__ */ h("div", null, props.params.page), /* @__PURE__ */ h("div", null, props.huah));
}
