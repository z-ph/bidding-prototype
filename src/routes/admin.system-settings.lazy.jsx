import { createLazyFileRoute } from '@tanstack/react-router'
import SystemSettings from '../views/SystemSettings.jsx'

export const Route = createLazyFileRoute('/admin/system-settings')({
  component: SystemSettings,
})
