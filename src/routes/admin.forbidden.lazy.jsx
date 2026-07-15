import { createLazyFileRoute } from '@tanstack/react-router'
import Forbidden from '../components/Forbidden.jsx'

export const Route = createLazyFileRoute('/admin/forbidden')({
  component: Forbidden,
})
