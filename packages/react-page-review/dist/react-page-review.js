import ur, { useState as B, useMemo as Ge, useCallback as m, useRef as Je, useEffect as nr } from "react";
import { createPortal as xr } from "react-dom";
var ze = { exports: {} }, Oe = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var ar;
function br() {
  if (ar) return Oe;
  ar = 1;
  var o = ur, S = Symbol.for("react.element"), N = Symbol.for("react.fragment"), T = Object.prototype.hasOwnProperty, C = o.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, O = { key: !0, ref: !0, __self: !0, __source: !0 };
  function x(P, b, k) {
    var w, M = {}, Y = null, X = null;
    k !== void 0 && (Y = "" + k), b.key !== void 0 && (Y = "" + b.key), b.ref !== void 0 && (X = b.ref);
    for (w in b) T.call(b, w) && !O.hasOwnProperty(w) && (M[w] = b[w]);
    if (P && P.defaultProps) for (w in b = P.defaultProps, b) M[w] === void 0 && (M[w] = b[w]);
    return { $$typeof: S, type: P, key: Y, ref: X, props: M, _owner: C.current };
  }
  return Oe.Fragment = N, Oe.jsx = x, Oe.jsxs = x, Oe;
}
var $e = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var ir;
function Rr() {
  return ir || (ir = 1, process.env.NODE_ENV !== "production" && function() {
    var o = ur, S = Symbol.for("react.element"), N = Symbol.for("react.portal"), T = Symbol.for("react.fragment"), C = Symbol.for("react.strict_mode"), O = Symbol.for("react.profiler"), x = Symbol.for("react.provider"), P = Symbol.for("react.context"), b = Symbol.for("react.forward_ref"), k = Symbol.for("react.suspense"), w = Symbol.for("react.suspense_list"), M = Symbol.for("react.memo"), Y = Symbol.for("react.lazy"), X = Symbol.for("react.offscreen"), Z = Symbol.iterator, ce = "@@iterator";
    function ue(e) {
      if (e === null || typeof e != "object")
        return null;
      var r = Z && e[Z] || e[ce];
      return typeof r == "function" ? r : null;
    }
    var s = o.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    function h(e) {
      {
        for (var r = arguments.length, a = new Array(r > 1 ? r - 1 : 0), i = 1; i < r; i++)
          a[i - 1] = arguments[i];
        E("error", e, a);
      }
    }
    function E(e, r, a) {
      {
        var i = s.ReactDebugCurrentFrame, p = i.getStackAddendum();
        p !== "" && (r += "%s", a = a.concat([p]));
        var g = a.map(function(f) {
          return String(f);
        });
        g.unshift("Warning: " + r), Function.prototype.apply.call(console[e], console, g);
      }
    }
    var y = !1, l = !1, $ = !1, U = !1, de = !1, Q;
    Q = Symbol.for("react.module.reference");
    function De(e) {
      return !!(typeof e == "string" || typeof e == "function" || e === T || e === O || de || e === C || e === k || e === w || U || e === X || y || l || $ || typeof e == "object" && e !== null && (e.$$typeof === Y || e.$$typeof === M || e.$$typeof === x || e.$$typeof === P || e.$$typeof === b || // This needs to include all possible module reference object
      // types supported by any Flight configuration anywhere since
      // we don't know which Flight build this will end up being used
      // with.
      e.$$typeof === Q || e.getModuleId !== void 0));
    }
    function fe(e, r, a) {
      var i = e.displayName;
      if (i)
        return i;
      var p = r.displayName || r.name || "";
      return p !== "" ? a + "(" + p + ")" : a;
    }
    function Le(e) {
      return e.displayName || "Context";
    }
    function V(e) {
      if (e == null)
        return null;
      if (typeof e.tag == "number" && h("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof e == "function")
        return e.displayName || e.name || null;
      if (typeof e == "string")
        return e;
      switch (e) {
        case T:
          return "Fragment";
        case N:
          return "Portal";
        case O:
          return "Profiler";
        case C:
          return "StrictMode";
        case k:
          return "Suspense";
        case w:
          return "SuspenseList";
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case P:
            var r = e;
            return Le(r) + ".Consumer";
          case x:
            var a = e;
            return Le(a._context) + ".Provider";
          case b:
            return fe(e, e.render, "ForwardRef");
          case M:
            var i = e.displayName || null;
            return i !== null ? i : V(e.type) || "Memo";
          case Y: {
            var p = e, g = p._payload, f = p._init;
            try {
              return V(f(g));
            } catch {
              return null;
            }
          }
        }
      return null;
    }
    var R = Object.assign, H = 0, be, ee, q, J, G, Fe, A;
    function ve() {
    }
    ve.__reactDisabledLog = !0;
    function c() {
      {
        if (H === 0) {
          be = console.log, ee = console.info, q = console.warn, J = console.error, G = console.group, Fe = console.groupCollapsed, A = console.groupEnd;
          var e = {
            configurable: !0,
            enumerable: !0,
            value: ve,
            writable: !0
          };
          Object.defineProperties(console, {
            info: e,
            log: e,
            warn: e,
            error: e,
            group: e,
            groupCollapsed: e,
            groupEnd: e
          });
        }
        H++;
      }
    }
    function re() {
      {
        if (H--, H === 0) {
          var e = {
            configurable: !0,
            enumerable: !0,
            writable: !0
          };
          Object.defineProperties(console, {
            log: R({}, e, {
              value: be
            }),
            info: R({}, e, {
              value: ee
            }),
            warn: R({}, e, {
              value: q
            }),
            error: R({}, e, {
              value: J
            }),
            group: R({}, e, {
              value: G
            }),
            groupCollapsed: R({}, e, {
              value: Fe
            }),
            groupEnd: R({}, e, {
              value: A
            })
          });
        }
        H < 0 && h("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
      }
    }
    var te = s.ReactCurrentDispatcher, ne;
    function ae(e, r, a) {
      {
        if (ne === void 0)
          try {
            throw Error();
          } catch (p) {
            var i = p.stack.trim().match(/\n( *(at )?)/);
            ne = i && i[1] || "";
          }
        return `
` + ne + e;
      }
    }
    var he = !1, K;
    {
      var pe = typeof WeakMap == "function" ? WeakMap : Map;
      K = new pe();
    }
    function Re(e, r) {
      if (!e || he)
        return "";
      {
        var a = K.get(e);
        if (a !== void 0)
          return a;
      }
      var i;
      he = !0;
      var p = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      var g;
      g = te.current, te.current = null, c();
      try {
        if (r) {
          var f = function() {
            throw Error();
          };
          if (Object.defineProperty(f.prototype, "props", {
            set: function() {
              throw Error();
            }
          }), typeof Reflect == "object" && Reflect.construct) {
            try {
              Reflect.construct(f, []);
            } catch (F) {
              i = F;
            }
            Reflect.construct(e, [], f);
          } else {
            try {
              f.call();
            } catch (F) {
              i = F;
            }
            e.call(f.prototype);
          }
        } else {
          try {
            throw Error();
          } catch (F) {
            i = F;
          }
          e();
        }
      } catch (F) {
        if (F && i && typeof F.stack == "string") {
          for (var u = F.stack.split(`
`), L = i.stack.split(`
`), j = u.length - 1, _ = L.length - 1; j >= 1 && _ >= 0 && u[j] !== L[_]; )
            _--;
          for (; j >= 1 && _ >= 0; j--, _--)
            if (u[j] !== L[_]) {
              if (j !== 1 || _ !== 1)
                do
                  if (j--, _--, _ < 0 || u[j] !== L[_]) {
                    var I = `
` + u[j].replace(" at new ", " at ");
                    return e.displayName && I.includes("<anonymous>") && (I = I.replace("<anonymous>", e.displayName)), typeof e == "function" && K.set(e, I), I;
                  }
                while (j >= 1 && _ >= 0);
              break;
            }
        }
      } finally {
        he = !1, te.current = g, re(), Error.prepareStackTrace = p;
      }
      var xe = e ? e.displayName || e.name : "", le = xe ? ae(xe) : "";
      return typeof e == "function" && K.set(e, le), le;
    }
    function Xe(e, r, a) {
      return Re(e, !1);
    }
    function qe(e) {
      var r = e.prototype;
      return !!(r && r.isReactComponent);
    }
    function me(e, r, a) {
      if (e == null)
        return "";
      if (typeof e == "function")
        return Re(e, qe(e));
      if (typeof e == "string")
        return ae(e);
      switch (e) {
        case k:
          return ae("Suspense");
        case w:
          return ae("SuspenseList");
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case b:
            return Xe(e.render);
          case M:
            return me(e.type, r, a);
          case Y: {
            var i = e, p = i._payload, g = i._init;
            try {
              return me(g(p), r, a);
            } catch {
            }
          }
        }
      return "";
    }
    var ie = Object.prototype.hasOwnProperty, je = {}, ge = s.ReactDebugCurrentFrame;
    function z(e) {
      if (e) {
        var r = e._owner, a = me(e.type, e._source, r ? r.type : null);
        ge.setExtraStackFrame(a);
      } else
        ge.setExtraStackFrame(null);
    }
    function Ee(e, r, a, i, p) {
      {
        var g = Function.call.bind(ie);
        for (var f in e)
          if (g(e, f)) {
            var u = void 0;
            try {
              if (typeof e[f] != "function") {
                var L = Error((i || "React class") + ": " + a + " type `" + f + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof e[f] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                throw L.name = "Invariant Violation", L;
              }
              u = e[f](r, f, i, a, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
            } catch (j) {
              u = j;
            }
            u && !(u instanceof Error) && (z(p), h("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", i || "React class", a, f, typeof u), z(null)), u instanceof Error && !(u.message in je) && (je[u.message] = !0, z(p), h("Failed %s type: %s", a, u.message), z(null));
          }
      }
    }
    var _e = Array.isArray;
    function oe(e) {
      return _e(e);
    }
    function Ne(e) {
      {
        var r = typeof Symbol == "function" && Symbol.toStringTag, a = r && e[Symbol.toStringTag] || e.constructor.name || "Object";
        return a;
      }
    }
    function Te(e) {
      try {
        return Me(e), !1;
      } catch {
        return !0;
      }
    }
    function Me(e) {
      return "" + e;
    }
    function we(e) {
      if (Te(e))
        return h("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", Ne(e)), Me(e);
    }
    var ye = s.ReactCurrentOwner, Ke = {
      key: !0,
      ref: !0,
      __self: !0,
      __source: !0
    }, Se, Pe;
    function Ye(e) {
      if (ie.call(e, "ref")) {
        var r = Object.getOwnPropertyDescriptor(e, "ref").get;
        if (r && r.isReactWarning)
          return !1;
      }
      return e.ref !== void 0;
    }
    function Ie(e) {
      if (ie.call(e, "key")) {
        var r = Object.getOwnPropertyDescriptor(e, "key").get;
        if (r && r.isReactWarning)
          return !1;
      }
      return e.key !== void 0;
    }
    function Ae(e, r) {
      typeof e.ref == "string" && ye.current;
    }
    function We(e, r) {
      {
        var a = function() {
          Se || (Se = !0, h("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", r));
        };
        a.isReactWarning = !0, Object.defineProperty(e, "key", {
          get: a,
          configurable: !0
        });
      }
    }
    function Ue(e, r) {
      {
        var a = function() {
          Pe || (Pe = !0, h("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", r));
        };
        a.isReactWarning = !0, Object.defineProperty(e, "ref", {
          get: a,
          configurable: !0
        });
      }
    }
    var Ve = function(e, r, a, i, p, g, f) {
      var u = {
        // This tag allows us to uniquely identify this as a React Element
        $$typeof: S,
        // Built-in properties that belong on the element
        type: e,
        key: r,
        ref: a,
        props: f,
        // Record the component responsible for creating this element.
        _owner: g
      };
      return u._store = {}, Object.defineProperty(u._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: !1
      }), Object.defineProperty(u, "_self", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: i
      }), Object.defineProperty(u, "_source", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: p
      }), Object.freeze && (Object.freeze(u.props), Object.freeze(u)), u;
    };
    function n(e, r, a, i, p) {
      {
        var g, f = {}, u = null, L = null;
        a !== void 0 && (we(a), u = "" + a), Ie(r) && (we(r.key), u = "" + r.key), Ye(r) && (L = r.ref, Ae(r, p));
        for (g in r)
          ie.call(r, g) && !Ke.hasOwnProperty(g) && (f[g] = r[g]);
        if (e && e.defaultProps) {
          var j = e.defaultProps;
          for (g in j)
            f[g] === void 0 && (f[g] = j[g]);
        }
        if (u || L) {
          var _ = typeof e == "function" ? e.displayName || e.name || "Unknown" : e;
          u && We(f, _), L && Ue(f, _);
        }
        return Ve(e, u, L, p, i, ye.current, f);
      }
    }
    var v = s.ReactCurrentOwner, d = s.ReactDebugCurrentFrame;
    function D(e) {
      if (e) {
        var r = e._owner, a = me(e.type, e._source, r ? r.type : null);
        d.setExtraStackFrame(a);
      } else
        d.setExtraStackFrame(null);
    }
    var W;
    W = !1;
    function se(e) {
      return typeof e == "object" && e !== null && e.$$typeof === S;
    }
    function ke() {
      {
        if (v.current) {
          var e = V(v.current.type);
          if (e)
            return `

Check the render method of \`` + e + "`.";
        }
        return "";
      }
    }
    function Ce(e) {
      return "";
    }
    var Ze = {};
    function dr(e) {
      {
        var r = ke();
        if (!r) {
          var a = typeof e == "string" ? e : e.displayName || e.name;
          a && (r = `

Check the top-level render call using <` + a + ">.");
        }
        return r;
      }
    }
    function Qe(e, r) {
      {
        if (!e._store || e._store.validated || e.key != null)
          return;
        e._store.validated = !0;
        var a = dr(r);
        if (Ze[a])
          return;
        Ze[a] = !0;
        var i = "";
        e && e._owner && e._owner !== v.current && (i = " It was passed a child from " + V(e._owner.type) + "."), D(e), h('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', a, i), D(null);
      }
    }
    function er(e, r) {
      {
        if (typeof e != "object")
          return;
        if (oe(e))
          for (var a = 0; a < e.length; a++) {
            var i = e[a];
            se(i) && Qe(i, r);
          }
        else if (se(e))
          e._store && (e._store.validated = !0);
        else if (e) {
          var p = ue(e);
          if (typeof p == "function" && p !== e.entries)
            for (var g = p.call(e), f; !(f = g.next()).done; )
              se(f.value) && Qe(f.value, r);
        }
      }
    }
    function fr(e) {
      {
        var r = e.type;
        if (r == null || typeof r == "string")
          return;
        var a;
        if (typeof r == "function")
          a = r.propTypes;
        else if (typeof r == "object" && (r.$$typeof === b || // Note: Memo only checks outer props here.
        // Inner props are checked in the reconciler.
        r.$$typeof === M))
          a = r.propTypes;
        else
          return;
        if (a) {
          var i = V(r);
          Ee(a, e.props, "prop", i, e);
        } else if (r.PropTypes !== void 0 && !W) {
          W = !0;
          var p = V(r);
          h("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", p || "Unknown");
        }
        typeof r.getDefaultProps == "function" && !r.getDefaultProps.isReactClassApproved && h("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
      }
    }
    function vr(e) {
      {
        for (var r = Object.keys(e.props), a = 0; a < r.length; a++) {
          var i = r[a];
          if (i !== "children" && i !== "key") {
            D(e), h("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", i), D(null);
            break;
          }
        }
        e.ref !== null && (D(e), h("Invalid attribute `ref` supplied to `React.Fragment`."), D(null));
      }
    }
    var rr = {};
    function tr(e, r, a, i, p, g) {
      {
        var f = De(e);
        if (!f) {
          var u = "";
          (e === void 0 || typeof e == "object" && e !== null && Object.keys(e).length === 0) && (u += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
          var L = Ce();
          L ? u += L : u += ke();
          var j;
          e === null ? j = "null" : oe(e) ? j = "array" : e !== void 0 && e.$$typeof === S ? (j = "<" + (V(e.type) || "Unknown") + " />", u = " Did you accidentally export a JSX literal instead of a component?") : j = typeof e, h("React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", j, u);
        }
        var _ = n(e, r, a, p, g);
        if (_ == null)
          return _;
        if (f) {
          var I = r.children;
          if (I !== void 0)
            if (i)
              if (oe(I)) {
                for (var xe = 0; xe < I.length; xe++)
                  er(I[xe], e);
                Object.freeze && Object.freeze(I);
              } else
                h("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
            else
              er(I, e);
        }
        if (ie.call(r, "key")) {
          var le = V(e), F = Object.keys(r).filter(function(yr) {
            return yr !== "key";
          }), He = F.length > 0 ? "{key: someKey, " + F.join(": ..., ") + ": ...}" : "{key: someKey}";
          if (!rr[le + He]) {
            var wr = F.length > 0 ? "{" + F.join(": ..., ") + ": ...}" : "{}";
            h(`A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`, He, le, wr, le), rr[le + He] = !0;
          }
        }
        return e === T ? vr(_) : fr(_), _;
      }
    }
    function hr(e, r, a) {
      return tr(e, r, a, !0);
    }
    function pr(e, r, a) {
      return tr(e, r, a, !1);
    }
    var mr = pr, gr = hr;
    $e.Fragment = T, $e.jsx = mr, $e.jsxs = gr;
  }()), $e;
}
process.env.NODE_ENV === "production" ? ze.exports = br() : ze.exports = Rr();
var t = ze.exports;
function jr(o = {}) {
  const {
    storageKey: S = "page-reviews",
    defaultPagePath: N = () => typeof window < "u" ? window.location.pathname + window.location.search : "/"
  } = o;
  function T() {
    return "rv-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
  }
  function C() {
    if (typeof window > "u") return [];
    try {
      const s = window.localStorage.getItem(S);
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  }
  function O(s) {
    if (!(typeof window > "u"))
      try {
        window.localStorage.setItem(S, JSON.stringify(s));
      } catch {
      }
  }
  const [x, P] = B(C), b = Ge(() => x, [x]), k = m((s) => {
    const h = s || N();
    return x.filter((E) => E.pagePath === h);
  }, [x, N]), w = m((s) => {
    const h = {
      id: T(),
      ...s,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    return P((E) => {
      const y = [h, ...E];
      return O(y), y;
    }), h;
  }, []), M = m((s, h) => {
    P((E) => {
      const y = E.map((l) => l.id === s ? { ...l, ...h } : l);
      return O(y), y;
    });
  }, []), Y = m((s) => {
    P((h) => {
      const E = h.filter((y) => y.id !== s);
      return O(E), E;
    });
  }, []), X = m((s) => {
    const h = s || N();
    P((E) => {
      const y = E.filter((l) => l.pagePath !== h);
      return O(y), y;
    });
  }, [N]), Z = m(() => {
    P([]), O([]);
  }, []), ce = m(() => {
    const s = {
      exportTime: (/* @__PURE__ */ new Date()).toISOString(),
      total: x.length,
      reviews: x
    };
    or(
      new Blob([JSON.stringify(s, null, 2)], { type: "application/json" }),
      `page-reviews-${sr()}.json`
    );
  }, [x]), ue = m(() => {
    const s = [
      "# 页面评审报告",
      "",
      `导出时间：${(/* @__PURE__ */ new Date()).toLocaleString()}`,
      `评审总数：${x.length}`,
      ""
    ], h = _r(x, "pagePath");
    Object.entries(h).forEach(([E, y]) => {
      s.push(`## 页面：${E}`), s.push(""), y.forEach((l, $) => {
        var U, de;
        s.push(`### ${$ + 1}. ${l.title || "未命名评审"}`), s.push(`- **类型**：${l.type === "element" ? "元素评审" : "视图范围评审"}`), s.push(`- **严重等级**：${Er(l.severity)}`), s.push(`- **状态**：${l.status === "resolved" ? "已解决" : "待处理"}`), s.push(`- **窗口尺寸**：${(U = l.viewport) == null ? void 0 : U.width} × ${(de = l.viewport) == null ? void 0 : de.height}`), l.scroll && s.push(`- **滚动位置**：x=${l.scroll.x}, y=${l.scroll.y}`), l.type === "element" && l.elementRect ? (s.push(`- **元素选择器**：\`${l.selector}\``), s.push(`- **元素位置**：x=${l.elementRect.x}, y=${l.elementRect.y}, width=${l.elementRect.width}, height=${l.elementRect.height}`), l.elementText && s.push(`- **元素文本**：${l.elementText}`)) : l.viewportRect && s.push(`- **框选范围**：x=${l.viewportRect.x}, y=${l.viewportRect.y}, width=${l.viewportRect.width}, height=${l.viewportRect.height}`), s.push(`- **评审建议**：${l.suggestion}`), s.push(`- **创建时间**：${new Date(l.createdAt).toLocaleString()}`), s.push("");
      });
    }), or(
      new Blob([s.join(`
`)], { type: "text/markdown" }),
      `page-reviews-${sr()}.md`
    );
  }, [x]);
  return {
    reviews: x,
    allReviews: b,
    getPageReviews: k,
    addReview: w,
    updateReview: M,
    deleteReview: Y,
    clearPageReviews: X,
    clearAllReviews: Z,
    exportToJSON: ce,
    exportToMarkdown: ue
  };
}
function or(o, S) {
  if (typeof window > "u") return;
  const N = URL.createObjectURL(o), T = document.createElement("a");
  T.href = N, T.download = S, document.body.appendChild(T), T.click(), document.body.removeChild(T), URL.revokeObjectURL(N);
}
function sr() {
  const o = /* @__PURE__ */ new Date();
  return `${o.getFullYear()}${Be(o.getMonth() + 1)}${Be(o.getDate())}-${Be(o.getHours())}${Be(o.getMinutes())}`;
}
function Be(o) {
  return String(o).padStart(2, "0");
}
function Er(o) {
  return { low: "低", medium: "中", high: "高", critical: "严重" }[o] || o;
}
function _r(o, S) {
  return o.reduce((N, T) => {
    const C = T[S] || "unknown";
    return N[C] || (N[C] = []), N[C].push(T), N;
  }, {});
}
function kr({
  active: o = !1,
  pagePath: S = "",
  pageName: N = "",
  storageKey: T = "page-reviews",
  onActiveChange: C,
  onAdd: O,
  onUpdate: x,
  onDelete: P,
  onClear: b,
  onExport: k
}) {
  var Se, Pe, Ye, Ie, Ae, We, Ue, Ve;
  const w = Ge(() => S || (typeof window < "u" ? window.location.pathname + window.location.search : "/"), [S]), {
    reviews: M,
    getPageReviews: Y,
    addReview: X,
    updateReview: Z,
    deleteReview: ce,
    clearPageReviews: ue,
    exportToJSON: s,
    exportToMarkdown: h
  } = jr({ storageKey: T, defaultPagePath: () => w }), E = Ge(() => Y(w), [Y, w, M]), [y, l] = B("element"), [$, U] = B(!1), [de, Q] = B(!1), [De, fe] = B(null), [Le, V] = B(""), [R, H] = B(null), [be, ee] = B(null), q = Je(!1), J = Je({ x: 0, y: 0 }), [G, Fe] = B({ x: 0, y: 0 }), A = Je(!1), ve = Je({ x: 0, y: 0 }), [c, re] = B({
    type: "element",
    title: "",
    severity: "medium",
    suggestion: "",
    selector: "",
    elementText: "",
    elementRect: null,
    viewportRect: null,
    viewport: { width: 0, height: 0 },
    scroll: { x: 0, y: 0 },
    pagePath: "",
    pageUrl: "",
    pageName: ""
  }), te = c.title.trim() && c.suggestion.trim(), ne = m(() => {
    C == null || C(!1);
  }, [C]), ae = m(() => ({
    viewport: { width: window.innerWidth, height: window.innerHeight },
    scroll: { x: window.scrollX, y: window.scrollY },
    pagePath: w,
    pageUrl: window.location.href,
    pageName: N || w
  }), [w, N]), he = m((n) => {
    var D;
    if (n.id) return "#" + n.id;
    if (n.className) {
      const W = String(n.className).split(/\s+/).filter((se) => se && !se.startsWith("el-")).slice(0, 2);
      if (W.length) return n.tagName.toLowerCase() + "." + W.join(".");
    }
    let v = [], d = n;
    for (; d && d !== document.body; ) {
      let W = d.tagName.toLowerCase();
      if (d.id) {
        W += "#" + d.id, v.unshift(W);
        break;
      }
      const ke = Array.from(((D = d.parentNode) == null ? void 0 : D.children) || []).filter((Ce) => Ce.tagName === d.tagName);
      if (ke.length > 1) {
        const Ce = ke.indexOf(d) + 1;
        W += `:nth-of-type(${Ce})`;
      }
      v.unshift(W), d = d.parentNode;
    }
    return v.join(" > ");
  }, []), K = m((n) => {
    const v = document.elementFromPoint(n.clientX, n.clientY);
    return !v || v.closest(".review-overlay") ? null : v;
  }, []), pe = m((n, v = null) => {
    const d = ae();
    re({
      type: n,
      title: "",
      severity: "medium",
      suggestion: "",
      selector: (R == null ? void 0 : R.selector) || "",
      elementText: (R == null ? void 0 : R.text) || "",
      elementRect: (R == null ? void 0 : R.rect) || null,
      viewportRect: v,
      viewport: d.viewport,
      scroll: d.scroll,
      pagePath: d.pagePath,
      pageUrl: d.pageUrl,
      pageName: d.pageName
    }), U(!0);
  }, [ae, R]), Re = m(() => {
    H(null), ee(null), re({
      type: "element",
      title: "",
      severity: "medium",
      suggestion: "",
      selector: "",
      elementText: "",
      elementRect: null,
      viewportRect: null,
      viewport: { width: 0, height: 0 },
      scroll: { x: 0, y: 0 },
      pagePath: "",
      pageUrl: "",
      pageName: ""
    });
  }, []), Xe = m(() => {
    if (!te) return;
    const n = X({
      type: c.type,
      title: c.title.trim(),
      severity: c.severity,
      suggestion: c.suggestion.trim(),
      selector: c.selector,
      elementText: c.elementText,
      elementRect: c.elementRect,
      viewportRect: c.viewportRect,
      viewport: c.viewport,
      scroll: c.scroll,
      pagePath: c.pagePath,
      pageUrl: c.pageUrl,
      pageName: c.pageName,
      status: "open"
    });
    U(!1), O == null || O(n);
  }, [te, c, X, O]), qe = m((n) => {
    Z(n, { status: "resolved" }), x == null || x({ id: n, status: "resolved" });
  }, [Z, x]), me = m((n) => {
    typeof window < "u" && !window.confirm("确定删除这条评审意见吗？") || (ce(n), P == null || P({ id: n }));
  }, [ce, P]), ie = m(() => {
    E.length !== 0 && (typeof window < "u" && !window.confirm("确定清空当前页面的所有评审意见吗？") || (ue(w), b == null || b({ pagePath: w })));
  }, [E.length, ue, w, b]), je = m(() => {
    s(), k == null || k({ format: "json" });
  }, [s, k]), ge = m(() => {
    h(), k == null || k({ format: "markdown" });
  }, [h, k]), z = m((n) => {
    if (A.current || y !== "element" || $ || q.current) return;
    const v = K(n);
    if (!v) {
      fe(null);
      return;
    }
    const d = v.getBoundingClientRect();
    fe({
      x: d.left + window.scrollX,
      y: d.top + window.scrollY,
      width: d.width,
      height: d.height
    }), V(v.tagName.toLowerCase());
  }, [y, $, K]), Ee = m(() => {
    fe(null);
  }, []), _e = m((n) => {
    var D;
    if (y !== "element" || $ || q.current) return;
    const v = K(n);
    if (!v) return;
    n.preventDefault(), n.stopPropagation();
    const d = v.getBoundingClientRect();
    H({
      el: v,
      selector: he(v),
      tag: v.tagName.toLowerCase(),
      text: ((D = v.innerText) == null ? void 0 : D.slice(0, 40)) || "",
      rect: {
        x: d.left + window.scrollX,
        y: d.top + window.scrollY,
        width: d.width,
        height: d.height
      }
    }), pe("element");
  }, [y, $, K, he, pe]), oe = m((n) => {
    A.current || y !== "viewport" || $ || (q.current = !0, J.current = { x: n.clientX + window.scrollX, y: n.clientY + window.scrollY }, ee({ x: J.current.x, y: J.current.y, width: 0, height: 0 }));
  }, [y, $]), Ne = m((n) => {
    if (A.current || !q.current) return;
    const v = n.clientX + window.scrollX, d = n.clientY + window.scrollY;
    ee({
      x: Math.min(J.current.x, v),
      y: Math.min(J.current.y, d),
      width: Math.abs(v - J.current.x),
      height: Math.abs(d - J.current.y)
    });
  }, []), Te = m((n) => {
    if (A.current) {
      A.current = !1;
      return;
    }
    q.current && (q.current = !1, ee((v) => (v && v.width > 10 && v.height > 10 && pe("viewport", { ...v }), null)));
  }, [pe]), Me = m((n) => {
    var d, D;
    ((d = n.target.classList) != null && d.contains("toolbar-title") || (D = n.target.classList) != null && D.contains("review-toolbar")) && (A.current = !0, ve.current = {
      x: n.clientX - G.x,
      y: n.clientY - G.y
    });
  }, [G]), we = m((n) => {
    A.current && Fe({
      x: n.clientX - ve.current.x,
      y: n.clientY - ve.current.y
    });
  }, []), ye = m((n) => {
    n.key === "Escape" && ($ ? U(!1) : ne());
  }, [$, ne]);
  if (nr(() => {
    if (o)
      return document.addEventListener("mousemove", z), document.addEventListener("mouseout", Ee), document.addEventListener("click", _e, !0), document.addEventListener("mousedown", oe), document.addEventListener("mousemove", Ne), document.addEventListener("mousemove", we), document.addEventListener("mouseup", Te), document.addEventListener("keydown", ye), () => {
        document.removeEventListener("mousemove", z), document.removeEventListener("mouseout", Ee), document.removeEventListener("click", _e, !0), document.removeEventListener("mousedown", oe), document.removeEventListener("mousemove", Ne), document.removeEventListener("mousemove", we), document.removeEventListener("mouseup", Te), document.removeEventListener("keydown", ye);
      };
  }, [o, z, Ee, _e, oe, Ne, we, Te, ye]), nr(() => {
    o ? l("element") : (Re(), fe(null), Q(!1));
  }, [o, Re]), !o) return null;
  const Ke = {
    transform: `translate(calc(-50% + ${G.x}px), ${G.y}px)`
  };
  return xr(
    /* @__PURE__ */ t.jsxs("div", { className: "review-overlay", onClick: (n) => n.stopPropagation(), children: [
      /* @__PURE__ */ t.jsxs(
        "div",
        {
          className: `review-toolbar ${A.current ? "is-dragging" : ""}`,
          style: Ke,
          onMouseDown: Me,
          children: [
            /* @__PURE__ */ t.jsxs("div", { className: "toolbar-left", children: [
              /* @__PURE__ */ t.jsx("span", { className: "toolbar-title", title: "按住此处可拖动", children: "页面评审模式" }),
              /* @__PURE__ */ t.jsxs("div", { className: "radio-group", children: [
                /* @__PURE__ */ t.jsx("button", { className: y === "element" ? "active" : "", onClick: () => l("element"), children: "选择元素" }),
                /* @__PURE__ */ t.jsx("button", { className: y === "viewport" ? "active" : "", onClick: () => l("viewport"), children: "框定视图" })
              ] })
            ] }),
            /* @__PURE__ */ t.jsxs("div", { className: "toolbar-right", children: [
              /* @__PURE__ */ t.jsxs("button", { className: "badge-btn", onClick: () => Q(!0), children: [
                "评审列表 ",
                /* @__PURE__ */ t.jsx("span", { className: "badge", children: E.length })
              ] }),
              /* @__PURE__ */ t.jsxs("div", { className: "dropdown", children: [
                /* @__PURE__ */ t.jsx("button", { className: "primary", onClick: ge, children: "导出" }),
                /* @__PURE__ */ t.jsxs("div", { className: "dropdown-menu", children: [
                  /* @__PURE__ */ t.jsx("div", { onClick: ge, children: "导出为 Markdown" }),
                  /* @__PURE__ */ t.jsx("div", { onClick: je, children: "导出为 JSON" })
                ] })
              ] }),
              /* @__PURE__ */ t.jsx("button", { className: "danger", onClick: ne, children: "退出评审" })
            ] })
          ]
        }
      ),
      De && y === "element" && !$ && /* @__PURE__ */ t.jsx("div", { className: "highlight-box hover-box", style: lr(De), children: /* @__PURE__ */ t.jsx("span", { className: "highlight-label", children: Le }) }),
      R && y === "element" && !$ && /* @__PURE__ */ t.jsx("div", { className: "highlight-box selected-box", style: lr(R.rect), children: /* @__PURE__ */ t.jsxs("span", { className: "highlight-label", children: [
        "已选：",
        R.tag
      ] }) }),
      be && /* @__PURE__ */ t.jsx("div", { className: "drag-rect", style: Nr(be) }),
      $ && /* @__PURE__ */ t.jsx("div", { className: "modal-backdrop", onClick: () => U(!1), children: /* @__PURE__ */ t.jsxs("div", { className: "modal", onClick: (n) => n.stopPropagation(), children: [
        /* @__PURE__ */ t.jsx("div", { className: "modal-header", children: "添加评审意见" }),
        /* @__PURE__ */ t.jsxs("div", { className: "modal-body", children: [
          /* @__PURE__ */ t.jsxs("div", { className: "form-row", children: [
            /* @__PURE__ */ t.jsx("label", { children: "评审位置" }),
            /* @__PURE__ */ t.jsxs("div", { className: "review-target-info", children: [
              /* @__PURE__ */ t.jsx("span", { className: "tag", children: c.type === "element" ? "元素" : "视图范围" }),
              /* @__PURE__ */ t.jsx("span", { className: "target-desc", children: c.type === "element" ? c.elementText || c.selector : `框选区域 x=${(Se = c.viewportRect) == null ? void 0 : Se.x}, y=${(Pe = c.viewportRect) == null ? void 0 : Pe.y}, w=${(Ye = c.viewportRect) == null ? void 0 : Ye.width}, h=${(Ie = c.viewportRect) == null ? void 0 : Ie.height}` })
            ] })
          ] }),
          /* @__PURE__ */ t.jsxs("div", { className: "form-row", children: [
            /* @__PURE__ */ t.jsx("label", { children: "窗口尺寸" }),
            /* @__PURE__ */ t.jsxs("span", { className: "text-muted", children: [
              (Ae = c.viewport) == null ? void 0 : Ae.width,
              " × ",
              (We = c.viewport) == null ? void 0 : We.height
            ] })
          ] }),
          /* @__PURE__ */ t.jsxs("div", { className: "form-row", children: [
            /* @__PURE__ */ t.jsx("label", { children: "滚动位置" }),
            /* @__PURE__ */ t.jsxs("span", { className: "text-muted", children: [
              "x=",
              (Ue = c.scroll) == null ? void 0 : Ue.x,
              ", y=",
              (Ve = c.scroll) == null ? void 0 : Ve.y
            ] })
          ] }),
          /* @__PURE__ */ t.jsxs("div", { className: "form-row", children: [
            /* @__PURE__ */ t.jsxs("label", { children: [
              "标题 ",
              /* @__PURE__ */ t.jsx("span", { className: "required", children: "*" })
            ] }),
            /* @__PURE__ */ t.jsx(
              "input",
              {
                type: "text",
                value: c.title,
                onChange: (n) => re({ ...c, title: n.target.value }),
                placeholder: "例如：按钮样式不统一"
              }
            )
          ] }),
          /* @__PURE__ */ t.jsxs("div", { className: "form-row", children: [
            /* @__PURE__ */ t.jsxs("label", { children: [
              "严重等级 ",
              /* @__PURE__ */ t.jsx("span", { className: "required", children: "*" })
            ] }),
            /* @__PURE__ */ t.jsx("div", { className: "radio-group", children: ["low", "medium", "high", "critical"].map((n) => /* @__PURE__ */ t.jsxs("label", { className: "radio-label", children: [
              /* @__PURE__ */ t.jsx(
                "input",
                {
                  type: "radio",
                  name: "severity",
                  value: n,
                  checked: c.severity === n,
                  onChange: () => re({ ...c, severity: n })
                }
              ),
              cr(n)
            ] }, n)) })
          ] }),
          /* @__PURE__ */ t.jsxs("div", { className: "form-row", children: [
            /* @__PURE__ */ t.jsxs("label", { children: [
              "评审建议 ",
              /* @__PURE__ */ t.jsx("span", { className: "required", children: "*" })
            ] }),
            /* @__PURE__ */ t.jsx(
              "textarea",
              {
                rows: 4,
                value: c.suggestion,
                onChange: (n) => re({ ...c, suggestion: n.target.value }),
                placeholder: "描述问题现象、影响和改进建议"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ t.jsxs("div", { className: "modal-footer", children: [
          /* @__PURE__ */ t.jsx("button", { onClick: () => U(!1), children: "取消" }),
          /* @__PURE__ */ t.jsx("button", { className: "primary", disabled: !te, onClick: Xe, children: "保存评审" })
        ] })
      ] }) }),
      de && /* @__PURE__ */ t.jsxs(t.Fragment, { children: [
        /* @__PURE__ */ t.jsx("div", { className: "drawer-backdrop", onClick: () => Q(!1) }),
        /* @__PURE__ */ t.jsxs("div", { className: "drawer", children: [
          /* @__PURE__ */ t.jsxs("div", { className: "drawer-header", children: [
            /* @__PURE__ */ t.jsx("span", { children: "当前页面评审意见" }),
            /* @__PURE__ */ t.jsx("button", { className: "close", onClick: () => Q(!1), children: "×" })
          ] }),
          /* @__PURE__ */ t.jsxs("div", { className: "drawer-body", children: [
            /* @__PURE__ */ t.jsxs("div", { className: "review-list-actions", children: [
              /* @__PURE__ */ t.jsx("button", { className: "primary", onClick: ge, children: "导出 Markdown" }),
              /* @__PURE__ */ t.jsx("button", { onClick: je, children: "导出 JSON" }),
              /* @__PURE__ */ t.jsx("button", { className: "danger-text", onClick: ie, children: "清空本页" })
            ] }),
            E.length === 0 ? /* @__PURE__ */ t.jsx("div", { className: "empty", children: "暂无评审意见" }) : /* @__PURE__ */ t.jsx("div", { className: "review-list", children: E.map((n) => /* @__PURE__ */ t.jsxs("div", { className: "review-item", children: [
              /* @__PURE__ */ t.jsxs("div", { className: "review-item-header", children: [
                /* @__PURE__ */ t.jsx("span", { className: "review-item-title", children: n.title }),
                /* @__PURE__ */ t.jsxs("div", { className: "review-item-tags", children: [
                  /* @__PURE__ */ t.jsx("span", { className: `tag ${Tr(n.severity)}`, children: cr(n.severity) }),
                  /* @__PURE__ */ t.jsx("span", { className: "tag info", children: n.type === "element" ? "元素" : "视图" })
                ] })
              ] }),
              /* @__PURE__ */ t.jsx("p", { className: "review-item-target", children: n.type === "element" ? n.elementText || n.selector : `框选 x=${n.viewportRect.x}, y=${n.viewportRect.y}` }),
              /* @__PURE__ */ t.jsx("p", { className: "review-item-suggestion", children: n.suggestion }),
              /* @__PURE__ */ t.jsxs("div", { className: "review-item-meta", children: [
                /* @__PURE__ */ t.jsx("span", { className: "text-muted", children: new Date(n.createdAt).toLocaleString() }),
                /* @__PURE__ */ t.jsxs("div", { className: "review-item-actions", children: [
                  n.status !== "resolved" && /* @__PURE__ */ t.jsx("button", { className: "link primary", onClick: () => qe(n.id), children: "标记解决" }),
                  /* @__PURE__ */ t.jsx("button", { className: "link danger", onClick: () => me(n.id), children: "删除" })
                ] })
              ] })
            ] }, n.id)) })
          ] })
        ] })
      ] })
    ] }),
    document.body
  );
}
function lr(o) {
  return o ? {
    left: o.x + "px",
    top: o.y + "px",
    width: o.width + "px",
    height: o.height + "px"
  } : {};
}
function Nr(o) {
  return o ? {
    left: o.x + "px",
    top: o.y + "px",
    width: o.width + "px",
    height: o.height + "px"
  } : {};
}
function Tr(o) {
  return { low: "info", medium: "warning", high: "danger", critical: "danger" }[o] || "info";
}
function cr(o) {
  return { low: "低", medium: "中", high: "高", critical: "严重" }[o] || o;
}
export {
  kr as ReviewTool,
  kr as default,
  jr as usePageReview
};
