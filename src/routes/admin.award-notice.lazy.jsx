import { createLazyFileRoute } from '@tanstack/react-router'
import AwardNotice from '../views/AwardNotice.jsx'

export const Route = createLazyFileRoute('/admin/award-notice')({
  component: AwardNotice,
})
