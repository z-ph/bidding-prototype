import { createFileRoute, redirect } from '@tanstack/react-router'

// 旧自助注册页路由（2026-07-31 口径：注册页整体下线，一期供应商由采购方批量导入发放账号）
export const Route = createFileRoute('/register')({
  staticData: { title: '登录' },
  beforeLoad: () => {
    throw redirect({ to: '/login', replace: true })
  }
})
