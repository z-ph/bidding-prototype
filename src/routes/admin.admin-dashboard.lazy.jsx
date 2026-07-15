import { createLazyFileRoute } from '@tanstack/react-router'
import AdminDashboard from '../views/AdminDashboard.jsx'

export const Route = createLazyFileRoute('/admin/admin-dashboard')({
  component: AdminDashboard,
})
