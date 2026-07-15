import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/login')({
  staticData: { title: '登录' },
})
