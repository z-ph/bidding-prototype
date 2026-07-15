import { createLazyFileRoute } from '@tanstack/react-router'
import BidderProjects from '../views/BidderProjects.jsx'

export const Route = createLazyFileRoute('/admin/bidder-projects')({
  component: BidderProjects,
})
