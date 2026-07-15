import { createLazyFileRoute } from '@tanstack/react-router'
import EvaluationHall from '../views/EvaluationHall.jsx'

export const Route = createLazyFileRoute('/admin/evaluation-hall')({
  component: EvaluationHall,
})
