import { createLazyFileRoute } from '@tanstack/react-router'
import SubAccounts from '../views/SubAccounts.jsx'

export const Route = createLazyFileRoute('/admin/sub-accounts')({
  component: SubAccounts,
})
