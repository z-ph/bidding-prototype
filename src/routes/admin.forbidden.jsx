import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/forbidden')({
  staticData: { title: '无权限' },
})
