import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/contract-archive')({
  staticData: { title: '合同归档' },
})
