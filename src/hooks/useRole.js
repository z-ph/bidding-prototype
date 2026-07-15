import { useState, useMemo, useCallback, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { getRoleName, canAccess } from '../config/permissions.js'

const ROLE_STORAGE_KEY = 'bidding-role'
const ACCOUNT_STORAGE_KEY = 'bidding-account'
const TOKEN_EXPIRY_KEY = 'bidding-token-expiry'
const USER_INFO_KEY = 'bidding-user-info'
const DATA_SCOPE_KEY = 'bidding-data-scope'

const DEFAULT_USER_INFO = {
  tenderee: { nickname: '张三', org: 'XX市轨道交通集团', dept: '采购部', deptCode: 'CG' },
  agent: { nickname: '李四', org: 'XX招标代理有限公司', dept: '招标代理部', deptCode: 'ZB' },
  bidder: { nickname: 'A科技有限公司', org: 'A科技有限公司', dept: '投标部', deptCode: 'TB' },
  expert: { nickname: '专家甲', org: '外部专家库', dept: '专家委员会', deptCode: 'ZJ' },
  supervisor: { nickname: '王监督', org: '监督办公室', dept: '监督组', deptCode: 'JD' },
  admin: { nickname: '平台管理员', org: '平台运营中心', dept: '运维部', deptCode: 'YW' }
}

const WORKSPACE_MAP = {
  tenderee: '/admin/dashboard',
  agent: '/admin/dashboard',
  bidder: '/admin/dashboard',
  expert: '/admin/dashboard',
  supervisor: '/admin/supervisor-hall',
  admin: '/admin/admin-dashboard'
}

function getStored(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function setStored(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore
  }
}

export function useRole() {
  const navigate = useNavigate()
  const [role, setRoleState] = useState(() => localStorage.getItem(ROLE_STORAGE_KEY) || '')
  const [account, setAccountState] = useState(() => localStorage.getItem(ACCOUNT_STORAGE_KEY) || '')
  const [userInfo, setUserInfoState] = useState(() => {
    const stored = getStored(USER_INFO_KEY)
    if (stored) return stored
    const initialRole = localStorage.getItem(ROLE_STORAGE_KEY) || 'tenderee'
    return DEFAULT_USER_INFO[initialRole] || {}
  })
  const [dataScope, setDataScopeState] = useState(() => localStorage.getItem(DATA_SCOPE_KEY) || 'all')
  const [tokenExpiry, setTokenExpiry] = useState(() => {
    const raw = localStorage.getItem(TOKEN_EXPIRY_KEY)
    return raw ? Number(raw) : 0
  })

  // Keep derived states in sync if another tab mutates storage (simplified)
  useEffect(() => {
    const handler = () => {
      setRoleState(localStorage.getItem(ROLE_STORAGE_KEY) || '')
      setAccountState(localStorage.getItem(ACCOUNT_STORAGE_KEY) || '')
      setUserInfoState(getStored(USER_INFO_KEY) || DEFAULT_USER_INFO[role] || {})
      setDataScopeState(localStorage.getItem(DATA_SCOPE_KEY) || 'all')
      setTokenExpiry(Number(localStorage.getItem(TOKEN_EXPIRY_KEY) || 0))
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [role])

  const roleName = useMemo(() => getRoleName(role), [role])

  const userName = useMemo(() => {
    if (userInfo.nickname) return userInfo.nickname
    return account || role || '未登录'
  }, [userInfo, account, role])

  const isAuthenticated = useMemo(() => {
    if (!role || !tokenExpiry) return false
    return Date.now() < tokenExpiry
  }, [role, tokenExpiry])

  // Redirect to login when token expired or not authenticated
  useEffect(() => {
    const currentPath = (window.location.hash || '').replace(/^#/, '') || '/'
    const isLoginPage = currentPath === '/login' || currentPath.startsWith('/login')
    if (!isLoginPage && !isAuthenticated) {
      clearRoleInternal()
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, navigate])

  // Periodic token expiry check while the app is open
  useEffect(() => {
    const id = setInterval(() => {
      const expiry = Number(localStorage.getItem(TOKEN_EXPIRY_KEY) || 0)
      if (expiry && Date.now() >= expiry) {
        const currentPath = (window.location.hash || '').replace(/^#/, '') || '/'
        if (currentPath !== '/login' && !currentPath.startsWith('/login')) {
          clearRoleInternal()
          navigate('/login', { replace: true })
        }
      }
    }, 60 * 1000)
    return () => clearInterval(id)
  }, [navigate])

  const setRole = useCallback((roleValue, accountValue = '') => {
    if (roleValue) localStorage.setItem(ROLE_STORAGE_KEY, roleValue)
    else localStorage.removeItem(ROLE_STORAGE_KEY)
    if (accountValue) localStorage.setItem(ACCOUNT_STORAGE_KEY, accountValue)
    else localStorage.removeItem(ACCOUNT_STORAGE_KEY)
    setRoleState(roleValue)
    setAccountState(accountValue)
    // refresh userInfo defaults when role changes
    setUserInfoState((prev) => prev || DEFAULT_USER_INFO[roleValue] || {})
  }, [])

  const setUserInfo = useCallback((info) => {
    const next = { ...userInfo, ...info }
    setStored(USER_INFO_KEY, next)
    setUserInfoState(next)
  }, [userInfo])

  const setDataScope = useCallback((scope) => {
    localStorage.setItem(DATA_SCOPE_KEY, scope)
    setDataScopeState(scope)
  }, [])

  const setToken = useCallback((expiryMs) => {
    localStorage.setItem(TOKEN_EXPIRY_KEY, String(expiryMs))
    setTokenExpiry(expiryMs)
  }, [])

  const login = useCallback((roleValue, accountValue, info = {}, scope = 'all', durationMs = 8 * 60 * 60 * 1000) => {
    const mergedInfo = { ...(DEFAULT_USER_INFO[roleValue] || {}), ...info }
    setRole(roleValue, accountValue)
    setUserInfo(mergedInfo)
    setDataScope(scope)
    setToken(Date.now() + durationMs)
  }, [setRole, setUserInfo, setDataScope, setToken])

  function clearRoleInternal() {
    localStorage.removeItem(ROLE_STORAGE_KEY)
    localStorage.removeItem(ACCOUNT_STORAGE_KEY)
    localStorage.removeItem(TOKEN_EXPIRY_KEY)
    localStorage.removeItem(USER_INFO_KEY)
    localStorage.removeItem(DATA_SCOPE_KEY)
    setRoleState('')
    setAccountState('')
    setUserInfoState({})
    setDataScopeState('all')
    setTokenExpiry(0)
  }

  const clearRole = useCallback(() => {
    clearRoleInternal()
  }, [])

  const checkPageAccess = useCallback((path) => {
    return canAccess(path, role || 'tenderee')
  }, [role])

  const redirectToWorkspace = useCallback(() => {
    const target = WORKSPACE_MAP[role] || '/admin/dashboard'
    navigate(target, { replace: true })
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
