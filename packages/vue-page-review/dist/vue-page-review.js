import { ref as _, computed as z, onMounted as Je, onUnmounted as be, nextTick as Fe, watch as Ae, resolveComponent as h, openBlock as $, createBlock as W, Teleport as Ke, createElementBlock as M, createElementVNode as m, withModifiers as He, normalizeStyle as G, normalizeClass as qe, createVNode as r, withCtx as n, createTextVNode as v, unref as j, toDisplayString as g, createCommentVNode as I, Fragment as We, renderList as Ge } from "vue";
import { ElMessageBox as ke } from "element-plus";
function Qe(d = {}) {
  const {
    storageKey: C = "page-reviews",
    defaultPagePath: y = () => typeof window < "u" ? window.location.pathname + window.location.search : "/"
  } = d;
  function p() {
    return "rv-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
  }
  function b() {
    if (typeof window > "u") return [];
    try {
      const l = window.localStorage.getItem(C);
      return l ? JSON.parse(l) : [];
    } catch {
      return [];
    }
  }
  function R(l) {
    if (!(typeof window > "u"))
      try {
        window.localStorage.setItem(C, JSON.stringify(l));
      } catch {
      }
  }
  const s = _(b()), Z = z(() => s.value);
  function J(l) {
    const f = l || y();
    return s.value.filter((w) => w.pagePath === f);
  }
  function F(l) {
    const f = {
      id: p(),
      ...l,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    return s.value.unshift(f), R(s.value), f;
  }
  function A(l, f) {
    const w = s.value.findIndex((U) => U.id === l);
    w > -1 && (s.value[w] = { ...s.value[w], ...f }, R(s.value));
  }
  function K(l) {
    s.value = s.value.filter((f) => f.id !== l), R(s.value);
  }
  function B(l) {
    const f = l || y();
    s.value = s.value.filter((w) => w.pagePath !== f), R(s.value);
  }
  function D() {
    s.value = [], R(s.value);
  }
  function V() {
    const l = {
      exportTime: (/* @__PURE__ */ new Date()).toISOString(),
      total: s.value.length,
      reviews: s.value
    };
    Re(
      new Blob([JSON.stringify(l, null, 2)], { type: "application/json" }),
      `page-reviews-${$e()}.json`
    );
  }
  function S() {
    const l = [
      "# 页面评审报告",
      "",
      `导出时间：${(/* @__PURE__ */ new Date()).toLocaleString()}`,
      `评审总数：${s.value.length}`,
      ""
    ], f = et(s.value, "pagePath");
    Object.entries(f).forEach(([w, U]) => {
      l.push(`## 页面：${w}`), l.push(""), U.forEach((u, k) => {
        var N, T;
        l.push(`### ${k + 1}. ${u.title || "未命名评审"}`), l.push(`- **类型**：${u.type === "element" ? "元素评审" : "视图范围评审"}`), l.push(`- **严重等级**：${Ze(u.severity)}`), l.push(`- **状态**：${u.status === "resolved" ? "已解决" : "待处理"}`), l.push(`- **窗口尺寸**：${(N = u.viewport) == null ? void 0 : N.width} × ${(T = u.viewport) == null ? void 0 : T.height}`), u.scroll && l.push(`- **滚动位置**：x=${u.scroll.x}, y=${u.scroll.y}`), u.type === "element" && u.elementRect ? (l.push(`- **元素选择器**：\`${u.selector}\``), l.push(`- **元素位置**：x=${u.elementRect.x}, y=${u.elementRect.y}, width=${u.elementRect.width}, height=${u.elementRect.height}`), u.elementText && l.push(`- **元素文本**：${u.elementText}`)) : u.viewportRect && l.push(`- **框选范围**：x=${u.viewportRect.x}, y=${u.viewportRect.y}, width=${u.viewportRect.width}, height=${u.viewportRect.height}`), l.push(`- **评审建议**：${u.suggestion}`), l.push(`- **创建时间**：${new Date(u.createdAt).toLocaleString()}`), l.push("");
      });
    }), Re(
      new Blob([l.join(`
`)], { type: "text/markdown" }),
      `page-reviews-${$e()}.md`
    );
  }
  return {
    reviews: s,
    allReviews: Z,
    getPageReviews: J,
    addReview: F,
    updateReview: A,
    deleteReview: K,
    clearPageReviews: B,
    clearAllReviews: D,
    exportToJSON: V,
    exportToMarkdown: S
  };
}
function Re(d, C) {
  if (typeof window > "u") return;
  const y = URL.createObjectURL(d), p = document.createElement("a");
  p.href = y, p.download = C, document.body.appendChild(p), p.click(), document.body.removeChild(p), URL.revokeObjectURL(y);
}
function $e() {
  const d = /* @__PURE__ */ new Date();
  return `${d.getFullYear()}${Q(d.getMonth() + 1)}${Q(d.getDate())}-${Q(d.getHours())}${Q(d.getMinutes())}`;
}
function Q(d) {
  return String(d).padStart(2, "0");
}
function Ze(d) {
  return { low: "低", medium: "中", high: "高", critical: "严重" }[d] || d;
}
function et(d, C) {
  return d.reduce((y, p) => {
    const b = p[C] || "unknown";
    return y[b] || (y[b] = []), y[b].push(p), y;
  }, {});
}
const tt = (d, C) => {
  const y = d.__vccOpts || d;
  for (const [p, b] of C)
    y[p] = b;
  return y;
}, lt = { class: "toolbar-left" }, ot = { class: "toolbar-right" }, nt = { class: "highlight-label" }, at = { class: "highlight-label" }, it = { class: "review-target-info" }, rt = {
  key: 0,
  class: "target-desc"
}, ut = {
  key: 1,
  class: "target-desc"
}, st = { class: "text-muted" }, dt = { class: "text-muted" }, vt = { class: "review-list-actions" }, ct = {
  key: 1,
  class: "review-list"
}, pt = { class: "review-item-header" }, mt = { class: "review-item-title" }, gt = { class: "review-item-tags" }, ft = { class: "review-item-target" }, wt = { class: "review-item-suggestion" }, ht = { class: "review-item-meta" }, yt = { class: "text-muted" }, xt = { class: "review-item-actions" }, _t = {
  __name: "ReviewTool",
  props: {
    active: { type: Boolean, default: !1 },
    pagePath: { type: String, default: "" },
    pageName: { type: String, default: "" },
    storageKey: { type: String, default: "page-reviews" }
  },
  emits: ["update:active", "add", "update", "delete", "clear", "export"],
  setup(d, { expose: C, emit: y }) {
    const p = d, b = y, R = z(() => p.pagePath || (typeof window < "u" ? window.location.pathname + window.location.search : "/")), { reviews: s, getPageReviews: Z, addReview: J, updateReview: F, deleteReview: A, clearPageReviews: K, exportToJSON: B, exportToMarkdown: D } = Qe({
      storageKey: p.storageKey,
      defaultPagePath: () => R.value
    }), V = z(() => Z(R.value)), S = _("element"), l = _(!1), f = _(!1), w = _(null), U = _(""), u = _(null), k = _(null), N = _(!1), T = _({ x: 0, y: 0 }), H = _({ x: 0, y: 0 }), E = _(!1), ee = _({ x: 0, y: 0 }), a = _({
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
    }), oe = z(() => a.value.title.trim() && a.value.suggestion.trim()), Ce = z(() => {
      if (!k.value) return {};
      const t = k.value;
      return {
        left: t.x + "px",
        top: t.y + "px",
        width: t.width + "px",
        height: t.height + "px"
      };
    }), Se = z(() => {
      const { x: t, y: e } = H.value;
      return {
        transform: `translate(calc(-50% + ${t}px), ${e}px)`
      };
    });
    function ne(t) {
      return t ? {
        left: t.x + "px",
        top: t.y + "px",
        width: t.width + "px",
        height: t.height + "px"
      } : {};
    }
    function Te(t) {
      return { low: "info", medium: "warning", high: "danger", critical: "danger" }[t] || "info";
    }
    function Le(t) {
      return { low: "低", medium: "中", high: "高", critical: "严重" }[t] || t;
    }
    function Ne() {
      return {
        viewport: { width: window.innerWidth, height: window.innerHeight },
        scroll: { x: window.scrollX, y: window.scrollY },
        pagePath: R.value,
        pageUrl: window.location.href,
        pageName: p.pageName || R.value
      };
    }
    function Ee(t) {
      var x;
      if (t.id) return "#" + t.id;
      if (t.className) {
        const c = String(t.className).split(/\s+/).filter((P) => P && !P.startsWith("el-")).slice(0, 2);
        if (c.length) return t.tagName.toLowerCase() + "." + c.join(".");
      }
      let e = [], i = t;
      for (; i && i !== document.body; ) {
        let c = i.tagName.toLowerCase();
        if (i.id) {
          c += "#" + i.id, e.unshift(c);
          break;
        }
        const Y = Array.from(((x = i.parentNode) == null ? void 0 : x.children) || []).filter((X) => X.tagName === i.tagName);
        if (Y.length > 1) {
          const X = Y.indexOf(i) + 1;
          c += `:nth-of-type(${X})`;
        }
        e.unshift(c), i = i.parentNode;
      }
      return e.join(" > ");
    }
    function ae(t) {
      const e = document.elementFromPoint(t.clientX, t.clientY);
      return !e || e.closest(".review-overlay") ? null : e;
    }
    function ie(t) {
      if (E.value || S.value !== "element" || l.value || N.value) return;
      const e = ae(t);
      if (!e) {
        w.value = null;
        return;
      }
      const i = e.getBoundingClientRect();
      w.value = {
        x: i.left + window.scrollX,
        y: i.top + window.scrollY,
        width: i.width,
        height: i.height
      }, U.value = e.tagName.toLowerCase();
    }
    function re() {
      w.value = null;
    }
    function ue(t) {
      var x;
      if (S.value !== "element" || l.value || N.value) return;
      const e = ae(t);
      if (!e) return;
      t.preventDefault(), t.stopPropagation();
      const i = e.getBoundingClientRect();
      u.value = {
        el: e,
        selector: Ee(e),
        tag: e.tagName.toLowerCase(),
        text: ((x = e.innerText) == null ? void 0 : x.slice(0, 40)) || "",
        rect: {
          x: i.left + window.scrollX,
          y: i.top + window.scrollY,
          width: i.width,
          height: i.height
        }
      }, me("element");
    }
    function se(t) {
      E.value || S.value !== "viewport" || l.value || (N.value = !0, T.value = { x: t.clientX + window.scrollX, y: t.clientY + window.scrollY }, k.value = { x: T.value.x, y: T.value.y, width: 0, height: 0 });
    }
    function de(t) {
      if (E.value || !N.value) return;
      const e = t.clientX + window.scrollX, i = t.clientY + window.scrollY;
      k.value = {
        x: Math.min(T.value.x, e),
        y: Math.min(T.value.y, i),
        width: Math.abs(e - T.value.x),
        height: Math.abs(i - T.value.y)
      };
    }
    function ve(t) {
      if (E.value) {
        E.value = !1;
        return;
      }
      N.value && (N.value = !1, k.value && k.value.width > 10 && k.value.height > 10 && me("viewport", { ...k.value }), k.value = null);
    }
    function Pe(t) {
      var i, x;
      ((i = t.target.classList) != null && i.contains("toolbar-title") || (x = t.target.classList) != null && x.contains("review-toolbar")) && (E.value = !0, ee.value = {
        x: t.clientX - H.value.x,
        y: t.clientY - H.value.y
      });
    }
    function ce(t) {
      E.value && (H.value = {
        x: t.clientX - ee.value.x,
        y: t.clientY - ee.value.y
      });
    }
    function pe(t) {
      t.key === "Escape" && (l.value ? l.value = !1 : fe());
    }
    function Me() {
    }
    function me(t, e = null) {
      var x, c, P;
      const i = Ne();
      a.value = {
        type: t,
        title: "",
        severity: "medium",
        suggestion: "",
        selector: ((x = u.value) == null ? void 0 : x.selector) || "",
        elementText: ((c = u.value) == null ? void 0 : c.text) || "",
        elementRect: ((P = u.value) == null ? void 0 : P.rect) || null,
        viewportRect: e,
        viewport: i.viewport,
        scroll: i.scroll,
        pagePath: i.pagePath,
        pageUrl: i.pageUrl,
        pageName: i.pageName
      }, l.value = !0;
    }
    function ge() {
      u.value = null, k.value = null, a.value = {
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
      };
    }
    function Ve() {
      if (!oe.value) return;
      const t = J({
        type: a.value.type,
        title: a.value.title.trim(),
        severity: a.value.severity,
        suggestion: a.value.suggestion.trim(),
        selector: a.value.selector,
        elementText: a.value.elementText,
        elementRect: a.value.elementRect,
        viewportRect: a.value.viewportRect,
        viewport: a.value.viewport,
        scroll: a.value.scroll,
        pagePath: a.value.pagePath,
        pageUrl: a.value.pageUrl,
        pageName: a.value.pageName,
        status: "open"
      });
      l.value = !1, b("add", t);
    }
    function De(t) {
      F(t, { status: "resolved" }), b("update", { id: t, status: "resolved" });
    }
    function Ue(t) {
      ke.confirm("确定删除这条评审意见吗？", "删除确认", {
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        A(t), b("delete", { id: t });
      });
    }
    function Oe() {
      V.value.length !== 0 && ke.confirm("确定清空当前页面的所有评审意见吗？", "清空确认", {
        confirmButtonText: "清空",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        K(R.value), b("clear", { pagePath: R.value });
      });
    }
    function fe() {
      b("update:active", !1);
    }
    function we() {
      document.addEventListener("mousemove", ie), document.addEventListener("mouseout", re), document.addEventListener("click", ue, !0), document.addEventListener("mousedown", se), document.addEventListener("mousemove", de), document.addEventListener("mousemove", ce), document.addEventListener("mouseup", ve), document.addEventListener("keydown", pe);
    }
    function he() {
      document.removeEventListener("mousemove", ie), document.removeEventListener("mouseout", re), document.removeEventListener("click", ue, !0), document.removeEventListener("mousedown", se), document.removeEventListener("mousemove", de), document.removeEventListener("mousemove", ce), document.removeEventListener("mouseup", ve), document.removeEventListener("keydown", pe);
    }
    Je(() => {
      p.active && we();
    }), be(() => {
      he();
    });
    let te = null;
    return Fe(() => {
      te = Ae(() => p.active, (t) => {
        t ? (we(), S.value = "element") : (he(), ge(), w.value = null, f.value = !1);
      });
    }), be(() => {
      te && te();
    }), C({
      reviews: s,
      pageReviews: V,
      addReview: J,
      updateReview: F,
      deleteReview: A,
      clearPageReviews: K,
      exportToJSON: B,
      exportToMarkdown: D
    }), (t, e) => {
      const i = h("el-radio-button"), x = h("el-radio-group"), c = h("el-button"), P = h("el-badge"), Y = h("el-dropdown-item"), X = h("el-dropdown-menu"), ze = h("el-dropdown"), le = h("el-tag"), O = h("el-form-item"), ye = h("el-input"), q = h("el-radio"), Be = h("el-form"), Ye = h("el-dialog"), Xe = h("el-empty"), je = h("el-card"), Ie = h("el-drawer");
      return $(), W(Ke, { to: "body" }, [
        d.active ? ($(), M("div", {
          key: 0,
          class: "review-overlay",
          onClick: Me
        }, [
          m("div", {
            class: qe(["review-toolbar", { "is-dragging": E.value }]),
            style: G(Se.value),
            onClick: e[2] || (e[2] = He(() => {
            }, ["stop"])),
            onMousedown: Pe
          }, [
            m("div", lt, [
              e[11] || (e[11] = m("span", {
                class: "toolbar-title",
                title: "按住此处可拖动"
              }, "页面评审模式", -1)),
              r(x, {
                modelValue: S.value,
                "onUpdate:modelValue": e[0] || (e[0] = (o) => S.value = o),
                size: "small"
              }, {
                default: n(() => [
                  r(i, { label: "element" }, {
                    default: n(() => [...e[9] || (e[9] = [
                      v("选择元素", -1)
                    ])]),
                    _: 1
                  }),
                  r(i, { label: "viewport" }, {
                    default: n(() => [...e[10] || (e[10] = [
                      v("框定视图", -1)
                    ])]),
                    _: 1
                  })
                ]),
                _: 1
              }, 8, ["modelValue"])
            ]),
            m("div", ot, [
              r(P, {
                value: V.value.length,
                class: "review-badge"
              }, {
                default: n(() => [
                  r(c, {
                    size: "small",
                    onClick: e[1] || (e[1] = (o) => f.value = !0)
                  }, {
                    default: n(() => [...e[12] || (e[12] = [
                      v("评审列表", -1)
                    ])]),
                    _: 1
                  })
                ]),
                _: 1
              }, 8, ["value"]),
              r(ze, {
                size: "small",
                "split-button": "",
                type: "primary",
                onClick: j(D)
              }, {
                dropdown: n(() => [
                  r(X, null, {
                    default: n(() => [
                      r(Y, { onClick: j(D) }, {
                        default: n(() => [...e[13] || (e[13] = [
                          v("导出为 Markdown", -1)
                        ])]),
                        _: 1
                      }, 8, ["onClick"]),
                      r(Y, { onClick: j(B) }, {
                        default: n(() => [...e[14] || (e[14] = [
                          v("导出为 JSON", -1)
                        ])]),
                        _: 1
                      }, 8, ["onClick"])
                    ]),
                    _: 1
                  })
                ]),
                default: n(() => [
                  e[15] || (e[15] = v(" 导出 ", -1))
                ]),
                _: 1
              }, 8, ["onClick"]),
              r(c, {
                size: "small",
                type: "danger",
                onClick: fe
              }, {
                default: n(() => [...e[16] || (e[16] = [
                  v("退出评审", -1)
                ])]),
                _: 1
              })
            ])
          ], 38),
          w.value && S.value === "element" && !l.value ? ($(), M("div", {
            key: 0,
            class: "highlight-box hover-box",
            style: G(ne(w.value))
          }, [
            m("span", nt, g(U.value), 1)
          ], 4)) : I("", !0),
          u.value && S.value === "element" && !l.value ? ($(), M("div", {
            key: 1,
            class: "highlight-box selected-box",
            style: G(ne(u.value.rect))
          }, [
            m("span", at, "已选：" + g(u.value.tag), 1)
          ], 4)) : I("", !0),
          k.value ? ($(), M("div", {
            key: 2,
            class: "drag-rect",
            style: G(Ce.value)
          }, null, 4)) : I("", !0),
          r(Ye, {
            modelValue: l.value,
            "onUpdate:modelValue": e[7] || (e[7] = (o) => l.value = o),
            title: "添加评审意见",
            width: "520px",
            "close-on-click-modal": !1,
            onClosed: ge
          }, {
            footer: n(() => [
              r(c, {
                onClick: e[6] || (e[6] = (o) => l.value = !1)
              }, {
                default: n(() => [...e[21] || (e[21] = [
                  v("取消", -1)
                ])]),
                _: 1
              }),
              r(c, {
                type: "primary",
                disabled: !oe.value,
                onClick: Ve
              }, {
                default: n(() => [...e[22] || (e[22] = [
                  v("保存评审", -1)
                ])]),
                _: 1
              }, 8, ["disabled"])
            ]),
            default: n(() => [
              r(Be, {
                model: a.value,
                "label-width": "80px"
              }, {
                default: n(() => [
                  r(O, { label: "评审位置" }, {
                    default: n(() => {
                      var o, L, xe, _e;
                      return [
                        m("div", it, [
                          r(le, { size: "small" }, {
                            default: n(() => [
                              v(g(a.value.type === "element" ? "元素" : "视图范围"), 1)
                            ]),
                            _: 1
                          }),
                          a.value.type === "element" ? ($(), M("span", rt, g(a.value.elementText || a.value.selector), 1)) : ($(), M("span", ut, " 框选区域 x=" + g((o = a.value.viewportRect) == null ? void 0 : o.x) + ", y=" + g((L = a.value.viewportRect) == null ? void 0 : L.y) + ", w=" + g((xe = a.value.viewportRect) == null ? void 0 : xe.width) + ", h=" + g((_e = a.value.viewportRect) == null ? void 0 : _e.height), 1))
                        ])
                      ];
                    }),
                    _: 1
                  }),
                  r(O, { label: "窗口尺寸" }, {
                    default: n(() => {
                      var o, L;
                      return [
                        m("span", st, g((o = a.value.viewport) == null ? void 0 : o.width) + " × " + g((L = a.value.viewport) == null ? void 0 : L.height), 1)
                      ];
                    }),
                    _: 1
                  }),
                  r(O, { label: "滚动位置" }, {
                    default: n(() => {
                      var o, L;
                      return [
                        m("span", dt, "x=" + g((o = a.value.scroll) == null ? void 0 : o.x) + ", y=" + g((L = a.value.scroll) == null ? void 0 : L.y), 1)
                      ];
                    }),
                    _: 1
                  }),
                  r(O, {
                    label: "标题",
                    required: ""
                  }, {
                    default: n(() => [
                      r(ye, {
                        modelValue: a.value.title,
                        "onUpdate:modelValue": e[3] || (e[3] = (o) => a.value.title = o),
                        placeholder: "例如：按钮样式不统一"
                      }, null, 8, ["modelValue"])
                    ]),
                    _: 1
                  }),
                  r(O, {
                    label: "严重等级",
                    required: ""
                  }, {
                    default: n(() => [
                      r(x, {
                        modelValue: a.value.severity,
                        "onUpdate:modelValue": e[4] || (e[4] = (o) => a.value.severity = o)
                      }, {
                        default: n(() => [
                          r(q, { label: "low" }, {
                            default: n(() => [...e[17] || (e[17] = [
                              v("低", -1)
                            ])]),
                            _: 1
                          }),
                          r(q, { label: "medium" }, {
                            default: n(() => [...e[18] || (e[18] = [
                              v("中", -1)
                            ])]),
                            _: 1
                          }),
                          r(q, { label: "high" }, {
                            default: n(() => [...e[19] || (e[19] = [
                              v("高", -1)
                            ])]),
                            _: 1
                          }),
                          r(q, { label: "critical" }, {
                            default: n(() => [...e[20] || (e[20] = [
                              v("严重", -1)
                            ])]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }, 8, ["modelValue"])
                    ]),
                    _: 1
                  }),
                  r(O, {
                    label: "评审建议",
                    required: ""
                  }, {
                    default: n(() => [
                      r(ye, {
                        modelValue: a.value.suggestion,
                        "onUpdate:modelValue": e[5] || (e[5] = (o) => a.value.suggestion = o),
                        type: "textarea",
                        rows: 4,
                        placeholder: "描述问题现象、影响和改进建议"
                      }, null, 8, ["modelValue"])
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }, 8, ["model"])
            ]),
            _: 1
          }, 8, ["modelValue"]),
          r(Ie, {
            modelValue: f.value,
            "onUpdate:modelValue": e[8] || (e[8] = (o) => f.value = o),
            title: "当前页面评审意见",
            size: "480px",
            "with-header": !0
          }, {
            default: n(() => [
              m("div", vt, [
                r(c, {
                  size: "small",
                  type: "primary",
                  onClick: j(D)
                }, {
                  default: n(() => [...e[23] || (e[23] = [
                    v("导出 Markdown", -1)
                  ])]),
                  _: 1
                }, 8, ["onClick"]),
                r(c, {
                  size: "small",
                  onClick: j(B)
                }, {
                  default: n(() => [...e[24] || (e[24] = [
                    v("导出 JSON", -1)
                  ])]),
                  _: 1
                }, 8, ["onClick"]),
                r(c, {
                  size: "small",
                  type: "danger",
                  text: "",
                  onClick: Oe
                }, {
                  default: n(() => [...e[25] || (e[25] = [
                    v("清空本页", -1)
                  ])]),
                  _: 1
                })
              ]),
              V.value.length === 0 ? ($(), W(Xe, {
                key: 0,
                description: "暂无评审意见"
              })) : ($(), M("div", ct, [
                ($(!0), M(We, null, Ge(V.value, (o) => ($(), W(je, {
                  key: o.id,
                  class: "review-item",
                  shadow: "never"
                }, {
                  default: n(() => [
                    m("div", pt, [
                      m("span", mt, g(o.title), 1),
                      m("div", gt, [
                        r(le, {
                          size: "small",
                          type: Te(o.severity)
                        }, {
                          default: n(() => [
                            v(g(Le(o.severity)), 1)
                          ]),
                          _: 2
                        }, 1032, ["type"]),
                        r(le, {
                          size: "small",
                          type: "info"
                        }, {
                          default: n(() => [
                            v(g(o.type === "element" ? "元素" : "视图"), 1)
                          ]),
                          _: 2
                        }, 1024)
                      ])
                    ]),
                    m("p", ft, g(o.type === "element" ? o.elementText || o.selector : `框选 x=${o.viewportRect.x}, y=${o.viewportRect.y}`), 1),
                    m("p", wt, g(o.suggestion), 1),
                    m("div", ht, [
                      m("span", yt, g(new Date(o.createdAt).toLocaleString()), 1),
                      m("div", xt, [
                        o.status !== "resolved" ? ($(), W(c, {
                          key: 0,
                          link: "",
                          type: "primary",
                          size: "small",
                          onClick: (L) => De(o.id)
                        }, {
                          default: n(() => [...e[26] || (e[26] = [
                            v("标记解决", -1)
                          ])]),
                          _: 1
                        }, 8, ["onClick"])) : I("", !0),
                        r(c, {
                          link: "",
                          type: "danger",
                          size: "small",
                          onClick: (L) => Ue(o.id)
                        }, {
                          default: n(() => [...e[27] || (e[27] = [
                            v("删除", -1)
                          ])]),
                          _: 1
                        }, 8, ["onClick"])
                      ])
                    ])
                  ]),
                  _: 2
                }, 1024))), 128))
              ]))
            ]),
            _: 1
          }, 8, ["modelValue"])
        ])) : I("", !0)
      ]);
    };
  }
}, Rt = /* @__PURE__ */ tt(_t, [["__scopeId", "data-v-89d72843"]]);
export {
  Rt as ReviewTool,
  Rt as default,
  Qe as usePageReview
};
