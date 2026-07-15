import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/supervisor-logs')({
  staticData: { title: '操作日志' },
})
