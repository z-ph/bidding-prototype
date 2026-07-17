import { createLazyFileRoute } from '@tanstack/react-router'
import SupplierAuthorization from '../views/SupplierAuthorization.jsx'

export const Route = createLazyFileRoute('/admin/supplier-authorization')({
  component: SupplierAuthorization,
})
