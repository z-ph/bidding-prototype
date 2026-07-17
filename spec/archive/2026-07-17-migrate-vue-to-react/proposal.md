# Proposal: Vue 3 迁移至 React 18

## Change ID

`migrate-vue-to-react`

## Why

当前原型使用 Vue 3 + Element Plus 构建，为进一步统一团队技术栈、复用 React 生态组件与工具链，计划将前端迁移至 React 18。

## What Changes

1. **技术栈替换**
   - Vue 3 → React 18
   - Vue Router 5 → React Router 6
   - Element Plus → Ant Design 5
   - Element Plus Icons → Ant Design Icons
   - `@vitejs/plugin-vue` → `@vitejs/plugin-react`

2. **公共基础设施迁移**
   - 路由配置改用 React Router 的 `<Route>`/`<BrowserRouter>`。
   - 权限守卫改为 React Router 的 `loader` 或高阶组件。
   - `Layout.vue` 改为 React 函数组件。
   - `useRole.js` 改为 React Hook。
   - `StatusTag.vue` 等通用组件改为 React 组件。

3. **视图页面分批迁移**
   - 第 1 批：认证相关（Login、Register、Portal、Forbidden、Dashboard）
   - 第 2 批：招标人/招标代理核心流程（ProjectList、ProjectCreate、ProjectTrack、TenderDoc、NoticePublish、OpeningHall、EvaluationHall 等）
   - 第 3 批：投标人流程（BidderProjects、BidRegister、BidPayment、BidDownload、BidQuote、BidUpload、BidderInvoices、SupplierProfile）
   - 第 4 批：专家/监督/管理流程（ExpertProject、ExpertProfile、SupervisorHall、AdminDashboard 等）

4. **构建与验证**
   - 更新 `vite.config.js`、`package.json`。
   - 删除 Vue 依赖与源码。
   - 运行 `npm run build` 与页面抽查。

## Impact

- **删除**：Vue 源码、Element Plus 依赖、Vue Router。
- **新增**：React 源码、Ant Design 依赖、React Router。
- **URL 与业务逻辑**：保持不变。
- **视觉风格**：基于 Ant Design，尽量还原现有布局与交互。

## Migration Scope

- 仅迁移 `src/` 目录下的 Vue 应用代码。
- `packages/`、`review-assets/`、`docs/`、`public/` 不迁移。
- 不引入 TypeScript（保持 JavaScript）。
- 不新增业务功能，仅做技术栈替换。

## 状态（2026-07-17 实施完成）

- 总体状态：已完成（代码核实，评审变更页面无对应条目）
- 任务统计：7 任务 — 7 已修复 / 0 部分修复 / 0 未修复 / 0 待确认 / 0 未跟踪
- 依据：2026-07-17 代码核实通过：全库无 .vue 文件、无 vue/element-plus 依赖
