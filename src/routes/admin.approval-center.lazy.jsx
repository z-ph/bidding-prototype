import { createLazyFileRoute } from '@tanstack/react-router'
import ApprovalCenter from '../views/ApprovalCenter.jsx'

export const Route = createLazyFileRoute('/admin/approval-center')({
  component: ApprovalCenter,
})
