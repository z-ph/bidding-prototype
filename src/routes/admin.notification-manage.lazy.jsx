import { createLazyFileRoute } from '@tanstack/react-router'
import NotificationManage from '../views/NotificationManage.jsx'

export const Route = createLazyFileRoute('/admin/notification-manage')({
  component: NotificationManage,
})
