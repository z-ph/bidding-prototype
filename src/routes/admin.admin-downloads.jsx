import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/admin-downloads')({
  staticData: { title: '下载中心管理' },
})
