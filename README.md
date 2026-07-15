# 招投标采购平台原型

这是一个招投标采购平台的原型项目，用于演示招标、投标、评标、定标、合同归档等核心业务流程。

## 技术栈

- React 18
- TanStack Router（文件路由 + 自动代码分割）
- Ant Design 5
- Vite

## 角色

平台支持以下角色：

- 招标人
- 招标代理
- 投标人/供应商
- 评标专家
- 监督人员
- 平台管理员

## 快速开始

```bash
pnpm install
pnpm run dev
pnpm run build
```

## 项目结构

- `src/routes/` — 文件路由（按 TanStack Router 约定组织）
- `src/routeTree.gen.ts` — 自动生成的路由树（不要手动修改）
- `src/views/` — 页面组件（被 `src/routes/*.lazy.jsx` 引用）
- `src/components/` — 通用组件
- `src/hooks/` — React Hooks
- `src/config/` — 权限与常量配置

## 路由约定

本项目使用 TanStack Router 的**文件路由**（file-based routing）。官方文档：

- [File-Based Routing 指南](https://tanstack.com/router/latest/docs/guide/file-based-routing)
- [Code Splitting 指南](https://tanstack.com/router/latest/docs/guide/code-splitting)
- [文件命名约定](https://tanstack.com/router/latest/docs/routing/file-naming-conventions)

### 本项目的风格

1. **路由文件只放路由元数据，页面组件保留在 `src/views/`**
   - `src/routes/<path>.jsx` 导出 `Route = createFileRoute('/<path>')({ ... })`，只写 `staticData` 等关键配置。
   - `src/routes/<path>.lazy.jsx` 用 `createLazyFileRoute` 引用 `src/views/` 里的真实组件，实现页面懒加载。
   - 不要把页面逻辑直接写进 `src/routes/`；保持 `src/views/` 作为页面实现目录。

2. **根路由与布局**
   - `src/routes/__root.jsx`：根路由，目前只负责渲染 `<Outlet />`。
   - `src/routes/admin.jsx`：`/admin` 布局路由，挂载 `Layout` 组件，并在 `beforeLoad` 中做权限校验。
   - 所有 `/admin/*` 页面放在 `src/routes/admin.<segment>.jsx` 中，自动成为 `admin.jsx` 的子路由。

3. **路径命名规则**
   - URL 段用 `.` 连接：`admin.projects.detail.$id.jsx` → `/admin/projects/detail/:id`。
   - 动态参数用 `$`：`notice.$id.jsx` → `/notice/:id`。
   - 索引路由用 `.index`：`admin.index.jsx` → `/admin`。

4. **页面标题**
   - 在每个路由文件的 `staticData` 中写 `{ title: '页面标题' }`。
   - `Layout.jsx` 通过 `useMatches()` 读取最后一个匹配的 `staticData.title` 来展示面包屑标题。

5. **搜索参数**
   - 不再使用 `useSearchParams`。
   - 读取：`const search = useSearch({ strict: false })`，然后访问 `search.projectId`。
   - 跳转带参数：`navigate({ to: '/admin/tender-doc', search: { projectId: '1' } })`。

6. **新增页面步骤**
   - 在 `src/views/` 创建页面组件。
   - 在 `src/routes/` 创建对应的路由文件和 `.lazy.jsx` 懒加载文件。
   - 如果需要在左侧菜单显示，更新 `src/components/Layout.jsx` 中的 `useMenuItems`。
   - 如果涉及权限，更新 `src/config/permissions.js`。
   - 运行 `pnpm run build`，确认 `src/routeTree.gen.ts` 已自动更新且构建通过。

7. **不要改 `src/routeTree.gen.ts`**
   - 该文件由 `@tanstack/router-plugin/vite` 在 dev/build 时自动生成。
   - 如果本地没有生成，先跑一次 `pnpm run build`。
