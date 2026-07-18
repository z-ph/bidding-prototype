# Verification: 开发台账移出业务主导航

验证日期：2026-07-18
验证人：父 agent（红线审查）
方式：`pnpm run build` + 5 角色红线脚本全量回归

## 逐任务验收

| 任务 | 结果 | 证据 |
|------|------|------|
| remove-dev-ledger-menu | 通过 | `Layout.jsx` common 组仅余工作台/待办中心；实测五业务角色菜单顶层项：招标人 8、代理 7、投标人 5、专家 5、监督 6，均无评审变更列表/变更时间线；`HistoryOutlined` 无引用已清理（`UnorderedListOutlined` 仍有 3 处业务引用保留）；permissions.js 注释更正为「开发阶段台账，URL 直达」 |
| fix-agents-rule | 通过 | AGENTS.md「全角色菜单可见」错误规则已修正为「开发阶段的台账产物：不得加入任何业务角色的主导航，URL 直达供开发/评审使用」 |
| doc-ledger-version | 通过 | matrix 新增第七节导航归属说明；台账 0718-ux-008；changelog 0.8.0；package.json 0.8.0 |
| regression-verify | 通过 | build ✓（270ms）；全量回归 **145/145**（admin 28 + agent 41 + bidder 26 + expert 24 + supervisor 26），控制台零错误 |

## 红线核对

- 红线 7（菜单从工作流正向推导）：开发台账不属于任何业务角色工作流，移出主导航后各角色菜单全部为业务入口——通过
- 可访问性保留：URL 直达 `/admin/review-change-list`、`/admin/changelog` 正常渲染；门户头部「评审变更」公开入口（`/review-change-list`）不变

## 结论

4 个任务全部完成，同意归档。
