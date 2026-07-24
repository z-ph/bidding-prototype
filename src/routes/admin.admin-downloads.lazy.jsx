import { createLazyFileRoute } from '@tanstack/react-router'
import AdminDownloads from '../views/AdminDownloads.jsx'

export const Route = createLazyFileRoute('/admin/admin-downloads')({
  component: AdminDownloads,
})
