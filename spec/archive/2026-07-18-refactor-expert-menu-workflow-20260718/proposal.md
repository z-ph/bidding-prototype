# Proposal: 评标专家交互范式重构（双任务入口合并）

## Change ID

`refactor-expert-menu-workflow-20260718`

## Why

对照 `docs/role-permission-matrix.md` 2.4 节与 AGENTS.md 红线 2（同一角色不得存在名称不同但职责重叠的入口）：

1. **双"任务"入口困惑**：菜单同时存在「我的任务」（ExpertTasks）与「评标任务」（ExpertProject）。两者名称近似，但专家无法分辨该进哪个。
2. **职责表面重叠、数据一真一假**：ExpertTasks 是 expertStore 真实驱动的邀请确认列表（确认/拒绝/进入评标，链路完整，`ExpertTasks.jsx:73` 已带 projectId 跳详情）；ExpertProject 无 projectId 态渲染的 ProjectTaskList 是页面内硬编码 mock 列表（`ExpertProject.jsx:33-38` evaluationProjects），与 ExpertTasks 职责重复且数据为假。
3. **工作流断点**：专家真实工作流是「收到抽取邀请 → 确认/拒绝 → 进入项目评分 → 提交」。入口应只有一个「我的评标任务」，评分详情从任务列表带 projectId 进入。

## What Changes

1. **菜单合并**：`Layout.jsx` expertMenus 从 4 项减为 3 项——我的评标任务（/admin/expert-tasks）、专家信息、消息中心（common 组不变，顶层合计 7 项）。移除「评标任务」菜单项（/admin/expert-project 路由与权限保留，作为评分详情页）。
2. **ExpertProject 统一入口**：无 projectId 时不再渲染 mock ProjectTaskList，改为 `<Navigate to="/admin/expert-tasks" replace />` 重定向到真实任务列表；删除 ProjectTaskList 组件与 evaluationProjects 常量列表（`PROJECT_INFO` 兜底映射保留——EvaluationDetail 显示项目名/编号依赖它）；EvaluationDetail 的 onBack 从跳 /admin/expert-project 改为跳 /admin/expert-tasks；清理随之失效的 import。
3. **工作台跳转对齐**：`Dashboard.jsx` expert 分支的「开始评标」「进入评标大厅」按钮目标从 /admin/expert-project 改为 /admin/expert-tasks（原目标会重定向，直跳更干净）；工作台表格内容不动。

## Impact

- **修改文件**：`src/components/Layout.jsx`、`src/views/ExpertProject.jsx`、`src/views/Dashboard.jsx`（仅 expert 分支跳转）。
- **不修改**：路由文件、`src/config/permissions.js`、ExpertTasks.jsx（链路已完整）、evaluationStore/expertStore。
- **文档台账**：`docs/role-permission-matrix.md` 2.4 节、`src/views/ReviewChangeList.jsx`、`src/data/changelog.js`、`package.json` version（0.5.0 → 0.6.0）。

## Out of Scope

- EvaluationDetail 评分页内部交互（打分表、组长推选、报告签署）。
- ExpertTasks 列表列结构。
- 其他角色菜单。

## 依赖

- `docs/role-permission-matrix.md` 2.4 节：合并为单一入口「我的评标任务」。
- `spec/archive/2026-07-18-refactor-bidder-menu-workflow-20260718`：菜单收敛 + 详情页深链保留的同款模式。

## 状态

- 总体状态：已完成（2026-07-18 验收归档，验收记录见 verification.md）
