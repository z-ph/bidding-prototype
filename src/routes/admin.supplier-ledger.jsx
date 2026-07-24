import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/supplier-ledger')({
  staticData: { title: '供应商台账' },
})
