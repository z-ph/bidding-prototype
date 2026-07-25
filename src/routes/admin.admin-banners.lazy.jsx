import { createLazyFileRoute } from '@tanstack/react-router'
import AdminBanners from '../views/AdminBanners.jsx'

export const Route = createLazyFileRoute('/admin/admin-banners')({
  component: AdminBanners,
})
