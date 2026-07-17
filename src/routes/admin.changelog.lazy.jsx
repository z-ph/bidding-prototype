import { createLazyFileRoute } from '@tanstack/react-router'
import Changelog from '../views/Changelog.jsx'

export const Route = createLazyFileRoute('/admin/changelog')({
  component: Changelog,
})
