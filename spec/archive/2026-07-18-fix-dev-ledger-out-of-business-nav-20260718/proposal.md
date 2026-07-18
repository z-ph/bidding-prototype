# Proposal: 开发台账移出业务主导航

## Change ID

`fix-dev-ledger-out-of-business-nav-20260718`

## Why

评审变更列表（/admin/review-change-list）与变更时间线（/admin/changelog）是**开发阶段的台账产物**，供开发/评审人员追溯整改记录，不是任何业务角色的工作流环节。但此前被错误地放进 `Layout.jsx` 的 common 菜单组，导致五个业务角色（招标人/代理/投标人/专家/监督）主导航各多出 2 项开发入口——违反 AGENTS.md「禁止把能访问的页面和应该出现在主导航的入口混为一谈」「工作流需要什么入口才放什么菜单项」的原则，且 AGENTS.md 本身还错误记载了「变更时间线全角色菜单可见」的规则，需一并修正。

## What Changes

1. **菜单移除**：`Layout.jsx` common 组移除「评审变更列表」「变更时间线」两项，清理失效图标 import。移除后各业务角色顶层项：招标人 8、代理 7、投标人 5、专家 5、监督 6。
2. **访问保留**：两个页面路由与 `permissions.js` 权限不变（URL 直达可达，供开发/评审使用）；门户头部既有「评审变更」入口（/review-change-list 公开路由）不动。
3. **规则修正**：`AGENTS.md` 中「变更时间线全角色菜单可见」的表述改为「开发阶段产物，不进业务主导航，URL 直达」；「评审变更列表与变更时间线维护」一节同步明确台账页面不进业务菜单。
4. **文档台账**：`role-permission-matrix.md` 补充说明；ReviewChangeList 登记 0718-ux-008；changelog 0.8.0；package.json 0.7.0 → 0.8.0。

## Impact

- **修改文件**：`src/components/Layout.jsx`、`src/config/permissions.js`（仅注释）、`AGENTS.md`、`docs/role-permission-matrix.md`、`src/views/ReviewChangeList.jsx`、`src/data/changelog.js`、`package.json`。
- **不修改**：两个台账页面本体、路由、门户头部入口。

## 状态

- 总体状态：已完成（2026-07-18 验收归档，验收记录见 verification.md）
