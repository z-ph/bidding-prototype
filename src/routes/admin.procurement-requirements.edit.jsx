import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/procurement-requirements/edit')({
  staticData: { title: '编辑采购需求' },
})
