import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/admin-banners')({
  staticData: { title: '首页轮播管理' },
})
