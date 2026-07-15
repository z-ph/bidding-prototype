import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/notice-publish')({
  staticData: { title: '发布公告' },
})
