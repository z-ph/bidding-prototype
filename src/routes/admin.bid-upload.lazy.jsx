import { createLazyFileRoute } from '@tanstack/react-router'
import BidUpload from '../views/BidUpload.jsx'

export const Route = createLazyFileRoute('/admin/bid-upload')({
  component: BidUpload,
})
