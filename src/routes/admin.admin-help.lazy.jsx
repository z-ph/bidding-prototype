import { createLazyFileRoute } from '@tanstack/react-router'
import AdminHelp from '../views/AdminHelp.jsx'

export const Route = createLazyFileRoute('/admin/admin-help')({
  component: AdminHelp,
})
