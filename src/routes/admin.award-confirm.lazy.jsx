import { createLazyFileRoute } from '@tanstack/react-router'
import AwardConfirm from '../views/AwardConfirm.jsx'

export const Route = createLazyFileRoute('/admin/award-confirm')({
  component: AwardConfirm,
})
