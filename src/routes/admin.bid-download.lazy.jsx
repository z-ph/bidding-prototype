import { createLazyFileRoute } from '@tanstack/react-router'
import BidDownload from '../views/BidDownload.jsx'

export const Route = createLazyFileRoute('/admin/bid-download')({
  component: BidDownload,
})
