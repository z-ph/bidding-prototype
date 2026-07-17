import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/approval-center')({
  staticData: { title: '审批中心' },
})
