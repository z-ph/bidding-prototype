import { createLazyFileRoute } from '@tanstack/react-router'
import ProcurementRequirementList from '../views/ProcurementRequirementList.jsx'

export const Route = createLazyFileRoute('/admin/procurement-requirements')({
  component: ProcurementRequirementList,
})
