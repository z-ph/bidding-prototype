import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/todo-center')({
  staticData: { title: '待办中心' },
})
