import { createLazyFileRoute } from '@tanstack/react-router'
import SupervisorHall from '../views/SupervisorHall.jsx'

export const Route = createLazyFileRoute('/admin/supervisor-hall')({
  component: SupervisorHall,
})
