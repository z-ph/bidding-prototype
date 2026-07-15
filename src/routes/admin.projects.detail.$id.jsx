import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/projects/detail/$id')({
  staticData: { title: '项目详情' },
})
