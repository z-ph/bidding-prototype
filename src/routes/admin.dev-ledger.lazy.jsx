import { createLazyFileRoute } from '@tanstack/react-router'
import DevLedger from '../views/DevLedger.jsx'

export const Route = createLazyFileRoute('/admin/dev-ledger')({
  component: DevLedger,
})
