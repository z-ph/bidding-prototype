import { createLazyFileRoute } from '@tanstack/react-router'
import OpeningHall from '../views/OpeningHall.jsx'

export const Route = createLazyFileRoute('/admin/opening-hall')({
  component: OpeningHall,
})
