import { createLazyFileRoute } from '@tanstack/react-router'
import ComparisonHall from '../views/ComparisonHall.jsx'

export const Route = createLazyFileRoute('/admin/comparison-hall')({
  component: ComparisonHall,
})
