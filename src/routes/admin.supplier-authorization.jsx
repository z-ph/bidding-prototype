import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/supplier-authorization')({
  staticData: { title: '供应商授权' },
})
