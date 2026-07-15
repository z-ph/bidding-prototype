import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/bidder-invoices')({
  staticData: { title: '发票申请' },
})
