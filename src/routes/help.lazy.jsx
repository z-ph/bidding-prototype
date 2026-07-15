import { createLazyFileRoute } from '@tanstack/react-router'
import Help from '../views/Help.jsx'

export const Route = createLazyFileRoute('/help')({
  component: Help,
})
