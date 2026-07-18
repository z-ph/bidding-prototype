# Verification: 评审台账悬浮入口与 Tab 合并页

验证日期：2026-07-18
验证人：父 agent（红线审查）
方式：`pnpm run build` + 专项实测（`scripts/verify-dev-ledger.mjs`，trace：`review-assets/dev-ledger-trace.zip`）+ 5 角色全量回归

## 实施说明

实施由子代理开工（完成 embedded 签名、两个旧路由 redirect、permissions 挂载点）后因额度中断，父代理接管完成（DevLedgerFab、DevLedger 页面、新路由、__root 挂载、lazy 清理、登记），并修复 Changelog Timeline `items.children` 弃用（改 `content`）。

## 逐任务验收

| 任务 | 结果 | 证据 |
|------|------|------|
| dev-ledger-page | 通过 | `/admin/dev-ledger` 渲染 Tabs，默认评审变更列表（激活 tab 正确、表格渲染、无重复页头 Title）；`?tab=changelog` 深链直接激活变更时间线（v0.9.0 在列）；两组件 embedded 默认 false 行为不变 |
| legacy-route-redirect | 通过 | `/admin/review-change-list` → `/admin/dev-ledger?tab=review`；`/admin/changelog` → `?tab=changelog`；routeTree.gen.ts 无旧 lazy import 残留（grep 0）；公开路由 `/review-change-list` 不受影响 |
| dev-ledger-fab | 通过 | 门户/登录/后台页均可见；点击跳转合并页；拖拽 (1360,748)→(1160,598) 不触发跳转；**刷新后位置保持**；初始位避让 react-page-review 右下按钮 |
| doc-ledger-version | 通过 | AGENTS.md 台账一节、matrix 第七节、台账 0718-ux-009、changelog 0.9.0、package.json 0.9.0 |
| build-verify | 通过 | build ✓（303ms）；routeTree.gen.ts 自动含 admin.dev-ledger |

## 红线核对

- 任何角色主导航未新增台账入口（实测招标人菜单仍 8 项）——通过
- 专项实测 **17/17 通过**，控制台零错误
- 全量回归 **145/145 通过**（admin 28 + agent 41 + bidder 26 + expert 24 + supervisor 26），根布局挂载 Fab 对各角色流程零影响

## 实测脚本修正记录（非产品缺陷）

- 门户裸 URL 缺尾斜杠导致 vite 未正确跳转（脚本 goto 加 `/`）
- 首轮 404/Timeline 警告为 vite 冷启动偶发 + Changelog `items.children` 弃用（已修为 `content`）

## 结论

5 个任务全部完成，同意归档。
