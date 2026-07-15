import { createLazyFileRoute } from '@tanstack/react-router'
import ObjectionManage from '../views/ObjectionManage.jsx'

export const Route = createLazyFileRoute('/admin/objection-manage')({
  component: ObjectionManage,
})
