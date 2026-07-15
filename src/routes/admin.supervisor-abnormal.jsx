import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/supervisor-abnormal')({
  staticData: { title: '异常登记' },
})
