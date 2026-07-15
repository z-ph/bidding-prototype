import { createLazyFileRoute } from '@tanstack/react-router'
import SupplierProfile from '../views/SupplierProfile.jsx'

export const Route = createLazyFileRoute('/admin/supplier-profile')({
  component: SupplierProfile,
})
