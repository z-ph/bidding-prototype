import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/review-change-list')({
  staticData: { title: '评审变更列表' },
})
