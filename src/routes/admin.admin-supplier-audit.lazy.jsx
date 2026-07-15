import { createLazyFileRoute } from '@tanstack/react-router'
import AdminSupplierAudit from '../views/AdminSupplierAudit.jsx'

export const Route = createLazyFileRoute('/admin/admin-supplier-audit')({
  component: AdminSupplierAudit,
})
