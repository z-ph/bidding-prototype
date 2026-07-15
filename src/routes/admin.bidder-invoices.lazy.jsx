import { createLazyFileRoute } from '@tanstack/react-router'
import BidderInvoices from '../views/BidderInvoices.jsx'

export const Route = createLazyFileRoute('/admin/bidder-invoices')({
  component: BidderInvoices,
})
