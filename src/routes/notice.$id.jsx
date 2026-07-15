import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/notice/$id')({
  staticData: { title: '公告详情' },
})
