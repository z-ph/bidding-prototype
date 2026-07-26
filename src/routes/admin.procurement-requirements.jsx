// @ts-nocheck — TS 渐进迁移基线：解冻本文件时删除本行并修复类型（见 AGENTS.md 技术栈）
import { createFileRoute, Outlet } from '@tanstack/react-router'

// 布局路由：/admin/procurement-requirements 下的子路由（edit）经 Outlet 渲染，
// 列表页本身由 admin.procurement-requirements.index 承载
export const Route = createFileRoute('/admin/procurement-requirements')({
  component: () => <Outlet />,
  staticData: { title: '采购需求' },
})
