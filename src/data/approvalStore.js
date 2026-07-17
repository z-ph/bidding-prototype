// 审批流 mock 数据存储（localStorage 持久化）
// 供 ApprovalCenter（待办/已办/我发起的）、ApprovalFlowConfig（审批流配置）、
// 采购需求/招标文件发布接入审批、审批归档视图、站内信审批通知共享。
// 本文件为共享契约：导出名、参数与返回结构固定，实施 agent 不得修改签名；如需扩展请先协调。

const APPROVALS_KEY = 'bidding-approvals'
const FLOW_CONFIGS_KEY = 'bidding-approval-flows'

// 审批节点类型（清单 48：需求/招标文件/中标结果三节点）
export const APPROVAL_TYPES = [
  { value: 'requirement', label: '采购需求' },
  { value: 'tender-doc', label: '招标文件' },
  { value: 'award-result', label: '中标结果' }
]

export const APPROVAL_STATUS_MAP = {
  pending: { label: '审批中', color: 'processing' },
  approved: { label: '已通过', color: 'success' },
  rejected: { label: '已驳回', color: 'error' }
}

export const APPROVAL_ACTIONS = ['approve', 'reject', 'add-sign', 'transfer', 'return']

// 审批链模板：按发布者类型（publisherKind）给出节点链（清单 14/22）
// agent（招标代理发布）→ [采购管理部]；self（招标人发布）→ [需求部门, 采购管理部]
export const DEFAULT_CHAINS = {
  agent: ['采购管理部'],
  self: ['需求部门', '采购管理部']
}

// 审批流配置 seed：status draft（未发布）/ published（已发布启用）/ disabled（停用）
// 未发布或停用的流程不作用于新发起的审批单（清单 55）
const defaultFlowConfigs = [
  {
    id: 'flow-1',
    name: '代理发布审批流',
    publisherKind: 'agent',
    chain: ['采购管理部'],
    status: 'published',
    remark: '招标代理发布的需求/招标文件，由招标人（采购管理部）审核',
    updatedAt: '2026-07-10 09:00',
    publishedAt: '2026-07-10 09:30'
  },
  {
    id: 'flow-2',
    name: '招标人发布审批流',
    publisherKind: 'self',
    chain: ['需求部门', '采购管理部'],
    status: 'published',
    remark: '招标人自行发布，依次经需求部门、采购管理部审核',
    updatedAt: '2026-07-10 09:00',
    publishedAt: '2026-07-10 09:30'
  }
]

