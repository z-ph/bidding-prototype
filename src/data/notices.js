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

// 演示环境不再预置 mock 数据；所有公告均通过页面 CRUD 写入 localStorage
const defaultNotices = []

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
