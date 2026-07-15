import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/organization')({
  staticData: { title: '组织机构' },
})
