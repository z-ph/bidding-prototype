// @ts-nocheck — TS 渐进迁移基线：解冻本文件时删除本行并修复类型（见 AGENTS.md 技术栈）
import { createLazyFileRoute } from '@tanstack/react-router'
import MessageCenter from '../views/MessageCenter.jsx'

export const Route = createLazyFileRoute('/admin/message-center')({
  component: MessageCenter,
})
