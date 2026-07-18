import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/admin-dashboard')({
  staticData: { title: '管理控制台' },
  beforeLoad: () => {
    throw redirect({ to: '/admin/dashboard', replace: true })
  }
})
