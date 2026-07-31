import { createFileRoute, redirect } from '@tanstack/react-router'

// 旧缴费页面路由（2026-07-31 口径：页面下架，仅预留付款凭证扩展能力，不建页面/菜单）
export const Route = createFileRoute('/admin/fee-manage')({
  staticData: { title: '工作台' },
  beforeLoad: () => {
    throw redirect({ to: '/admin/dashboard', replace: true })
  }
})
