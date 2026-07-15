import { createLazyFileRoute } from '@tanstack/react-router'
import AdminNews from '../views/AdminNews.jsx'

export const Route = createLazyFileRoute('/admin/admin-news')({
  component: AdminNews,
})
