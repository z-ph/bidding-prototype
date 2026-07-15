import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/expert-profile')({
  staticData: { title: '专家信息' },
})
