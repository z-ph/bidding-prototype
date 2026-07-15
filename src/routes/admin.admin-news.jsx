import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/admin-news')({
  staticData: { title: '新闻公告维护' },
})
