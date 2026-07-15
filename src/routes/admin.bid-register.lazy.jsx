import { createLazyFileRoute } from '@tanstack/react-router'
import BidRegister from '../views/BidRegister.jsx'

export const Route = createLazyFileRoute('/admin/bid-register')({
  component: BidRegister,
})
