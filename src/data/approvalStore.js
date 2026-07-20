// 审批流 mock 数据存储（纯内存静态种子，无任何持久化）
// 供 ApprovalCenter（待办/已办/我发起的）、ApprovalFlowConfig（审批流配置）、
// 采购需求/招标文件发布接入审批、审批归档视图、站内信审批通知共享。
// 本文件为共享契约：导出名、参数与返回结构固定。

// 审批节点类型：项目立项/采购需求/招标文件/中标结果
export const APPROVAL_TYPES = [
  { value: 'project', label: '项目立项' },
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

// 审批链模板：按发布者类型（publisherKind）给出节点链
export const DEFAULT_CHAINS = {
  agent: ['采购管理部'],
  self: ['需求部门', '采购管理部']
}

// 审批流配置 seed：status draft（未发布）/ published（已发布启用）/ disabled（停用）
const SEED_FLOW_CONFIGS = [
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

// 审批单实例 seed：项目 8 立项审批中、项目 2 需求审批中（代理发起）、项目 1 招标文件审批中（第二节点）、
// 项目 1 立项已通过、项目 4 中标结果已通过
const SEED_APPROVALS = [
  {
    id: 'ap-4',
    type: 'project',
    refId: '8',
    title: '信息化系统运维服务项目 立项审批',
    projectId: '8',
    submittedBy: '张三',
    publisherKind: 'self',
    chain: ['需求部门', '采购管理部'],
    currentNodeIndex: 0,
    currentAssignee: '',
    status: 'pending',
    submittedAt: '2026-07-18 11:30',
    finishedAt: '',
    records: []
  },
  {
    id: 'ap-5',
    type: 'project',
    refId: '1',
    title: 'XX市轨道交通设备采购项目 立项审批',
    projectId: '1',
    submittedBy: '张三',
    publisherKind: 'self',
    chain: ['需求部门', '采购管理部'],
    currentNodeIndex: 2,
    currentAssignee: '',
    status: 'approved',
    submittedAt: '2026-07-01 10:00',
    finishedAt: '2026-07-02 15:00',
    records: [
      { node: '需求部门', action: 'approve', actor: '王五', comment: '立项依据充分，同意。', at: '2026-07-01 16:00' },
      { node: '采购管理部', action: 'approve', actor: '张三', comment: '同意立项，按计划推进。', at: '2026-07-02 15:00' }
    ]
  },
  {
    id: 'ap-1',
    type: 'requirement',
    refId: 'REQ20260714002',
    title: '物业保洁服务采购',
    projectId: '2',
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

function clone(value) {
  return value ? JSON.parse(JSON.stringify(value)) : value
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
    const all = clone(SEED_APPROVALS)
    return filter ? all.filter((item) => matchesFilter(item, filter)) : all
  },
  saveAll() {
    return null
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
  // 纯演示：创建审批单不写入数据，返回构造好的实例供展示
  create({ type, refId, title, publisherKind = 'agent', submittedBy = '', projectId = '' }) {
    return {
      id: 'ap-demo',
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
      submittedAt: '（演示）',
      finishedAt: '',
      records: []
    }
  },
  // 纯演示：审批操作不写入数据，原样返回该审批单
  act(id) {
    return this.get(id)
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

  // ---------- 审批流配置 ----------
  getFlowConfigs() {
    return clone(SEED_FLOW_CONFIGS)
  },
  saveFlowConfigs() {
    return null
  },
  getFlowConfigById(id) {
    return this.getFlowConfigs().find((f) => String(f.id) === String(id)) || null
  },
  saveFlowConfig(config) {
    // 纯演示：不保存数据
    return config
  },
  setFlowStatus(id, status) {
    // 纯演示：不保存数据
    const found = this.getFlowConfigById(id)
    return found ? { ...found, status } : null
  }
}
