import { createLazyFileRoute } from '@tanstack/react-router'
import ProcurementRequirementEdit from '../views/ProcurementRequirementEdit.jsx'

export const Route = createLazyFileRoute('/admin/procurement-requirements/edit')({
  component: ProcurementRequirementEdit,
})
