import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/system-settings')({
  staticData: { title: '系统设置' },
})
