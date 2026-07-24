import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/tender-doc')({
  staticData: { title: '采购文件' },
})
