import { createFileRoute, redirect } from '@tanstack/react-router'

// 公开台账入口：统一重定向到合并页对应 tab（2026-07-18 入口合并+公开化修正）
export const Route = createFileRoute('/review-change-list')({
  staticData: { title: '评审变更列表' },
  beforeLoad: () => {
    throw redirect({ to: '/dev-ledger', search: { tab: 'review' }, replace: true })
  }
})
