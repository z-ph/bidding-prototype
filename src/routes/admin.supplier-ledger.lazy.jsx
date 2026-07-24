import { createLazyFileRoute } from '@tanstack/react-router'
import SupplierLedger from '../views/SupplierLedger.jsx'

export const Route = createLazyFileRoute('/admin/supplier-ledger')({
  component: SupplierLedger,
})
