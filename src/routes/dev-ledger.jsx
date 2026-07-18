import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dev-ledger')({
  staticData: { title: '评审台账' },
})
