// 用户管理共享存储（localStorage 持久化）
// AdminUsers 列表读写此 store；Login 校验账号是否被停用时也读取此 store。

const USER_KEY = 'bidding-users'

// 默认用户基线（与原 AdminUsers useState 初值一致）
const DEFAULT_USERS = [
  { account: 'admin', name: '平台管理员', role: '平台管理员', org: '平台运营部', status: '启用' },
  { account: 'tenderee01', name: '张三', role: '招标人', org: 'XX市轨道交通集团', status: '启用' },
  { account: 'agent01', name: '李四', role: '招标代理', org: 'XX招标代理有限公司', status: '启用' },
  { account: 'bidder01', name: 'A科技有限公司', role: '投标人', org: 'A科技有限公司', status: '启用' },
  { account: 'expert01', name: '专家甲', role: '评标专家', org: '个人', status: '启用' }
]

export function loadUsers() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return DEFAULT_USERS.map((u) => ({ ...u }))
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_USERS.map((u) => ({ ...u }))
    return parsed
  } catch {
    return DEFAULT_USERS.map((u) => ({ ...u }))
  }
}

export function saveUsers(users) {
  localStorage.setItem(USER_KEY, JSON.stringify(users))
}

// 账号是否处于停用状态（供 Login 登录校验调用）
export function isAccountDisabled(account) {
  if (!account) return false
  const users = loadUsers()
  const found = users.find((u) => u.account === account)
  return !!found && found.status === '禁用'
}
