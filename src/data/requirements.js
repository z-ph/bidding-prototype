// 采购需求 mock 数据存储（纯内存静态种子，无任何持久化）
// 状态：draft / published / approved / rejected

export const DEFAULT_REQUIREMENT_TYPES = [
  { value: 'goods', label: '货物类' },
  { value: 'service', label: '服务类' },
  { value: 'project', label: '工程类' },
  { value: 'it', label: '信息化类' }
]

// 演示种子：覆盖草稿/已发布（审批中）/已审核/已驳回四种状态
export const SEED_REQUIREMENTS = [
  {
    id: 'REQ20260714002',
    title: '物业保洁服务采购',
    type: 'service',
    budget: 320,
    content: '办公区域、公共区域日常保洁服务（一年期），含保洁人员 20 名及设备耗材。',
    status: 'published',
    publisher: '李四',
    createTime: '2026-07-12 10:00',
    publishTime: '2026-07-12 10:30'
  },
  {
    id: 'REQ20260703001',
    title: '大学实验室设备采购需求',
    type: 'goods',
    budget: 560,
    content: '实验室精密仪器与常用耗材采购，需满足教学科研使用要求。',
    status: 'approved',
    publisher: '张三',
    createTime: '2026-07-01 09:00',
    publishTime: '2026-07-03 09:00'
  },
  {
    id: 'REQ20260719003',
    title: '办公楼装修工程需求',
    type: 'project',
    budget: 880,
    content: '办公楼三层整体装修改造，含水电改造与消防工程。',
    status: 'draft',
    publisher: '张三',
    createTime: '2026-07-19 15:00',
    publishTime: ''
  },
  {
    id: 'REQ20260710004',
    title: '机房空调维保服务需求',
    type: 'it',
    budget: 45,
    content: '中心机房精密空调年度维保服务。',
    status: 'rejected',
    publisher: '李四',
    createTime: '2026-07-10 14:00',
    publishTime: '',
    rejectReason: '预算超出限额标准，请调整后重新申报。'
  }
]

export const requirementStore = {
  getTypes() {
    return DEFAULT_REQUIREMENT_TYPES.map((t) => ({ ...t }))
  },
  saveTypes() {
    return null
  },
  getRequirements() {
    return SEED_REQUIREMENTS.map((r) => ({ ...r }))
  },
  saveRequirements() {
    return null
  },
  getRequirementById(id) {
    const found = SEED_REQUIREMENTS.find((r) => String(r.id) === String(id))
    return found ? { ...found } : undefined
  },
  getPublishedRequirements() {
    return this.getRequirements().filter((r) => r.status === 'published' || r.status === 'approved')
  },
  saveRequirement(requirement) {
    // 纯演示：不保存数据
    return requirement
  },
  updateStatus() {
    return null
  }
}

export const REQUIREMENT_STATUS_MAP = {
  draft: { label: '草稿', color: 'default' },
  published: { label: '已发布', color: 'processing' },
  approved: { label: '已审核', color: 'success' },
  rejected: { label: '已驳回', color: 'error' }
}
