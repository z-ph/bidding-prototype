// 公告全生命周期 mock 数据存储
// 支持草稿、已发布、已撤回三种状态，含标段关联与变更原因

const NOTICES_KEY = 'admin-notices-v2'

export const NOTICE_TYPES = [
  { label: '招标公告', value: 'tender', tagType: 'primary' },
  { label: '变更公告', value: 'change', tagType: 'warning' },
  { label: '澄清公告', value: 'clarification', tagType: 'processing' },
  { label: '候选人公示', value: 'candidate', tagType: 'success' },
  { label: '中标公告', value: 'result', tagType: 'info' }
]

export const NOTICE_STATUS = {
  draft: { text: '草稿', color: 'default' },
  published: { text: '已发布', color: 'success' },
  withdrawn: { text: '已撤回', color: 'error' }
}

export function getTypeName(value) {
  return NOTICE_TYPES.find((t) => t.value === value)?.label || value
}

export function getTagType(value) {
  return NOTICE_TYPES.find((t) => t.value === value)?.tagType || 'default'
}

function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`
}

const defaultNotices = [
  {
    id: 1,
    title: 'XX市轨道交通设备采购项目招标公告',
    type: 'tender',
    typeName: '招标公告',
    tagType: 'primary',
    status: 'published',
    projectId: 1,
    projectName: 'XX市轨道交通设备采购项目',
    packages: [
      { id: 'B1', name: '第一标段：主设备' },
      { id: 'B2', name: '第二标段：辅材' }
    ],
    changeReason: '',
    purchaseMode: '公开招标',
    publishTime: '2026-07-01 09:00:00',
    deadline: '2026-07-20 17:00:00',
    registerStart: '2026-07-01 09:00:00',
    registerEnd: '2026-07-20 17:00:00',
    content: '本项目为XX市轨道交通设备采购，采购内容包括主设备、辅材及配套服务。欢迎具备相应资质的供应商报名参加。',
    attachments: [
      { name: '招标文件.pdf', size: '2.5MB' },
      { name: '技术规格书.docx', size: '1.1MB' }
    ],
    channels: ['平台门户', '电子招投标系统'],
    canRegister: true
  },
  {
    id: 2,
    title: '办公桌椅采购项目变更公告',
    type: 'change',
    typeName: '变更公告',
    tagType: 'warning',
    status: 'published',
    projectId: 2,
    projectName: '办公桌椅采购项目',
    packages: [
      { id: 'B1', name: '标段一：办公桌椅' }
    ],
    changeReason: '因采购需求调整，办公桌椅采购项目报名时间延长至2026年7月18日，技术参数详见附件。',
    purchaseMode: '公开询比价',
    publishTime: '2026-07-02 09:00:00',
    deadline: '2026-07-18 17:00:00',
    registerStart: '2026-07-02 09:00:00',
    registerEnd: '2026-07-18 17:00:00',
    content: '因采购需求调整，办公桌椅采购项目报名时间延长至2026年7月18日，技术参数详见附件。',
    attachments: [{ name: '变更说明.pdf', size: '300KB' }],
    channels: ['平台门户'],
    canRegister: false
  },
  {
    id: 3,
    title: '软件开发服务项目中标候选人公示',
    type: 'candidate',
    typeName: '候选人公示',
    tagType: 'success',
    status: 'published',
    projectId: 3,
    projectName: '软件开发服务项目',
    packages: [
      { id: 'B1', name: '标段一：定制开发' }
    ],
    changeReason: '',
    purchaseMode: '邀请招标',
    publishTime: '2026-07-03 09:00:00',
    deadline: '-',
    registerStart: '',
    registerEnd: '',
    content: '根据评标委员会评审结果，现将软件开发服务项目中标候选人公示如下...',
    attachments: [{ name: '候选人公示.pdf', size: '500KB' }],
    channels: ['平台门户', '电子招投标系统'],
    canRegister: false
  },
  {
    id: 4,
    title: '物业服务采购项目中标公告',
    type: 'result',
    typeName: '中标公告',
    tagType: 'info',
    status: 'published',
    projectId: 4,
    projectName: '物业服务采购项目',
    packages: [
      { id: 'B1', name: '标段一：保洁服务' },
      { id: 'B2', name: '标段二：安保服务' }
    ],
    changeReason: '',
    purchaseMode: '公开招标',
    publishTime: '2026-07-04 09:00:00',
    deadline: '-',
    registerStart: '',
    registerEnd: '',
    content: '物业服务采购项目已完成评标，现将中标结果公告如下...',
    attachments: [{ name: '中标公告.pdf', size: '400KB' }],
    channels: ['平台门户'],
    canRegister: false
  },
  {
    id: 5,
    title: '实验室设备采购项目招标公告',
    type: 'tender',
    typeName: '招标公告',
    tagType: 'primary',
    status: 'published',
    projectId: 5,
    projectName: '实验室设备采购项目',
    packages: [
      { id: 'B1', name: '标段一：精密仪器' },
      { id: 'B2', name: '标段二：实验家具' }
    ],
    changeReason: '',
    purchaseMode: '公开招标',
    publishTime: '2026-07-05 09:00:00',
    deadline: '2026-07-25 17:00:00',
    registerStart: '2026-07-05 09:00:00',
    registerEnd: '2026-07-25 17:00:00',
    content: '实验室设备采购项目现公开招标，欢迎具备相关资质的供应商参与投标。',
    attachments: [
      { name: '招标公告.pdf', size: '1.8MB' },
      { name: '设备清单.xlsx', size: '600KB' }
    ],
    channels: ['平台门户', '电子招投标系统'],
    canRegister: true
  },
  {
    id: 6,
    title: '网络设备采购项目澄清公告（草稿）',
    type: 'clarification',
    typeName: '澄清公告',
    tagType: 'processing',
    status: 'draft',
    projectId: 1,
    projectName: 'XX市轨道交通设备采购项目',
    packages: [
      { id: 'B1', name: '第一标段：主设备' }
    ],
    changeReason: '',
    purchaseMode: '公开招标',
    publishTime: '',
    deadline: '2026-07-22 17:00:00',
    registerStart: '',
    registerEnd: '',
    content: '针对投标人提出的疑问，现就招标文件第3章技术参数进行澄清说明。',
    attachments: [],
    channels: ['平台门户'],
    canRegister: false
  },
  {
    id: 7,
    title: '办公家具补充采购候选人公示',
    type: 'candidate',
    typeName: '候选人公示',
    tagType: 'success',
    status: 'withdrawn',
    projectId: 2,
    projectName: '办公桌椅采购项目',
    packages: [
      { id: 'B1', name: '标段一：办公桌椅' }
    ],
    changeReason: '',
    purchaseMode: '公开询比价',
    publishTime: '2026-07-06 09:00:00',
    deadline: '-',
    registerStart: '',
    registerEnd: '',
    content: '因公示信息需要复核，现撤回原公示，重新发布以更正候选人排序。',
    attachments: [{ name: '撤回说明.pdf', size: '200KB' }],
    channels: ['平台门户'],
    canRegister: false
  }
]

function load() {
  try {
    const raw = localStorage.getItem(NOTICES_KEY)
    return raw ? JSON.parse(raw) : defaultNotices
  } catch {
    return defaultNotices
  }
}

function save(notices) {
  try {
    localStorage.setItem(NOTICES_KEY, JSON.stringify(notices))
  } catch {
    // ignore storage errors
  }
}

export const noticeStore = {
  getNotices() {
    return load()
  },
  saveNotices(notices) {
    save(notices)
  },
  getNoticeById(id) {
    return this.getNotices().find((n) => String(n.id) === String(id))
  },
  addNotice(notice) {
    const notices = this.getNotices()
    const next = { ...notice, id: notice.id || Date.now() }
    notices.unshift(next)
    this.saveNotices(notices)
    return next
  },
  updateNotice(id, patch) {
    const notices = this.getNotices()
    const idx = notices.findIndex((n) => String(n.id) === String(id))
    if (idx === -1) return null
    const next = { ...notices[idx], ...patch, id: notices[idx].id }
    notices.splice(idx, 1, next)
    this.saveNotices(notices)
    return next
  },
  withdrawNotice(id) {
    return this.updateNotice(id, { status: 'withdrawn' })
  },
  buildAttachments(fileList) {
    return (fileList || []).map((f) => ({
      name: f.name,
      size: typeof f.size === 'number' ? formatSize(f.size) : (f.size || '')
    }))
  }
}
