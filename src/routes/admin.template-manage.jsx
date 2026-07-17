import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/template-manage')({
  staticData: { title: '模板管理' },
})
