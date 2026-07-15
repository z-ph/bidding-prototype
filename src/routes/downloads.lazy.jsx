import { createLazyFileRoute } from '@tanstack/react-router'
import Downloads from '../views/Downloads.jsx'

export const Route = createLazyFileRoute('/downloads')({
  component: Downloads,
})
