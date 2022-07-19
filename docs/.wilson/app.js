import { jsx, jsxs, Fragment } from "preact/jsx-runtime";
import { h as h$2, createContext, Component, toChildArray, cloneElement, options, Fragment as Fragment$1 } from "preact";
import { shallowEqual } from "fast-equals";
import { useContext, useState, useEffect } from "preact/hooks";
function Page$5() {
  return jsx("h1", {
    children: "index.tsx"
  });
}
function Page$4() {
  return jsx("h1", {
    children: "test"
  });
}
function Page$3() {
  return jsx("h1", {
    children: "writing/index.tsx"
  });
}
const headline = "_headline_djs9q_1";
const styles = {
  headline
};
function Page$2() {
  return jsx("h1", {
    className: styles.headline,
    children: "writing/hurrdur/page"
  });
}
function getRenderedPaths$1() {
  return [{
    params: {
      page: "foo"
    }
  }, {
    params: {
      page: "bar"
    },
    props: {
      hu1h: 1234
    }
  }];
}
function Page$1(props) {
  return jsxs(Fragment, {
    children: [jsx("h1", {
      children: "Paginated writing"
    }), jsx("pre", {
      children: JSON.stringify(props, null, 2)
    }), jsx("div", {
      children: props.url
    }), jsx("div", {
      children: props.path
    }), jsx("div", {
      children: props.params.page
    }), jsx("div", {
      children: props.huah
    })]
  });
}
function getRenderedPaths() {
  return [{
    params: {
      wat: "oink"
    }
  }];
}
function Page() {
  return jsx("h1", {
    children: "page-[wat]"
  });
}
Page$5.displayName = "Index";
Page$4.displayName = "Test";
Page$3.displayName = "WritingIndex";
Page$2.displayName = "WritingHurrdurPage";
Page$1.displayName = "Writing$Page";
Page.displayName = "WritingPage$Wat";
const specificMatchProps = {
  "writing/:page": [
    {
      "matches": {
        "page": "bar"
      },
      "props": {
        "hu1h": 1234
      }
    }
  ]
};
const PageWrapper = ({ path, element, matches, url, ...rest }) => {
  const specificPathProps = specificMatchProps[path];
  const specific = specificPathProps == null ? void 0 : specificPathProps.find(({ matches: m2 }) => shallowEqual(m2, matches));
  return h$2(element, { params: matches, path, url, ...specific ? specific.props : {} });
};
const routes = [
  h$2(PageWrapper, { path: "/", element: Page$5 }),
  h$2(PageWrapper, { path: "test", element: Page$4 }),
  h$2(PageWrapper, { path: "writing", element: Page$3 }),
  h$2(PageWrapper, { path: "writing/hurrdur/page", element: Page$2 }),
  h$2(PageWrapper, { path: "writing/:page", element: Page$1 }),
  h$2(PageWrapper, { path: "writing/page-:wat", element: Page })
];
var a$1 = {};
function c$1(n2, t) {
  for (var r2 in t)
    n2[r2] = t[r2];
  return n2;
}
function s$1(n2, t, r2) {
  var i2, o2 = /(?:\?([^#]*))?(#.*)?$/, e = n2.match(o2), u2 = {};
  if (e && e[1])
    for (var f2 = e[1].split("&"), c2 = 0; c2 < f2.length; c2++) {
      var s2 = f2[c2].split("=");
      u2[decodeURIComponent(s2[0])] = decodeURIComponent(s2.slice(1).join("="));
    }
  n2 = d$1(n2.replace(o2, "")), t = d$1(t || "");
  for (var h2 = Math.max(n2.length, t.length), v2 = 0; v2 < h2; v2++)
    if (t[v2] && ":" === t[v2].charAt(0)) {
      var l2 = t[v2].replace(/(^:|[+*?]+$)/g, ""), p2 = (t[v2].match(/[+*?]+$/) || a$1)[0] || "", m2 = ~p2.indexOf("+"), y2 = ~p2.indexOf("*"), U2 = n2[v2] || "";
      if (!U2 && !y2 && (p2.indexOf("?") < 0 || m2)) {
        i2 = false;
        break;
      }
      if (u2[l2] = decodeURIComponent(U2), m2 || y2) {
        u2[l2] = n2.slice(v2).map(decodeURIComponent).join("/");
        break;
      }
    } else if (t[v2] !== n2[v2]) {
      i2 = false;
      break;
    }
  return (true === r2.default || false !== i2) && u2;
}
function h$1(n2, t) {
  return n2.rank < t.rank ? 1 : n2.rank > t.rank ? -1 : n2.index - t.index;
}
function v$1(n2, t) {
  return n2.index = t, n2.rank = function(n3) {
    return n3.props.default ? 0 : d$1(n3.props.path).map(l$1).join("");
  }(n2), n2.props;
}
function d$1(n2) {
  return n2.replace(/(^\/+|\/+$)/g, "").split("/");
}
function l$1(n2) {
  return ":" == n2.charAt(0) ? 1 + "*+?".indexOf(n2.charAt(n2.length - 1)) || 4 : 5;
}
var p$1 = {}, m$1 = [], y = [], U = null, g$1 = { url: R() }, k = createContext(g$1);
function C() {
  var n2 = useContext(k);
  if (n2 === g$1) {
    var t = useState()[1];
    useEffect(function() {
      return y.push(t), function() {
        return y.splice(y.indexOf(t), 1);
      };
    }, []);
  }
  return [n2, $];
}
function R() {
  var n2;
  return "" + ((n2 = U && U.location ? U.location : U && U.getCurrentLocation ? U.getCurrentLocation() : "undefined" != typeof location ? location : p$1).pathname || "") + (n2.search || "");
}
function $(n2, t) {
  return void 0 === t && (t = false), "string" != typeof n2 && n2.url && (t = n2.replace, n2 = n2.url), function(n3) {
    for (var t2 = m$1.length; t2--; )
      if (m$1[t2].canRoute(n3))
        return true;
    return false;
  }(n2) && function(n3, t2) {
    void 0 === t2 && (t2 = "push"), U && U[t2] ? U[t2](n3) : "undefined" != typeof history && history[t2 + "State"] && history[t2 + "State"](null, null, n3);
  }(n2, t ? "replace" : "push"), I(n2);
}
function I(n2) {
  for (var t = false, r2 = 0; r2 < m$1.length; r2++)
    m$1[r2].routeTo(n2) && (t = true);
  return t;
}
function M(n2) {
  if (n2 && n2.getAttribute) {
    var t = n2.getAttribute("href"), r2 = n2.getAttribute("target");
    if (t && t.match(/^\//g) && (!r2 || r2.match(/^_?self$/i)))
      return $(t);
  }
}
function b(n2) {
  return n2.stopImmediatePropagation && n2.stopImmediatePropagation(), n2.stopPropagation && n2.stopPropagation(), n2.preventDefault(), false;
}
function W(n2) {
  if (!(n2.ctrlKey || n2.metaKey || n2.altKey || n2.shiftKey || n2.button)) {
    var t = n2.target;
    do {
      if ("a" === t.localName && t.getAttribute("href")) {
        if (t.hasAttribute("data-native") || t.hasAttribute("native"))
          return;
        if (M(t))
          return b(n2);
      }
    } while (t = t.parentNode);
  }
}
var w = false;
function D(n2) {
  n2.history && (U = n2.history), this.state = { url: n2.url || R() };
}
c$1(D.prototype = new Component(), { shouldComponentUpdate: function(n2) {
  return true !== n2.static || n2.url !== this.props.url || n2.onChange !== this.props.onChange;
}, canRoute: function(n2) {
  var t = toChildArray(this.props.children);
  return void 0 !== this.g(t, n2);
}, routeTo: function(n2) {
  this.setState({ url: n2 });
  var t = this.canRoute(n2);
  return this.p || this.forceUpdate(), t;
}, componentWillMount: function() {
  this.p = true;
}, componentDidMount: function() {
  var n2 = this;
  w || (w = true, U || addEventListener("popstate", function() {
    I(R());
  }), addEventListener("click", W)), m$1.push(this), U && (this.u = U.listen(function(t) {
    var r2 = t.location || t;
    n2.routeTo("" + (r2.pathname || "") + (r2.search || ""));
  })), this.p = false;
}, componentWillUnmount: function() {
  "function" == typeof this.u && this.u(), m$1.splice(m$1.indexOf(this), 1);
}, componentWillUpdate: function() {
  this.p = true;
}, componentDidUpdate: function() {
  this.p = false;
}, g: function(n2, t) {
  n2 = n2.filter(v$1).sort(h$1);
  for (var r2 = 0; r2 < n2.length; r2++) {
    var i2 = n2[r2], o2 = s$1(t, i2.props.path, i2.props);
    if (o2)
      return [i2, o2];
  }
}, render: function(n2, t) {
  var e, u2, f2 = n2.onChange, a2 = t.url, s2 = this.c, h2 = this.g(toChildArray(n2.children), a2);
  if (h2 && (u2 = cloneElement(h2[0], c$1(c$1({ url: a2, matches: e = h2[1] }, e), { key: void 0, ref: void 0 }))), a2 !== (s2 && s2.url)) {
    c$1(g$1, s2 = this.c = { url: a2, previous: s2 && s2.url, current: u2, path: u2 ? u2.props.path : null, matches: e }), s2.router = this, s2.active = u2 ? [u2] : [];
    for (var v2 = y.length; v2--; )
      y[v2]({});
    "function" == typeof f2 && f2(s2);
  }
  return h$2(k.Provider, { value: s2 }, u2);
} });
var E = function(n2) {
  return h$2("a", c$1({ onClick: W }, n2));
}, L = function(n2) {
  return h$2(n2.component, n2);
};
var r = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|^--/i, n = /[&<>"]/;
function o(e) {
  var t = String(e);
  return n.test(t) ? t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;") : t;
}
var a = function(e, t) {
  return String(e).replace(/(\n+)/g, "$1" + (t || "	"));
}, i = function(e, t, r2) {
  return String(e).length > (t || 40) || !r2 && -1 !== String(e).indexOf("\n") || -1 !== String(e).indexOf("<");
}, l = {};
function s(e) {
  var t = "";
  for (var n2 in e) {
    var o2 = e[n2];
    null != o2 && "" !== o2 && (t && (t += " "), t += "-" == n2[0] ? n2 : l[n2] || (l[n2] = n2.replace(/([A-Z])/g, "-$1").toLowerCase()), t += ": ", t += o2, "number" == typeof o2 && false === r.test(n2) && (t += "px"), t += ";");
  }
  return t || void 0;
}
function f(e, t) {
  for (var r2 in t)
    e[r2] = t[r2];
  return e;
}
function u(e, t) {
  return Array.isArray(t) ? t.reduce(u, e) : null != t && false !== t && e.push(t), e;
}
var c = { shallow: true }, p = [], _ = /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/, d = /[\s\n\\/='"\0<>]/;
function v() {
  this.__d = true;
}
m.render = m;
var g = function(e, t) {
  return m(e, t, c);
}, h = [];
function m(t, r2, n2) {
  r2 = r2 || {}, n2 = n2 || {};
  var o2 = options.__s;
  options.__s = true;
  var a2 = x(t, r2, n2);
  return options.__c && options.__c(t, h), h.length = 0, options.__s = o2, a2;
}
function x(r2, n2, l2, c2, g2, h2) {
  if (null == r2 || "boolean" == typeof r2)
    return "";
  if ("object" != typeof r2)
    return o(r2);
  var m2 = l2.pretty, y2 = m2 && "string" == typeof m2 ? m2 : "	";
  if (Array.isArray(r2)) {
    for (var b2 = "", S = 0; S < r2.length; S++)
      m2 && S > 0 && (b2 += "\n"), b2 += x(r2[S], n2, l2, c2, g2, h2);
    return b2;
  }
  var k2, w2 = r2.type, O = r2.props, C2 = false;
  if ("function" == typeof w2) {
    if (C2 = true, !l2.shallow || !c2 && false !== l2.renderRootComponent) {
      if (w2 === Fragment$1) {
        var A = [];
        return u(A, r2.props.children), x(A, n2, l2, false !== l2.shallowHighOrder, g2, h2);
      }
      var H, j = r2.__c = { __v: r2, context: n2, props: r2.props, setState: v, forceUpdate: v, __d: true, __h: [] };
      options.__b && options.__b(r2);
      var F = options.__r;
      if (w2.prototype && "function" == typeof w2.prototype.render) {
        var M2 = w2.contextType, T = M2 && n2[M2.__c], $2 = null != M2 ? T ? T.props.value : M2.__ : n2;
        (j = r2.__c = new w2(O, $2)).__v = r2, j._dirty = j.__d = true, j.props = O, null == j.state && (j.state = {}), null == j._nextState && null == j.__s && (j._nextState = j.__s = j.state), j.context = $2, w2.getDerivedStateFromProps ? j.state = f(f({}, j.state), w2.getDerivedStateFromProps(j.props, j.state)) : j.componentWillMount && (j.componentWillMount(), j.state = j._nextState !== j.state ? j._nextState : j.__s !== j.state ? j.__s : j.state), F && F(r2), H = j.render(j.props, j.state, j.context);
      } else
        for (var L2 = w2.contextType, E2 = L2 && n2[L2.__c], D2 = null != L2 ? E2 ? E2.props.value : L2.__ : n2, N = 0; j.__d && N++ < 25; )
          j.__d = false, F && F(r2), H = w2.call(r2.__c, O, D2);
      return j.getChildContext && (n2 = f(f({}, n2), j.getChildContext())), options.diffed && options.diffed(r2), x(H, n2, l2, false !== l2.shallowHighOrder, g2, h2);
    }
    w2 = (k2 = w2).displayName || k2 !== Function && k2.name || function(e) {
      var t = (Function.prototype.toString.call(e).match(/^\s*function\s+([^( ]+)/) || "")[1];
      if (!t) {
        for (var r3 = -1, n3 = p.length; n3--; )
          if (p[n3] === e) {
            r3 = n3;
            break;
          }
        r3 < 0 && (r3 = p.push(e) - 1), t = "UnnamedComponent" + r3;
      }
      return t;
    }(k2);
  }
  var P, R2, U2 = "<" + w2;
  if (O) {
    var W2 = Object.keys(O);
    l2 && true === l2.sortAttributes && W2.sort();
    for (var q = 0; q < W2.length; q++) {
      var z = W2[q], I2 = O[z];
      if ("children" !== z) {
        if (!d.test(z) && (l2 && l2.allAttributes || "key" !== z && "ref" !== z && "__self" !== z && "__source" !== z)) {
          if ("defaultValue" === z)
            z = "value";
          else if ("defaultChecked" === z)
            z = "checked";
          else if ("defaultSelected" === z)
            z = "selected";
          else if ("className" === z) {
            if (void 0 !== O.class)
              continue;
            z = "class";
          } else
            g2 && /^xlink:?./.test(z) && (z = z.toLowerCase().replace(/^xlink:?/, "xlink:"));
          if ("htmlFor" === z) {
            if (O.for)
              continue;
            z = "for";
          }
          "style" === z && I2 && "object" == typeof I2 && (I2 = s(I2)), "a" === z[0] && "r" === z[1] && "boolean" == typeof I2 && (I2 = String(I2));
          var V = l2.attributeHook && l2.attributeHook(z, I2, n2, l2, C2);
          if (V || "" === V)
            U2 += V;
          else if ("dangerouslySetInnerHTML" === z)
            R2 = I2 && I2.__html;
          else if ("textarea" === w2 && "value" === z)
            P = I2;
          else if ((I2 || 0 === I2 || "" === I2) && "function" != typeof I2) {
            if (!(true !== I2 && "" !== I2 || (I2 = z, l2 && l2.xml))) {
              U2 = U2 + " " + z;
              continue;
            }
            if ("value" === z) {
              if ("select" === w2) {
                h2 = I2;
                continue;
              }
              "option" === w2 && h2 == I2 && void 0 === O.selected && (U2 += " selected");
            }
            U2 = U2 + " " + z + '="' + o(I2) + '"';
          }
        }
      } else
        P = I2;
    }
  }
  if (m2) {
    var Z = U2.replace(/\n\s*/, " ");
    Z === U2 || ~Z.indexOf("\n") ? m2 && ~U2.indexOf("\n") && (U2 += "\n") : U2 = Z;
  }
  if (U2 += ">", d.test(w2))
    throw new Error(w2 + " is not a valid HTML tag name in " + U2);
  var B, G = _.test(w2) || l2.voidElements && l2.voidElements.test(w2), J = [];
  if (R2)
    m2 && i(R2) && (R2 = "\n" + y2 + a(R2, y2)), U2 += R2;
  else if (null != P && u(B = [], P).length) {
    for (var K = m2 && ~U2.indexOf("\n"), Q = false, X = 0; X < B.length; X++) {
      var Y = B[X];
      if (null != Y && false !== Y) {
        var ee = x(Y, n2, l2, true, "svg" === w2 || "foreignObject" !== w2 && g2, h2);
        if (m2 && !K && i(ee) && (K = true), ee)
          if (m2) {
            var te = ee.length > 0 && "<" != ee[0];
            Q && te ? J[J.length - 1] += ee : J.push(ee), Q = te;
          } else
            J.push(ee);
      }
    }
    if (m2 && K)
      for (var re = J.length; re--; )
        J[re] = "\n" + y2 + a(J[re], y2);
  }
  if (J.length || R2)
    U2 += J.join("");
  else if (l2 && l2.xml)
    return U2.substring(0, U2.length - 1) + " />";
  return !G || B || R2 ? (m2 && ~U2.indexOf("\n") && (U2 += "\n"), U2 = U2 + "</" + w2 + ">") : U2 = U2.replace(/>$/, " />"), U2;
}
m.shallowRender = g;
function App({
  renderedUrl
}) {
  return jsx(D, {
    url: renderedUrl,
    children: routes
  });
}
async function renderToString(renderedUrl) {
  const html = m(jsx(App, {
    renderedUrl
  }));
  return {
    html
  };
}
export {
  renderToString as default
};
