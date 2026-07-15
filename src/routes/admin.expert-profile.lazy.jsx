import { createLazyFileRoute } from '@tanstack/react-router'
import ExpertProfile from '../views/ExpertProfile.jsx'

export const Route = createLazyFileRoute('/admin/expert-profile')({
  component: ExpertProfile,
})
