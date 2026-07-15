import { createLazyFileRoute } from '@tanstack/react-router'
import SupervisorAbnormal from '../views/SupervisorAbnormal.jsx'

export const Route = createLazyFileRoute('/admin/supervisor-abnormal')({
  component: SupervisorAbnormal,
})
