import { createLazyFileRoute } from '@tanstack/react-router'
import FeeManage from '../views/FeeManage.jsx'

export const Route = createLazyFileRoute('/admin/fee-manage')({
  component: FeeManage,
})
