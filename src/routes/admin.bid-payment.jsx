import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/bid-payment')({
  staticData: { title: '缴纳费用' },
})
