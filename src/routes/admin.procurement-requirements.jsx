import { createFileRoute, Outlet } from '@tanstack/react-router'

// 布局路由：/admin/procurement-requirements 下的子路由（edit）经 Outlet 渲染，
// 列表页本身由 admin.procurement-requirements.index 承载
export const Route = createFileRoute('/admin/procurement-requirements')({
  component: () => <Outlet />,
  staticData: { title: '采购需求' },
})
