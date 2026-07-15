// 采购需求 mock 数据存储
// 使用 localStorage 持久化，状态：draft / published / approved / rejected

const REQUIREMENTS_KEY = 'procurement-requirements'
const REQUIREMENT_TYPES_KEY = 'procurement-requirement-types'

const defaultRequirementTypes = [
  { value: 'goods', label: '货物类' },
  { value: 'service', label: '服务类' },
  { value: 'project', label: '工程类' },
  { value: 'it', label: '信息化类' }
]

const defaultRequirements = [
  {
    id: 'REQ20260714001',
    title: '2026年度办公电脑集中采购',
    type: 'goods',
    budget: 80,
    content: '采购台式电脑、笔记本电脑及配套显示器约 120 台，要求三年质保。',
    status: 'approved',
    publisher: '张三',
    publishTime: '2026-07-10',
    createTime: '2026-07-08'
  },
  {
    id: 'REQ20260714002',
    title: '物业保洁服务采购',
    type: 'service',
    budget: 45,
    content: '年度物业保洁服务，服务范围包括办公楼公共区域及会议室。',
    status: 'published',
    publisher: '李四',
    publishTime: '2026-07-12',
    createTime: '2026-07-11'
  },
  {
    id: 'REQ20260714003',
    title: '实验室通风系统改造',
    type: 'project',
    budget: 120,
    content: '实验室通风系统设计与施工，包含排风、净化及自控系统。',
    status: 'draft',
    publisher: '张三',
    publishTime: '',
    createTime: '2026-07-14'
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

function generateId() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const seq = String(Math.floor(Math.random() * 9000) + 1000)
  return `REQ${date}${seq}`
}

export const requirementStore = {
  getTypes() {
    return load(REQUIREMENT_TYPES_KEY, defaultRequirementTypes)
  },
  saveTypes(types) {
    save(REQUIREMENT_TYPES_KEY, types)
  },
  getRequirements() {
    return load(REQUIREMENTS_KEY, defaultRequirements)
  },
  saveRequirements(requirements) {
    save(REQUIREMENTS_KEY, requirements)
  },
  getRequirementById(id) {
    return this.getRequirements().find((r) => String(r.id) === String(id))
  },
  getPublishedRequirements() {
    return this.getRequirements().filter((r) => r.status === 'published' || r.status === 'approved')
  },
  saveRequirement(requirement) {
    const requirements = this.getRequirements()
    const idx = requirements.findIndex((r) => String(r.id) === String(requirement.id))
    if (idx >= 0) {
      requirements[idx] = { ...requirements[idx], ...requirement }
    } else {
      requirements.unshift({
        ...requirement,
        id: requirement.id || generateId(),
        createTime: requirement.createTime || new Date().toISOString().slice(0, 10)
      })
    }
    this.saveRequirements(requirements)
  },
  updateStatus(id, status) {
    const requirement = this.getRequirementById(id)
    if (!requirement) return
    const update = { status }
    if (status === 'published' && !requirement.publishTime) {
      update.publishTime = new Date().toISOString().slice(0, 10)
    }
    this.saveRequirement({ ...requirement, ...update })
  }
}

export const REQUIREMENT_STATUS_MAP = {
  draft: { label: '草稿', color: 'default' },
  published: { label: '已发布', color: 'processing' },
  approved: { label: '已审核', color: 'success' },
  rejected: { label: '已驳回', color: 'error' }
}
