# Proposal: 移除门户头部「评审变更」过渡入口

## Change ID

`fix-remove-portal-review-entry-20260718`

## Why

门户头部「评审变更」按钮（`PortalHeader.jsx:92`）是开发阶段的过渡入口，耦合在业务门面中。全局可拖拽悬浮按钮已成为台账统一入口（所有页面含门户可见），门户按钮冗余且违反「开发台账产物不耦合进业务产物」的口径。`/review-change-list` 公开路由保留（已重定向到 `/dev-ledger?tab=review`，兼容评审报告中的旧链接），仅删除按钮。

## What Changes

1. 删除 `PortalHeader.jsx:92` 的「评审变更」按钮（`navItemClass` 为通用函数，不动）。
2. 登记：matrix 第七节、AGENTS.md 台账一节中门户入口表述更新为「已移除，统一走悬浮按钮」；ReviewChangeList 新增 0718-ux-011；changelog 0.9.2；package.json 0.9.1 → 0.9.2。
3. 验证：门户页面无「评审变更」按钮，悬浮按钮可见且点击正常进入 `/dev-ledger`。

## 状态

- 总体状态：已完成（2026-07-18 验收归档，验收记录见 verification.md）
