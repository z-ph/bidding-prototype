import { createLazyFileRoute } from '@tanstack/react-router'
import NoticeDetail from '../views/NoticeDetail.jsx'

export const Route = createLazyFileRoute('/notice/$id')({
  component: NoticeDetail,
})
