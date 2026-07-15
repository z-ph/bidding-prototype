import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/bid-register')({
  staticData: { title: '项目报名' },
})
