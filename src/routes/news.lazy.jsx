import { createLazyFileRoute } from '@tanstack/react-router'
import News from '../views/News.jsx'

export const Route = createLazyFileRoute('/news')({
  component: News,
})
