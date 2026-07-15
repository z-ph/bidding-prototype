import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/award-notice')({
  staticData: { title: '中标通知书' },
})
