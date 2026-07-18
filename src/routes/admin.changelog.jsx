import { createFileRoute, redirect } from '@tanstack/react-router'

// 旧台账路由：重定向到 Tab 合并页对应 tab（2026-07-18 入口合并）
export const Route = createFileRoute('/admin/changelog')({
  staticData: { title: '变更时间线' },
  beforeLoad: () => {
    throw redirect({ to: '/admin/dev-ledger', search: { tab: 'changelog' }, replace: true })
  }
})
