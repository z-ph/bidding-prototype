// @ts-nocheck — TS 渐进迁移基线：解冻本文件时删除本行并修复类型（见 AGENTS.md 技术栈）
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/bidder-projects')({
  staticData: { title: '我参与的项目' },
})
