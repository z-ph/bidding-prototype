import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/downloads')({
  staticData: { title: '下载中心' },
})
