import { createLazyFileRoute } from '@tanstack/react-router'
import DevLedger from '../views/DevLedger.jsx'

export const Route = createLazyFileRoute('/dev-ledger')({
  component: DevLedger,
})
