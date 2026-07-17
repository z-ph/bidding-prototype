import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/changelog')({
  staticData: { title: '变更时间线' },
})
