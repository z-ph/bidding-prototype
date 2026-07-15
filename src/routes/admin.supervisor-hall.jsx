import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/supervisor-hall')({
  staticData: { title: '监督大厅' },
})
