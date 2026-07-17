# Agent 协作指南

本仓库使用多 agent 并行开发前端原型。任何涉及批量任务、页面评审整改或 OpenSpec 提案实施的工作，必须先读以下文档：

- `docs/page-review-20260714-checklist.md` — 页面评审验证清单
- `docs/agent-implementation-rules.md` — agent 实施规则
- `src/views/ReviewChangeList.jsx`（`/admin/review-change-list`）— 评审变更追踪页面

## 关键原则

1. **build 通过 ≠ 业务正确**：agent 完成后，父 agent 必须按 checklist 逐条复核，不能只看 `npm run build`。
2. **并行必须文件隔离**：共享文件（`Layout.jsx`、`src/routes/admin.jsx`、`src/routes/__root.jsx`、`permissions.js`、自动生成的 `routeTree.gen.ts`）由基础设施 agent 最后统一接线。
3. **有页面 ≠ 完成**：必须以验收标准判断角色、状态、数据衔接是否正确。
4. **归档前先验证**：OpenSpec 归档前必须有验证报告。

## 项目结构约定

- `spec/changes/` — 进行中的 OpenSpec 提案
- `spec/archive/` — 已归档提案
- `spec/specs/` — living specifications
- `docs/` — 验证清单和实施规则
- `review-inputs/` — 用户放入根目录的评审文件（zip/md 等），agent 提案并实施完成后统一归纳到此目录；该目录已在 `.gitignore` 中，不进入版本库

## 技术栈

- React 19 + TanStack Router（文件路由） + Ant Design 6
- Vite 构建
- JavaScript（不引入 TypeScript）
- Mock 数据优先，外部服务（短信、CA）只做沙箱/预留接口

## 版本信息维护

页面评审导出报告会通过 `src/App.jsx` 的 `reportInfo` 自动注入 `package.json` 的 `name`/`version`，用于把评审反馈对应到具体版本。每次完成一轮实质变更（评审整改、功能交付、对外演示前）都必须递增 `package.json` 的 `version`——不能让版本号停留在旧值，否则导出的评审报告无法区分是哪一版代码。

## 路由约定

本项目使用 TanStack Router 文件路由。官方文档见：

- [File-Based Routing](https://tanstack.com/router/latest/docs/guide/file-based-routing)
- [Code Splitting](https://tanstack.com/router/latest/docs/guide/code-splitting)
- [文件命名约定](https://tanstack.com/router/latest/docs/routing/file-naming-conventions)

### agent 实施时必须遵守的规范

1. **页面组件仍放在 `src/views/`，路由文件只放元数据**
   - `src/routes/<path>.jsx`：导出 `createFileRoute('/<path>')({ staticData: { title: '...' } })`。
   - `src/routes/<path>.lazy.jsx`：用 `createLazyFileRoute('/<path>')({ component: Component })` 引用 `src/views/` 的组件。
   - 禁止把完整页面组件写进 `src/routes/*.jsx`，保持 `src/views/` 为页面实现目录。

2. **新增/修改路由的文件要求**
   - 路径段用 `.` 连接，参数用 `$`，索引用 `.index`。
   - 示例：`admin.projects.detail.$id.jsx` → `/admin/projects/detail/:id`。
   - 每个路由必须提供 `staticData.title`，供 `Layout.jsx` 面包屑使用。

3. **共享路由文件不要随意改**
   - `src/routes/__root.jsx`：根布局。
   - `src/routes/admin.jsx`：`/admin` 布局路由，带 `beforeLoad` 权限校验。
   - 这些文件由基础设施 agent 统一维护；功能 agent 若需改动必须先沟通。

4. **`src/routeTree.gen.ts` 禁止手动修改**
   - 该文件由 `@tanstack/router-plugin/vite` 自动生成。
   - 如果本地缺少或看起来没更新，运行 `pnpm run build` 重新生成。

5. **不再使用 `react-router-dom` 的 API**
   - 导航：`useNavigate`、`Link`（来自 `@tanstack/react-router`）。
   - 参数：`useParams`。
   - 搜索参数：`useSearch({ strict: false })` 替代 `useSearchParams`。
   - 布局出口：`Outlet`。

6. **新增页面 checklist**
   - [ ] `src/views/` 创建组件。
   - [ ] `src/routes/` 创建 `.jsx` + `.lazy.jsx`。
   - [ ] 如需菜单，更新 `src/components/Layout.jsx` 的 `useMenuItems`。
   - [ ] 如需权限，更新 `src/config/permissions.js`。
   - [ ] `pnpm run build` 通过，且 `routeTree.gen.ts` 已自动更新。
