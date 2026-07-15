import { createLazyFileRoute } from '@tanstack/react-router'
import ContractArchive from '../views/ContractArchive.jsx'

export const Route = createLazyFileRoute('/admin/contract-archive')({
  component: ContractArchive,
})
