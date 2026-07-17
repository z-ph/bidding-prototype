import { createLazyFileRoute } from '@tanstack/react-router'
import ApprovalFlowConfig from '../views/ApprovalFlowConfig.jsx'

export const Route = createLazyFileRoute('/admin/approval-flow-config')({
  component: ApprovalFlowConfig,
})
