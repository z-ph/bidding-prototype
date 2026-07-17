import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/analytics')({
  staticData: { title: '采购数据分析' },
})
