import { createLazyFileRoute } from '@tanstack/react-router'
import Portal from '../views/Portal.jsx'

export const Route = createLazyFileRoute('/')({
  component: Portal,
})
