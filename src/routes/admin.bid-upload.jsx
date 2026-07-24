import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/bid-upload')({
  staticData: { title: '上传响应文件' },
})
