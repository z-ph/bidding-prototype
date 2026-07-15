import { createLazyFileRoute } from '@tanstack/react-router'
import BidQuote from '../views/BidQuote.jsx'

export const Route = createLazyFileRoute('/admin/bid-quote')({
  component: BidQuote,
})
