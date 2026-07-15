import { createLazyFileRoute } from '@tanstack/react-router'
import Login from '../views/Login.jsx'

export const Route = createLazyFileRoute('/login')({
  component: Login,
})
