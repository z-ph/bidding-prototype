import { createLazyFileRoute } from '@tanstack/react-router'
import NoticeList from '../views/NoticeList.jsx'

export const Route = createLazyFileRoute('/admin/notice-list')({
  component: NoticeList,
})
