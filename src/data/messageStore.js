// 站内信 mock 数据存储（纯内存静态种子，无任何持久化）
// 供 MessageCenter（站内信列表/已读）与审批通知展示共用。
// 本文件为共享契约：导出名、参数与返回结构固定。

export const MESSAGE_TYPES = [
  { value: 'approval', label: '审批通知' },
  { value: 'system', label: '系统消息' },
  { value: 'notice', label: '公告通知' }
]

// 消息：{ id, toRole, toUser?, title, content, type, read, createdAt }
const SEED_MESSAGES = [
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
    title: '【开标提醒】XX大学实验室设备采购项目今日开标',
    content: '您参与投标的「XX大学实验室设备采购项目」将于 2026-07-20 15:00 开标，请准时进入开标大厅。',
    type: 'system',
    read: false,
    createdAt: '2026-07-20 08:30'
  },
  {
    id: 'msg-4',
    toRole: '评标专家',
    toUser: '专家甲',
    title: '【评标任务】轨道交通电缆材料采购项目',
    content: '您已被抽取为「轨道交通电缆材料采购项目」评标委员会成员，请前往我的评标任务确认参加。',
    type: 'system',
    read: true,
    createdAt: '2026-07-16 11:30'
  },
  {
    id: 'msg-5',
    toRole: '投标人',
    toUser: '',
    title: '平台系统维护公告（7月12日凌晨）',
    content: '平台将于7月12日凌晨2:00-4:00进行系统维护，维护期间部分功能可能无法使用。',
    type: 'notice',
    read: false,
    createdAt: '2026-07-06 08:00'
  }
]

function clone(value) {
  return value ? JSON.parse(JSON.stringify(value)) : value
}

export const messageStore = {
  // filter 支持 { toRole, toUser, type, read } 字段精确匹配
  list(filter) {
    const all = clone(SEED_MESSAGES)
    if (!filter) return all
    return all.filter((item) =>
      Object.entries(filter).every(([k, v]) => {
        if (v === undefined || v === null || v === '') return true
        return String(item[k]) === String(v)
      })
    )
  },
  saveAll() {
    return null
  },
  get(id) {
    return this.list().find((item) => String(item.id) === String(id)) || null
  },
  // 纯演示：新增消息不写入数据
  add(msg) {
    return { toUser: '', type: 'system', ...msg, id: msg.id || 'msg-demo', read: false, createdAt: msg.createdAt || '（演示）' }
  },
  markRead(id) {
    // 纯演示：不写入数据
    return this.get(id)
  },
  // 角色（或具体人员）未读数：toRole 或 toUser 命中即计入
  unreadCount(role) {
    if (!role) return 0
    return this.list({ read: false }).filter(
      (item) => item.toRole === role || item.toUser === role
    ).length
  }
}
