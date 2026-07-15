import { createLazyFileRoute } from '@tanstack/react-router'
import ProjectCreate from '../views/ProjectCreate.jsx'

export const Route = createLazyFileRoute('/admin/projects/create')({
  component: ProjectCreate,
})
