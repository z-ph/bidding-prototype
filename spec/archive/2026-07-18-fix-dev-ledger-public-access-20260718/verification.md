# Verification: 评审台账合并页改公开路由

验证日期：2026-07-18
验证人：父 agent（红线审查）
方式：`pnpm run build` + 专项实测（`scripts/verify-dev-ledger.mjs`，trace：`review-assets/dev-ledger-trace.zip`）+ 5 角色全量回归

## 根因复盘

`feat(p7)` 把合并页放在 `/admin/dev-ledger`，`/admin` 布局 beforeLoad（`src/routes/admin.jsx:7-12`）对未登录用户（role=''）一律 redirect 到 `/admin/forbidden`——未登录点击悬浮按钮直接看到「无权限访问」页。验收盲区：feat(p7) 实测只覆盖登录后点击，未覆盖未登录场景。用户实测发现。

## 逐任务验收

| 任务 | 结果 | 证据 |
|------|------|------|
| public-dev-ledger-route | 通过 | `/dev-ledger` 公开路由（__root 直下）；实测**未登录**点击悬浮按钮直达合并页、无 `.forbidden-page`、渲染评审变更列表、含「评审台账」标题与「返回」按钮 |
| entries-and-redirects | 通过 | Fab/四个旧路由全部落到 `/dev-ledger` 对应 tab（含公开旧路由 `/review-change-list`）；死 lazy 文件已删，routeTree.gen.ts 无残留；permissions.js 删 `/admin/dev-ledger` 项 |
| doc-ledger-version | 通过 | AGENTS.md、matrix 第七节（含 0718-ux-010 修正备注）、台账、changelog 0.9.1、package.json 0.9.1 |
| regression-verify | 通过 | 专项 **19/19**（新增未登录点击、未登录深链、公开旧路由重定向 3 个场景）；全量回归 **145/145**；控制台零错误 |

## 实测断言修正记录（非产品缺陷）

首版断言用全文匹配「无权限」误报——台账条目正文含该词；改为检查 `.forbidden-page` class 与完整标题「无权限访问」。

## 结论

4 个任务全部完成，同意归档。
