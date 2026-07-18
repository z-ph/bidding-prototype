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

// 演示环境不再预置 mock 数据；所有采购需求均通过页面 CRUD 写入 localStorage
const defaultRequirements = []

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
    const saved = idx >= 0
      ? { ...requirements[idx], ...requirement }
      : {
          ...requirement,
          id: requirement.id || generateId(),
          createTime: requirement.createTime || new Date().toISOString().slice(0, 10)
        }
    if (idx >= 0) {
      requirements[idx] = saved
    } else {
      requirements.unshift(saved)
    }
    this.saveRequirements(requirements)
    return saved
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
