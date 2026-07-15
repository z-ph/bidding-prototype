import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/admin-supplier-audit')({
  staticData: { title: '准入审核' },
})
