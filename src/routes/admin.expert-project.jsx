import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/expert-project')({
  staticData: { title: '评标任务' },
})
