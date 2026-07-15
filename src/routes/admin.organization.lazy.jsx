import { createLazyFileRoute } from '@tanstack/react-router'
import Organization from '../views/Organization.jsx'

export const Route = createLazyFileRoute('/admin/organization')({
  component: Organization,
})
