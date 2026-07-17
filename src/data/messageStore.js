// 站内信 mock 数据存储（localStorage 持久化）
// 供 MessageCenter（站内信列表/已读）与审批通知（审批操作后自动发信）等模块共用。
// 本文件为共享契约：导出名、参数与返回结构固定，实施 agent 不得修改签名；如需扩展请先协调。

const MESSAGES_KEY = 'bidding-messages'

export const MESSAGE_TYPES = [
  { value: 'approval', label: '审批通知' },
  { value: 'system', label: '系统消息' },
  { value: 'notice', label: '公告通知' }
]

// 消息：{ id, toRole, toUser?, title, content, type, read, createdAt }
// toRole 为角色名（招标人/招标代理/投标人/评标专家/平台管理员 或 采购管理部/需求部门）；
// toUser 可选，指定具体账号/姓名时优先于 toRole 匹配
const defaultMessages = [
  {
    id: 'msg-1',
    toRole: '采购管理部',
    toUser: '',
    title: '【审批待办】物业保洁服务采购',
    content: '李四 提交了采购需求「物业保洁服务采购」发布申请，请及时审批。',
    type: 'approval',
    read: false,
    createdAt: '2026-07-12 10:00'
  },
  {
    id: 'msg-2',
    toRole: '招标人',
    toUser: '张三',
    title: '【审批通过】物业服务采购项目中标结果',
    content: '您提交的中标结果审批已由采购管理部审批通过，可发布中标公告。',
    type: 'approval',
    read: true,
    createdAt: '2026-07-04 09:30'
  },
  {
    id: 'msg-3',
    toRole: '投标人',
    toUser: '',
    title: '平台系统维护公告（7月12日凌晨）',
    content: '平台将于7月12日凌晨2:00-4:00进行系统维护，维护期间部分功能可能无法使用。',
    type: 'system',
    read: false,
    createdAt: '2026-07-06 08:00'
  }
]

function load(key, defaults) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : defaults
  } catch {
    return defaults
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore storage errors
  }
}

function nowString() {
  return new Date().toLocaleString()
}

export const messageStore = {
  // filter 支持 { toRole, toUser, type, read } 字段精确匹配
  list(filter) {
    const all = load(MESSAGES_KEY, defaultMessages)
    if (!filter) return all
    return all.filter((item) =>
      Object.entries(filter).every(([k, v]) => {
        if (v === undefined || v === null || v === '') return true
        return String(item[k]) === String(v)
      })
    )
  },
  saveAll(list) {
    save(MESSAGES_KEY, list)
  },
  get(id) {
    return this.list().find((item) => String(item.id) === String(id)) || null
  },
  // 新增消息：{ toRole, toUser?, title, content, type?, ... }，返回带 id/read/createdAt 的完整对象
  add(msg) {
    const all = this.list()
    const next = {
      toUser: '',
      type: 'system',
      ...msg,
      id: msg.id || `msg-${Date.now()}`,
      read: false,
      createdAt: msg.createdAt || nowString()
    }
    all.unshift(next)
    this.saveAll(all)
    return next
  },
  markRead(id) {
    const all = this.list()
    const idx = all.findIndex((item) => String(item.id) === String(id))
    if (idx === -1) return null
    all[idx] = { ...all[idx], read: true }
    this.saveAll(all)
    return all[idx]
  },
  // 角色（或具体人员）未读数：toRole 或 toUser 命中即计入
  unreadCount(role) {
    if (!role) return 0
    return this.list({ read: false }).filter(
      (item) => item.toRole === role || item.toUser === role
    ).length
  }
}
