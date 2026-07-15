import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/review-change-list')({
  staticData: { title: '评审变更列表' },
})
