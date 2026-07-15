import { createLazyFileRoute } from '@tanstack/react-router'
import Contact from '../views/Contact.jsx'

export const Route = createLazyFileRoute('/contact')({
  component: Contact,
})
