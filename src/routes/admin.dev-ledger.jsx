import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/dev-ledger')({
  staticData: { title: '评审台账' },
})
