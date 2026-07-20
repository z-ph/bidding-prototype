import { useSyncExternalStore, useMemo, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { getRoleName, canAccess } from '../config/permissions.js'
import {
  subscribeRole,
  getRoleSnapshot,
  setRoleLogin,
  patchUserInfo,
  setDataScopeValue,
  clearRoleLogin,
  WORKSPACE_MAP
} from '../utils/roleStore.js'

// 角色登录态 hook：订阅内存角色模块（src/utils/roleStore.js）。
// 纯演示原型：无 token、无过期轮询、无 localStorage；刷新回到登录页。
export function useRole() {
  const navigate = useNavigate()
  const snapshot = useSyncExternalStore(subscribeRole, getRoleSnapshot)
  const { role, account, userInfo, dataScope } = snapshot

  const roleName = useMemo(() => getRoleName(role), [role])

  const userName = useMemo(() => {
    if (userInfo.nickname) return userInfo.nickname
    return account || role || '未登录'
  }, [userInfo, account, role])

  // 有角色即视为已登录（演示环境无 token 概念）
  const isAuthenticated = useMemo(() => !!role, [role])

  const setRole = useCallback((roleValue, accountValue = '') => {
    setRoleLogin(roleValue, accountValue)
  }, [])

  const setUserInfo = useCallback((info) => {
    patchUserInfo(info)
  }, [])

  const setDataScope = useCallback((scope) => {
    setDataScopeValue(scope)
  }, [])

  // login(role, account, info, scope)：兼容旧签名（durationMs 参数已废弃）
  const login = useCallback((roleValue, accountValue, info = {}, scope = 'all') => {
    setRoleLogin(roleValue, accountValue, info, scope)
  }, [])

  const clearRole = useCallback(() => {
    clearRoleLogin()
  }, [])

  const checkPageAccess = useCallback((path) => {
    return canAccess(path, role || 'tenderee')
  }, [role])

  const redirectToWorkspace = useCallback(() => {
    const target = WORKSPACE_MAP[role] || '/admin/dashboard'
    navigate({ to: target, replace: true })
  }, [navigate, role])

  return {
    role,
    roleName,
    userName,
    userInfo,
    account,
    dataScope,
    isAuthenticated,
    setRole,
    setUserInfo,
    setDataScope,
    login,
    clearRole,
    checkPageAccess,
    redirectToWorkspace
  }
}
