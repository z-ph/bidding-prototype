// 公告全生命周期 mock 数据存储（纯内存静态种子，无任何持久化）
// 支持草稿、已发布、已撤回三种状态，含标段关联与变更原因

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

// 种子：与项目 1/3/4/5/6 的公告状态对齐；含一条草稿与一条变更公告
const SEED_NOTICES = [
  {
    id: 'nt-1',
    title: 'XX市轨道交通设备采购项目招标公告',
    type: 'tender',
    typeName: '招标公告',
    projectId: '1',
    projectName: 'XX市轨道交通设备采购项目',
    code: 'GG20260708001',
    status: 'published',
    publishTime: '2026-07-08',
    content: 'XX市轨道交通设备采购项目已具备招标条件，现进行公开招标。投标截止时间：2026-07-25 17:00，开标时间：2026-07-26 09:30。',
    attachments: [{ name: '招标公告.pdf', size: '320KB' }]
  },
  {
    id: 'nt-2',
    title: 'XX大学实验室设备采购项目招标公告',
    type: 'tender',
    typeName: '招标公告',
    projectId: '3',
    projectName: 'XX大学实验室设备采购项目',
    code: 'GG20260705002',
    status: 'published',
    publishTime: '2026-07-05',
    content: 'XX大学实验室设备采购项目已具备招标条件，现进行公开招标。投标截止时间：2026-07-20 10:00，开标时间：2026-07-20 15:00。',
    attachments: [{ name: '招标公告.pdf', size: '298KB' }]
  },
  {
    id: 'nt-3',
    title: '物业服务采购项目中标公告',
    type: 'result',
    typeName: '中标公告',
    projectId: '4',
    projectName: '物业服务采购项目',
    code: 'GG20260712003',
    status: 'published',
    publishTime: '2026-07-12',
    content: '物业服务采购项目评标工作已结束，中标人：A科技有限公司，中标金额：462 万元。',
    attachments: []
  },
  {
    id: 'nt-4',
    title: '轨道交通电缆材料采购项目招标公告',
    type: 'tender',
    typeName: '招标公告',
    projectId: '5',
    projectName: '轨道交通电缆材料采购项目',
    code: 'GG20260706004',
    status: 'published',
    publishTime: '2026-07-06',
    content: '轨道交通电缆材料采购项目已具备招标条件，现进行公开招标。投标截止时间：2026-07-14 17:00。',
    attachments: []
  },
  {
    id: 'nt-5',
    title: 'XX大学实验室设备采购项目变更公告',
    type: 'change',
    typeName: '变更公告',
    projectId: '3',
    projectName: 'XX大学实验室设备采购项目',
    code: 'GG20260710005',
    status: 'published',
    publishTime: '2026-07-10',
    content: '因采购需求调整，第二标段（实验耗材）最高限价由 200 万元调整为 180 万元，其余内容不变。',
    attachments: []
  },
  {
    id: 'nt-6',
    title: '办公耗材框架协议采购项目询价公告',
    type: 'tender',
    typeName: '招标公告',
    projectId: '6',
    projectName: '办公耗材框架协议采购项目',
    code: 'GG20260715006',
    status: 'published',
    publishTime: '2026-07-15',
    content: '办公耗材框架协议采购项目采用邀请询比价方式采购，报价截止时间：2026-07-24 17:00。',
    attachments: []
  },
  {
    id: 'nt-7',
    title: '物业保洁服务采购项目招标公告（草稿）',
    type: 'tender',
    typeName: '招标公告',
    projectId: '2',
    projectName: '物业保洁服务采购项目',
    code: '',
    status: 'draft',
    publishTime: '',
    content: '物业保洁服务采购项目招标公告草稿，待审批通过后发布。',
    attachments: []
  }
]

function clone(value) {
  return value ? JSON.parse(JSON.stringify(value)) : value
}

export const noticeStore = {
  getNotices() {
    return clone(SEED_NOTICES)
  },
  saveNotices() {
    return null
  },
  getNoticeById(id) {
    return this.getNotices().find((n) => String(n.id) === String(id))
  },
  addNotice(notice) {
    // 纯演示：不写入数据
    return { ...notice, id: notice.id || 'nt-demo' }
  },
  updateNotice(id, patch) {
    // 纯演示：不写入数据
    const found = this.getNoticeById(id)
    return found ? { ...found, ...patch, id: found.id } : null
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
