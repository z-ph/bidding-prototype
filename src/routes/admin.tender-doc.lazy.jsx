import { createLazyFileRoute } from '@tanstack/react-router'
import TenderDoc from '../views/TenderDoc.jsx'

export const Route = createLazyFileRoute('/admin/tender-doc')({
  component: TenderDoc,
})
