import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/admin-logs')({
  staticData: { title: '日志审计' },
})
