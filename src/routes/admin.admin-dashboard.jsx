// @ts-nocheck — TS 渐进迁移基线：解冻本文件时删除本行并修复类型（见 AGENTS.md 技术栈）
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/admin-dashboard')({
  staticData: { title: '管理控制台' },
  beforeLoad: () => {
    throw redirect({ to: '/admin/dashboard', replace: true })
  }
})
