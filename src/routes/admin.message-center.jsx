import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/message-center')({
  staticData: { title: '消息中心' },
})
