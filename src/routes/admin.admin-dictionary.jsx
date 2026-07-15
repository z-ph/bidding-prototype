import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/admin-dictionary')({
  staticData: { title: '参数字典' },
})
