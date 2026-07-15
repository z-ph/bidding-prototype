import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/news')({
  staticData: { title: '新闻公告' },
})
