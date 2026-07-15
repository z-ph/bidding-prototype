import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/projects/track')({
  staticData: { title: '项目跟踪' },
})
