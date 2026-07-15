import { createLazyFileRoute } from '@tanstack/react-router'
import SupervisorLogs from '../views/SupervisorLogs.jsx'

export const Route = createLazyFileRoute('/admin/supervisor-logs')({
  component: SupervisorLogs,
})
