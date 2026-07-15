import { createLazyFileRoute } from '@tanstack/react-router'
import ExpertProject from '../views/ExpertProject.jsx'

export const Route = createLazyFileRoute('/admin/expert-project')({
  component: ExpertProject,
})
