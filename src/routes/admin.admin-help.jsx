import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/admin-help')({
  staticData: { title: '帮助中心管理' },
})
