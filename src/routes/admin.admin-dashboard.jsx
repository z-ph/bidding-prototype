import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/admin-dashboard')({
  staticData: { title: '管理控制台' },
})