// 审批单实例 seed
// chain 为节点名数组；currentNodeIndex 指向当前待审节点；currentAssignee 非空时优先按具体人匹配待办（转办/加签场景）
const defaultApprovals = [
  {
    id: 'ap-1',
    type: 'requirement',
    refId: 'REQ20260714002',
    title: '物业保洁服务采购',
    projectId: '',
    submittedBy: '李四',
    publisherKind: 'agent',
    chain: ['采购管理部'],
    currentNodeIndex: 0,
    currentAssignee: '',
    status: 'pending',
    submittedAt: '2026-07-12 10:00',
    finishedAt: '',
    records: []
  },
  {
    id: 'ap-2',
    type: 'tender-doc',
    refId: 'td-1-1',
    title: 'XX市轨道交通设备采购项目 招标文件 V1.0 发布',
    projectId: '1',
    submittedBy: '张三',
    publisherKind: 'self',
    chain: ['需求部门', '采购管理部'],
    currentNodeIndex: 1,
    currentAssignee: '',
    status: 'pending',
    submittedAt: '2026-07-08 09:00',
    finishedAt: '',
    records: [
      { node: '需求部门', action: 'approve', actor: '王五', comment: '需求已核实，同意。', at: '2026-07-08 14:20' }
    ]
  },
  {
    id: 'ap-3',
    type: 'award-result',
    refId: 'award-4',
    title: '物业服务采购项目 中标结果审批登记',
    projectId: '4',
    submittedBy: '赵工',
    publisherKind: 'agent',
    chain: ['采购管理部'],
    currentNodeIndex: 1,
    currentAssignee: '',
    status: 'approved',
    submittedAt: '2026-07-03 11:00',
    finishedAt: '2026-07-04 09:30',
    records: [
      { node: '采购管理部', action: 'approve', actor: '张三', comment: '中标结果审批通过，准予发布。', at: '2026-07-04 09:30' }
    ]
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

function generateId() {
  return `ap-${Date.now()}`
}

function matchesFilter(item, filter = {}) {
  return Object.entries(filter).every(([k, v]) => {
    if (v === undefined || v === null || v === '') return true
    return String(item[k]) === String(v)
  })
}

export const approvalStore = {
  // ---------- 审批单实例 ----------
  // filter 支持 { status, type, submittedBy, projectId } 等字段精确匹配
  list(filter) {
    const all = load(APPROVALS_KEY, defaultApprovals)
    return filter ? all.filter((item) => matchesFilter(item, filter)) : all
  },
  saveAll(list) {
    save(APPROVALS_KEY, list)
  },
  get(id) {
    return this.list().find((item) => String(item.id) === String(id)) || null
  },
  // 按发布者类型取当前生效的审批链：优先已发布启用的流程配置，缺失时回退默认链
  resolveChain(publisherKind) {
    const kind = publisherKind === 'self' ? 'self' : 'agent'
    const config = this.getFlowConfigs().find(
      (f) => f.publisherKind === kind && f.status === 'published'
    )
    const chain = config?.chain?.length ? config.chain : DEFAULT_CHAINS[kind]
    return [...chain]
  },
  // 创建审批单：{ type, refId, title, publisherKind, submittedBy, projectId? }
  create({ type, refId, title, publisherKind = 'agent', submittedBy = '', projectId = '' }) {
    const instance = {
      id: generateId(),
      type,
      refId: String(refId ?? ''),
      title: title || '',
      projectId: projectId ? String(projectId) : '',
      submittedBy,
      publisherKind: publisherKind === 'self' ? 'self' : 'agent',
      chain: this.resolveChain(publisherKind),
      currentNodeIndex: 0,
      currentAssignee: '',
      status: 'pending',
      submittedAt: nowString(),
      finishedAt: '',
      records: []
    }
    const all = this.list()
    all.unshift(instance)
    this.saveAll(all)
    return instance
  },
  // 审批操作：action ∈ approve / reject / add-sign / transfer / return
  // approve 末级通过后 status→approved；reject 后 status→rejected 退回经办人；
  // add-sign 将 target 加签到当前节点之前（target 先审）；transfer 将当前节点转给 target 办理；
  // return 退回上一节点。target 仅 add-sign/transfer 使用。
  act(id, action, actor, comment = '', target = '') {
    const all = this.list()
    const idx = all.findIndex((item) => String(item.id) === String(id))
    if (idx === -1) return null
    const item = all[idx]
    if (item.status !== 'pending') return item
    const node = item.chain[item.currentNodeIndex] || ''
    item.records = [
      ...item.records,
      { node, action, actor: actor || '', comment: comment || '', at: nowString() }
    ]
    if (action === 'approve') {
      if (item.currentNodeIndex >= item.chain.length - 1) {
        item.status = 'approved'
        item.finishedAt = nowString()
      } else {
        item.currentNodeIndex += 1
      }
      item.currentAssignee = ''
    } else if (action === 'reject') {
      item.status = 'rejected'
      item.finishedAt = nowString()
      item.currentAssignee = ''
    } else if (action === 'add-sign') {
      // 加签人插入当前节点之前，先由加签人审批
      item.chain.splice(item.currentNodeIndex, 0, target || node)
      item.currentAssignee = ''
    } else if (action === 'transfer') {
      // 转办：节点不变，待办人变为 target（pendingFor 按 currentAssignee 匹配）
      item.currentAssignee = target || ''
    } else if (action === 'return') {
      item.currentNodeIndex = Math.max(0, item.currentNodeIndex - 1)
      item.currentAssignee = ''
    }
    all[idx] = item
    this.saveAll(all)
    return item
  },
  // 某角色/人员的待办：当前节点名匹配 role，或转办后 currentAssignee 匹配 role
  pendingFor(role) {
    if (!role) return []
    return this.list({ status: 'pending' }).filter((item) => {
      if (item.currentAssignee) return item.currentAssignee === role
      return item.chain[item.currentNodeIndex] === role
    })
  },
  // 某角色/人员已处理过的审批单（records 中出现其操作）
  doneBy(role) {
    if (!role) return []
    return this.list().filter((item) => item.records.some((r) => r.actor === role))
  },

  // ---------- 审批流配置（新建/修改/启停/发布，限采购管理部）----------
  getFlowConfigs() {
    return load(FLOW_CONFIGS_KEY, defaultFlowConfigs)
  },
  saveFlowConfigs(configs) {
    save(FLOW_CONFIGS_KEY, configs)
  },
  getFlowConfigById(id) {
    return this.getFlowConfigs().find((f) => String(f.id) === String(id)) || null
  },
  // 新建/修改：无 id 时创建，有 id 时合并更新
  saveFlowConfig(config) {
    const configs = this.getFlowConfigs()
    const idx = configs.findIndex((f) => String(f.id) === String(config.id))
    const saved = {
      ...config,
      id: config.id || `flow-${Date.now()}`,
      status: config.status || 'draft',
      updatedAt: nowString()
    }
    if (idx >= 0) {
      configs[idx] = { ...configs[idx], ...saved }
    } else {
      configs.unshift(saved)
    }
    this.saveFlowConfigs(configs)
    return idx >= 0 ? configs[idx] : saved
  },
  // 启停/发布：status ∈ draft（未发布）/ published（发布启用）/ disabled（停用）
  setFlowStatus(id, status) {
    const configs = this.getFlowConfigs()
    const idx = configs.findIndex((f) => String(f.id) === String(id))
    if (idx === -1) return null
    configs[idx] = {
      ...configs[idx],
      status,
      updatedAt: nowString(),
      publishedAt: status === 'published' ? nowString() : configs[idx].publishedAt
    }
    this.saveFlowConfigs(configs)
    return configs[idx]
  }
}
