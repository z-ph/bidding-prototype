import { createLazyFileRoute } from '@tanstack/react-router'
import AdminDictionary from '../views/AdminDictionary.jsx'

export const Route = createLazyFileRoute('/admin/admin-dictionary')({
  component: AdminDictionary,
})
