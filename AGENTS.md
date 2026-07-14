# Agent 协作指南

本仓库使用多 agent 并行开发前端原型。任何涉及批量任务、页面评审整改或 OpenSpec 提案实施的工作，必须先读以下文档：

- `docs/page-review-20260714-checklist.md` — 页面评审验证清单
- `docs/agent-implementation-rules.md` — agent 实施规则
- `src/views/ReviewChangeList.jsx`（`/admin/review-change-list`）— 评审变更追踪页面

## 关键原则

1. **build 通过 ≠ 业务正确**：agent 完成后，父 agent 必须按 checklist 逐条复核，不能只看 `npm run build`。
2. **并行必须文件隔离**：共享文件（`Layout.jsx`、`router/index.jsx`、`permissions.js`）由基础设施 agent 最后统一接线。
3. **有页面 ≠ 完成**：必须以验收标准判断角色、状态、数据衔接是否正确。
4. **归档前先验证**：OpenSpec 归档前必须有验证报告。

## 项目结构约定

- `spec/changes/` — 进行中的 OpenSpec 提案
- `spec/archive/` — 已归档提案
- `spec/specs/` — living specifications
- `docs/` — 验证清单和实施规则

## 技术栈

- React 18 + React Router 6 + Ant Design 5
- Vite 构建
- JavaScript（不引入 TypeScript）
- Mock 数据优先，外部服务（短信、CA）只做沙箱/预留接口
