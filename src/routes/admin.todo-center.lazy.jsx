import { createLazyFileRoute } from '@tanstack/react-router'
import TodoCenter from '../views/TodoCenter.jsx'

export const Route = createLazyFileRoute('/admin/todo-center')({
  component: TodoCenter,
})
