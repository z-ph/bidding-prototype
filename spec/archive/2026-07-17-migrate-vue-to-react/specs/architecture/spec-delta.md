# Spec Delta: Vue to React Migration

## ADDED Requirements

### Requirement: React 项目脚手架
WHEN 迁移完成后,
系统 SHALL 使用 React 18 + React Router 6 + Ant Design 5 作为前端技术栈,
AND 使用 Vite + @vitejs/plugin-react 构建,
AND 不再依赖 Vue 3、Vue Router、Element Plus。

#### Scenario: 安装依赖后启动
GIVEN 已执行 `npm install`
WHEN 运行 `npm run dev`
THEN 开发服务器正常启动且无 Vue 相关依赖。

#### Scenario: 生产构建
GIVEN 迁移后的代码库
WHEN 运行 `npm run build`
THEN 构建成功生成 dist 目录。

### Requirement: 路由使用 React Router
WHEN 用户访问任意页面路径,
系统 SHALL 使用 React Router 6 进行路由匹配,
AND 在访问 `/admin/*` 路径时执行与原先一致的权限校验。

#### Scenario: 公共页面直接访问
GIVEN 用户访问 `/login` 或 `/register`
WHEN 路由匹配
THEN 直接渲染对应页面，不校验角色。

#### Scenario: 管理后台权限校验
GIVEN 用户访问 `/admin/projects`
WHEN 当前角色不在允许列表中
THEN 重定向至 `/admin/forbidden`。

### Requirement: 权限与角色 Hook
WHEN React 组件需要获取当前角色或检查权限,
系统 SHALL 提供 `useRole` Hook,
AND 其行为与原先 `useRole.js` 一致：从 localStorage 读取角色、提供角色名、用户名、登出与跳转方法。

### Requirement: 全局布局组件
WHEN 用户访问 `/admin/*` 页面,
系统 SHALL 使用 React 版 `Layout` 组件渲染左侧菜单、顶部面包屑与内容区,
AND 菜单项根据当前角色动态生成。

## MODIFIED Requirements

### Requirement: UI 组件库
WHILE 以前使用 Element Plus 组件,
系统 SHALL 改用 Ant Design 5 组件实现相同交互,
AND 保持页面布局与关键交互一致。

#### Scenario: 表格展示
GIVEN 页面原先使用 `el-table`
WHEN 迁移到 React
THEN 使用 `Table` 组件展示相同列与操作按钮。

#### Scenario: 表单提交
GIVEN 页面原先使用 `el-form` + `el-form-item`
WHEN 迁移到 React
THEN 使用 `Form` + `Form.Item` 实现相同的校验与提交行为。

## REMOVED Requirements

### Requirement: Vue 单文件组件
WHILE 以前使用 `.vue` 单文件组件,
系统 SHALL 不再使用 `.vue` 文件,
AND 不再使用 Vue 的 `ref`、`reactive`、`computed`、`watch` 等响应式 API。
