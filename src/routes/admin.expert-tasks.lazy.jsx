import { createLazyFileRoute } from '@tanstack/react-router'
import ExpertTasks from '../views/ExpertTasks.jsx'

export const Route = createLazyFileRoute('/admin/expert-tasks')({
  component: ExpertTasks,
})
