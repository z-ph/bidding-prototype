import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/notice-list')({
  staticData: { title: '公告列表' },
})
