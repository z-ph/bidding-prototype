import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/expert-tasks')({
  staticData: { title: '我的任务' },
})
