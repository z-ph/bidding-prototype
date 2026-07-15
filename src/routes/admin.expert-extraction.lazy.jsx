import { createLazyFileRoute } from '@tanstack/react-router'
import ExpertExtraction from '../views/ExpertExtraction.jsx'

export const Route = createLazyFileRoute('/admin/expert-extraction')({
  component: ExpertExtraction,
})
