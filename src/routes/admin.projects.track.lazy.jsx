import { createLazyFileRoute } from '@tanstack/react-router'
import ProjectTrack from '../views/ProjectTrack.jsx'

export const Route = createLazyFileRoute('/admin/projects/track')({
  component: ProjectTrack,
})
