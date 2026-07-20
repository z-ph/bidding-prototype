import { createFileRoute, redirect } from '@tanstack/react-router'
import Layout from '../components/Layout.jsx'
import { canAccess } from '../config/permissions.js'
import { getRoleSnapshot } from '../utils/roleStore.js'

export const Route = createFileRoute('/admin')({
  component: Layout,
  beforeLoad: ({ location }) => {
    // 先认证后授权：未登录（内存中无角色）一律回登录页，不再闪 403
    const { role } = getRoleSnapshot()
    if (!role) {
      throw redirect({ to: '/login' })
    }
    if (!canAccess(location.pathname, role)) {
      throw redirect({ to: '/admin/forbidden' })
    }
  },
})
