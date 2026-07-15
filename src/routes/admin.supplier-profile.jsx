import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/supplier-profile')({
  staticData: { title: '企业档案' },
})
