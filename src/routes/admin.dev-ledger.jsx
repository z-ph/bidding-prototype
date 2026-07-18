import { createFileRoute, redirect } from '@tanstack/react-router'

// 后台台账入口：统一重定向到公开合并页（2026-07-18 公开化修正）
export const Route = createFileRoute('/admin/dev-ledger')({
  staticData: { title: '评审台账' },
  beforeLoad: () => {
    throw redirect({ to: '/dev-ledger', replace: true })
  }
})
