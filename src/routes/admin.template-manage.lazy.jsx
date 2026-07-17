import { createLazyFileRoute } from '@tanstack/react-router'
import TemplateManage from '../views/TemplateManage.jsx'

export const Route = createLazyFileRoute('/admin/template-manage')({
  component: TemplateManage,
})
