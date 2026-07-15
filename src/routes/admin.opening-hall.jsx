import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/opening-hall')({
  staticData: { title: '开标大厅' },
})
