import { createRootRoute, Outlet } from '@tanstack/react-router'
import DevLedgerFab from '../components/DevLedgerFab.jsx'

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <DevLedgerFab />
    </>
  ),
})
