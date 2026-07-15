import { createLazyFileRoute } from '@tanstack/react-router'
import NoticePublish from '../views/NoticePublish.jsx'

export const Route = createLazyFileRoute('/admin/notice-publish')({
  component: NoticePublish,
})
