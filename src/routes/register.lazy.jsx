import { createLazyFileRoute } from '@tanstack/react-router'
import Register from '../views/Register.jsx'

export const Route = createLazyFileRoute('/register')({
  component: Register,
})
