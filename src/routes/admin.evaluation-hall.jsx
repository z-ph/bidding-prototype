import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/evaluation-hall')({
  staticData: { title: '评审大厅' },
})
