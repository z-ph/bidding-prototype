import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/bid-download')({
  staticData: { title: '下载文件' },
})
