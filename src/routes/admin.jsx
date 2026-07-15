import { createFileRoute, redirect } from '@tanstack/react-router'
import Layout from '../components/Layout.jsx'
import { canAccess } from '../config/permissions.js'

export const Route = createFileRoute('/admin')({
  component: Layout,
  beforeLoad: ({ location }) => {
    const role = localStorage.getItem('bidding-role') || ''
    if (!canAccess(location.pathname, role)) {
      throw redirect({ to: '/admin/forbidden' })
    }
  },
})
