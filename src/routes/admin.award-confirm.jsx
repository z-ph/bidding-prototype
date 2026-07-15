import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/award-confirm')({
  staticData: { title: '确认中标人' },
})
