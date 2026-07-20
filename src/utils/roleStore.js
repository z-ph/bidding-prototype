// 角色登录态：纯内存 pub/sub 单例（无任何 localStorage / token / 过期机制）
// 刷新页面即回到未登录状态（从登录页重新选角色进入演示）。
// useRole() hook 与路由守卫（admin.jsx）统一从本模块读写角色。

const DEFAULT_USER_INFO = {
  tenderee: { nickname: '张三', org: 'XX市轨道交通集团', dept: '采购部', deptCode: 'CG' },
  agent: { nickname: '李四', org: 'XX招标代理有限公司', dept: '招标代理部', deptCode: 'ZB' },
  bidder: { nickname: 'A科技有限公司', org: 'A科技有限公司', dept: '投标部', deptCode: 'TB' },
  expert: { nickname: '专家甲', org: '外部专家库', dept: '专家委员会', deptCode: 'ZJ' },
  supervisor: { nickname: '王监督', org: '监督办公室', dept: '监督组', deptCode: 'JD' },
  admin: { nickname: '平台管理员', org: '平台运营中心', dept: '运维部', deptCode: 'YW' }
}

export const WORKSPACE_MAP = {
  tenderee: '/admin/dashboard',
  agent: '/admin/dashboard',
  bidder: '/admin/dashboard',
  expert: '/admin/dashboard',
  supervisor: '/admin/supervisor-hall',
  admin: '/admin/dashboard'
}

let state = {
  role: '',
  account: '',
  userInfo: {},
  dataScope: 'all'
}

const listeners = new Set()

function emit() {
  listeners.forEach((fn) => fn())
}

export function getRoleSnapshot() {
  return state
}

export function subscribeRole(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function setRoleLogin(roleValue, accountValue = '', info = {}, scope = 'all') {
  state = {
    role: roleValue || '',
    account: accountValue || '',
    userInfo: { ...(DEFAULT_USER_INFO[roleValue] || {}), ...info },
    dataScope: scope || 'all'
  }
  emit()
}

export function patchUserInfo(info) {
  state = { ...state, userInfo: { ...state.userInfo, ...info } }
  emit()
}

export function setDataScopeValue(scope) {
  state = { ...state, dataScope: scope || 'all' }
  emit()
}

export function clearRoleLogin() {
  state = { role: '', account: '', userInfo: {}, dataScope: 'all' }
  emit()
}

export function getDefaultUserInfo(role) {
  return { ...(DEFAULT_USER_INFO[role] || {}) }
}
