import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/objection-manage')({
  staticData: { title: '异议管理' },
})
