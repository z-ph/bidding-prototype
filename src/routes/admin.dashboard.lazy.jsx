import { createLazyFileRoute } from '@tanstack/react-router'
import Dashboard from '../views/Dashboard.jsx'

export const Route = createLazyFileRoute('/admin/dashboard')({
  component: Dashboard,
})
