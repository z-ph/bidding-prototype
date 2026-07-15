import { createLazyFileRoute } from '@tanstack/react-router'
import AdminLogs from '../views/AdminLogs.jsx'

export const Route = createLazyFileRoute('/admin/admin-logs')({
  component: AdminLogs,
})
