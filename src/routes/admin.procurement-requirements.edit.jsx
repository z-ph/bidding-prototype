import { createFileRoute, redirect } from '@tanstack/react-router'

// 旧采购需求库编辑路由（2026-07-27 口径：需求库环节删除，需求在创建项目页内联创建）
export const Route = createFileRoute('/admin/procurement-requirements/edit')({
  staticData: { title: '创建项目' },
  beforeLoad: () => {
    throw redirect({ to: '/admin/projects/create', replace: true })
  }
})
