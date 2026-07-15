import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/help')({
  staticData: { title: '帮助中心' },
})
