import { createLazyFileRoute } from '@tanstack/react-router'
import ProjectDetail from '../views/ProjectDetail.jsx'

export const Route = createLazyFileRoute('/admin/projects/detail/$id')({
  component: ProjectDetail,
})
