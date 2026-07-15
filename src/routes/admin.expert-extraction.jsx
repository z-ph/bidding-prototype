import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/expert-extraction')({
  staticData: { title: '专家抽取' },
})
