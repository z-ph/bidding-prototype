import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/bidder-projects')({
  staticData: { title: '我参与的项目' },
})
