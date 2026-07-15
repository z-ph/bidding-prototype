import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/bid-quote')({
  staticData: { title: '在线报价' },
})
