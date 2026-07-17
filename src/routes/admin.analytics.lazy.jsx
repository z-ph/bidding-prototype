import { createLazyFileRoute } from '@tanstack/react-router'
import ProcurementAnalytics from '../views/ProcurementAnalytics.jsx'

export const Route = createLazyFileRoute('/admin/analytics')({
  component: ProcurementAnalytics,
})
