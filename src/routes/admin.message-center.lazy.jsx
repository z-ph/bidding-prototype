import { createLazyFileRoute } from '@tanstack/react-router'
import MessageCenter from '../views/MessageCenter.jsx'

export const Route = createLazyFileRoute('/admin/message-center')({
  component: MessageCenter,
})
