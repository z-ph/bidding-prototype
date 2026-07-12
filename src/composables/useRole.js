import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getRoleName, canAccess } from '../config/permissions.js'

const ROLE_STORAGE_KEY = 'bidding-role'
const ACCOUNT_STORAGE_KEY = 'bidding-account'

export function useRole() {
  const route = useRoute()
  const router = useRouter()

  // 当前角色：仅来自登录后的用户信息，不再由 URL 决定
  const role = computed(() => {
    return localStorage.getItem(ROLE_STORAGE_KEY) || 'tenderee'
  })

  const roleName = computed(() => getRoleName(role.value))

  const userName = computed(() => {
    const account = localStorage.getItem(ACCOUNT_STORAGE_KEY) || role.value
    const names = {
      tenderee: '张三',
      agent: '李四',
      bidder: 'A科技有限公司',
      expert: '专家甲',
      supervisor: '王监督',
      admin: '平台管理员'
    }
    return names[role.value] || account
  })

  function setRole(roleValue, account = '') {
    localStorage.setItem(ROLE_STORAGE_KEY, roleValue)
    if (account) {
      localStorage.setItem(ACCOUNT_STORAGE_KEY, account)
    }
  }

  function clearRole() {
    localStorage.removeItem(ROLE_STORAGE_KEY)
    localStorage.removeItem(ACCOUNT_STORAGE_KEY)
  }

  function checkPageAccess(path) {
    return canAccess(path, role.value)
  }

  function redirectToWorkspace() {
    const map = {
      tenderee: '/admin/dashboard',
      agent: '/admin/dashboard',
      bidder: '/admin/dashboard',
      expert: '/admin/dashboard',
      supervisor: '/admin/supervisor-hall',
      admin: '/admin/admin-dashboard'
    }
    router.replace(map[role.value] || '/admin/dashboard')
  }

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
