import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/notification-manage')({
  staticData: { title: '通知管理' },
})
