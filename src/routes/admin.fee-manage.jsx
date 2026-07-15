import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/fee-manage')({
  staticData: { title: '费用管理' },
})
