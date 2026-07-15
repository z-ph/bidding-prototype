import { createLazyFileRoute } from '@tanstack/react-router'
import BidPayment from '../views/BidPayment.jsx'

export const Route = createLazyFileRoute('/admin/bid-payment')({
  component: BidPayment,
})
