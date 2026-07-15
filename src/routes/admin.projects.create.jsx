import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/projects/create')({
  staticData: { title: '创建项目' },
})
