import { createFileRoute, redirect } from '@tanstack/react-router'

// 旧台账路由：重定向到 Tab 合并页对应 tab（2026-07-18 入口合并）
export const Route = createFileRoute('/admin/review-change-list')({
  staticData: { title: '评审变更列表' },
  beforeLoad: () => {
    throw redirect({ to: '/dev-ledger', search: { tab: 'review' }, replace: true })
  }
})
