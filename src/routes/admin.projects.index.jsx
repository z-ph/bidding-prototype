import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/projects/')({
  staticData: { title: '项目列表' },
})
