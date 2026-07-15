import { createLazyFileRoute } from '@tanstack/react-router'
import AdminUsers from '../views/AdminUsers.jsx'

export const Route = createLazyFileRoute('/admin/admin-users')({
  component: AdminUsers,
})
