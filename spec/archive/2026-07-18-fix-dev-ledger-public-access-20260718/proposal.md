# Proposal: 评审台账合并页改公开路由（修复未登录 Forbidden）

## Change ID

`fix-dev-ledger-public-access-20260718`

## Why

`feat-dev-ledger-fab-20260718` 把合并页放在 `/admin/dev-ledger`（/admin 布局下）。`/admin` 布局的 beforeLoad 权限校验（`src/routes/admin.jsx:7-12`）对未登录用户（role=''）一律 redirect 到 `/admin/forbidden`——导致**未登录点击悬浮按钮直接看到「无权限」页**，与「全局可见、点击打开」的需求语义矛盾。评审台账是开发/评审工具，数据全在前端，无登录态依赖，应当公开可访问（与既有公开路由 `/review-change-list` 同模式）。这是上一提案验收时的测试盲区（只测了登录后点击，未测未登录点击）。

## What Changes

1. **合并页改公开路由**：新增 `/dev-ledger`（`src/routes/dev-ledger.jsx` + `.lazy.jsx`，__root 直下，不经 /admin 布局、无权限拦截）；`DevLedger.jsx` 页面加简单头部（标题「评审台账」+ 返回按钮 `history.back()`），公开场景无侧边栏时可读可返回。
2. **入口与旧路由统一改目标**：DevLedgerFab 点击改跳 `/dev-ledger`；`/admin/dev-ledger` → redirect `/dev-ledger`；`/admin/review-change-list` → redirect `/dev-ledger?tab=review`；`/admin/changelog` → redirect `/dev-ledger?tab=changelog`；公开路由 `/review-change-list` → redirect `/dev-ledger?tab=review`（门户「评审变更」按钮随之统一到合并页）。
3. **权限清理**：`permissions.js` 删除 `/admin/dev-ledger` 权限项（路由已 redirect，公开页无需权限）；保留 `/admin/review-change-list`、`/admin/changelog` 两行（已登录全角色可经 redirect 通过布局校验）。
4. **登记**：ReviewChangeList 新增 0718-ux-010；changelog 0.9.1；package.json 0.9.0 → 0.9.1；AGENTS.md 与 matrix 第七节的入口路径更新为 `/dev-ledger`。

## Impact

- **新增文件**：`src/routes/dev-ledger.jsx`、`src/routes/dev-ledger.lazy.jsx`。
- **修改文件**：`src/views/DevLedger.jsx`、`src/components/DevLedgerFab.jsx`、三个 /admin 台账路由（redirect 目标）、`src/routes/review-change-list.jsx`（改 redirect）、`src/config/permissions.js`、AGENTS.md、`docs/role-permission-matrix.md`、`src/views/ReviewChangeList.jsx`、`src/data/changelog.js`、`package.json`。
- **验证更新**：`scripts/verify-dev-ledger.mjs` 路径断言全部改为 `/dev-ledger`，并新增**未登录点击**场景。

## 状态

- 总体状态：已完成（2026-07-18 验收归档，验收记录见 verification.md）
