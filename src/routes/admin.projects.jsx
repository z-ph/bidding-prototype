import { createFileRoute, Outlet } from '@tanstack/react-router'

// 布局路由：/admin/projects 下的子路由（create/detail/track）经 Outlet 渲染，
// 列表页本身由 admin.projects.index 承载
export const Route = createFileRoute('/admin/projects')({
  component: () => <Outlet />,
  staticData: { title: '项目列表' },
})
