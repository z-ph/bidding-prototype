import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRoleName, canAccess } from '../config/permissions.js'

const ROLE_STORAGE_KEY = 'bidding-role'
const ACCOUNT_STORAGE_KEY = 'bidding-account'

const DISPLAY_NAMES = {
  tenderee: '张三',
  agent: '李四',
  bidder: 'A科技有限公司',
  expert: '专家甲',
  supervisor: '王监督',
  admin: '平台管理员'
}

const WORKSPACE_MAP = {
  tenderee: '/admin/dashboard',
  agent: '/admin/dashboard',
  bidder: '/admin/dashboard',
  expert: '/admin/dashboard',
  supervisor: '/admin/supervisor-hall',
  admin: '/admin/admin-dashboard'
}

export function useRole() {
  const navigate = useNavigate()
  const [role, setRoleState] = useState(() => localStorage.getItem(ROLE_STORAGE_KEY) || 'tenderee')

  const roleName = useMemo(() => getRoleName(role), [role])

  const userName = useMemo(() => {
    const account = localStorage.getItem(ACCOUNT_STORAGE_KEY) || role
    return DISPLAY_NAMES[role] || account
  }, [role])

  const setRole = useCallback((roleValue, account = '') => {
    localStorage.setItem(ROLE_STORAGE_KEY, roleValue)
    if (account) {
      localStorage.setItem(ACCOUNT_STORAGE_KEY, account)
    }
    setRoleState(roleValue)
  }, [])

  const clearRole = useCallback(() => {
    localStorage.removeItem(ROLE_STORAGE_KEY)
    localStorage.removeItem(ACCOUNT_STORAGE_KEY)
    setRoleState('tenderee')
  }, [])

  const checkPageAccess = useCallback((path) => {
    return canAccess(path, role)
  }, [role])

  const redirectToWorkspace = useCallback(() => {
    const target = WORKSPACE_MAP[role] || '/admin/dashboard'
    navigate(target, { replace: true })
  }, [navigate, role])

  return {
    role,
    roleName,
    userName,
    setRole,
    clearRole,
    checkPageAccess,
    redirectToWorkspace
  }
}
