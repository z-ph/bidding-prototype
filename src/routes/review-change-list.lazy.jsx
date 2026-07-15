import { createLazyFileRoute } from '@tanstack/react-router'
import ReviewChangeList from '../views/ReviewChangeList.jsx'

export const Route = createLazyFileRoute('/review-change-list')({
  component: ReviewChangeList,
})
