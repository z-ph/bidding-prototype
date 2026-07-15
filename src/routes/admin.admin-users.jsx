import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/admin-users')({
  staticData: { title: '用户权限' },
})
