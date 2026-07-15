import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/sub-accounts')({
  staticData: { title: '子账号管理' },
})
