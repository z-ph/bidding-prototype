import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/approval-flow-config')({
  staticData: { title: '审批流配置' },
})
