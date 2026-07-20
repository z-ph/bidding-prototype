// 用户管理共享存储（纯内存静态种子，无任何持久化）
// AdminUsers 列表读取此 store；全部账号均为启用状态。

// 默认用户基线
const DEFAULT_USERS = [
  { account: 'admin', name: '平台管理员', role: '平台管理员', org: '平台运营部', status: '启用' },
  { account: 'tenderee01', name: '张三', role: '招标人', org: 'XX市轨道交通集团', status: '启用' },
  { account: 'agent01', name: '李四', role: '招标代理', org: 'XX招标代理有限公司', status: '启用' },
  { account: 'bidder01', name: 'A科技有限公司', role: '投标人', org: 'A科技有限公司', status: '启用' },
  { account: 'expert01', name: '专家甲', role: '评标专家', org: '个人', status: '启用' },
  { account: 'supervisor01', name: '王监督', role: '监督人员', org: '监督办公室', status: '启用' }
]

export function loadUsers() {
  return DEFAULT_USERS.map((u) => ({ ...u }))
}

export function saveUsers() {
  // 纯演示：不保存数据
  return null
}

// 账号是否处于停用状态（演示环境全部启用，恒为 false）
export function isAccountDisabled() {
  return false
}
