import { createLazyFileRoute } from '@tanstack/react-router'
import ProjectList from '../views/ProjectList.jsx'

export const Route = createLazyFileRoute('/admin/projects')({
  component: ProjectList,
})
