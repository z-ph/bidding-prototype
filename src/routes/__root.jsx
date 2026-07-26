// @ts-nocheck — TS 渐进迁移基线：解冻本文件时删除本行并修复类型（见 AGENTS.md 技术栈）
import { createRootRoute, Outlet } from '@tanstack/react-router'
import DevLedgerFab from '../components/DevLedgerFab.jsx'

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <DevLedgerFab />
    </>
  ),
})
