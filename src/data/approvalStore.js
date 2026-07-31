// 审批流 mock 数据存储（localStorage 持久化，叠加在种子之上）
// localStorage keys: bidding-approvals（审批单实例）、bidding-approval-flows（审批流配置）。
// 2026-07-27 口径（docs/20260727-会议记录概要.md 五.5）：整个平台只有一个审核点——发布审核。
// 0731 定名口径：项目的前置审批在 OA 完成，平台唯一审核点为「采购公告发布前审核」，单据叫「发布审核」。
// 采购需求/采购文件不再产生审批；中选结果审批在系统外完成，系统内只登记结果（0717 清单 31，
// 登记数据存于项目 awardRegistration 字段，不再进本 store）。
//
// 消费方：ApprovalCenter（待办/已办/我发起的/审批操作）、TodoCenter（pendingFor 待办聚合）、
// ProjectDetail（按 projectId 的审批归档展示）、ApprovalFlowConfig（审批流配置）、
// ProjectCreate（提交审核时 create 建单）。本文件为共享契约：导出名、参数与返回结构固定。

import { projectStore } from './projects.js'

/**
 * @typedef {Object} ApprovalRecord
 * @property {string} node
 * @property {string} action
 * @property {string} actor
 * @property {string} [comment]
 * @property {string} at
 */

/**
 * @typedef {Object} Approval
 * @property {string} id
 * @property {string} type
 * @property {string} refId
 * @property {string} title
 * @property {string} projectId
 * @property {string} submittedBy
 * @property {string} submittedByAccount
 * @property {string} publisherKind
 * @property {string[]} chain
 * @property {number} currentNodeIndex
 * @property {string} currentAssignee
 * @property {string} status
 * @property {string} submittedAt
 * @property {string} finishedAt
 * @property {ApprovalRecord[]} records
 */

/**
 * @typedef {Object} FlowConfig
 * @property {string} id
 * @property {string} name
 * @property {string} publisherKind
 * @property {string[]} chain
 * @property {string} status
 * @property {string} [remark]
 * @property {string} [updatedAt]
 * @property {string} [publishedAt]
 */

const APPROVALS_KEY = 'bidding-approvals'
const FLOWS_KEY = 'bidding-approval-flows'

// 审批节点类型：仅发布审核（2026-07-27 口径，原 requirement/tender-doc/award-result 已收敛）
export const APPROVAL_TYPES = [
  { value: 'project', label: '发布审核' }
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
/** @type {FlowConfig[]} */
const SEED_FLOW_CONFIGS = [
  {
    id: 'flow-1',
    name: '代理发布审批流',
    publisherKind: 'agent',
    chain: ['采购管理部'],
    status: 'published',
    remark: '采购代理提交的发布审核，由采购单位（采购管理部）审核',
    updatedAt: '2026-07-10 09:00',
    publishedAt: '2026-07-10 09:30'
  },
  {
    id: 'flow-2',
    name: '采购单位发布审批流',
    publisherKind: 'self',
    chain: ['需求部门', '采购管理部'],
    status: 'published',
    remark: '采购单位自行提交发布审核，依次经需求部门、采购管理部审核',
    updatedAt: '2026-07-10 09:00',
    publishedAt: '2026-07-10 09:30'
  }
]

// 审批单实例 seed（仅发布审核）：项目 8 发布审核中、项目 1 发布审核已通过
/** @type {Approval[]} */
const SEED_APPROVALS = [
  {
    id: 'ap-4',
    type: 'project',
    refId: '8',
    title: '信息化系统运维服务项目 发布审核',
    projectId: '8',
    submittedBy: '张三',
    submittedByAccount: 'tenderee',
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
    title: 'XX市轨道交通设备采购项目 发布审核',
    projectId: '1',
    submittedBy: '张三',
    submittedByAccount: 'tenderee',
    publisherKind: 'self',
    chain: ['需求部门', '采购管理部'],
    currentNodeIndex: 2,
    currentAssignee: '',
    status: 'approved',
    submittedAt: '2026-07-01 10:00',
    finishedAt: '2026-07-02 15:00',
    records: [
      { node: '需求部门', action: 'approve', actor: '王五', comment: '发布依据充分，同意。', at: '2026-07-01 16:00' },
      { node: '采购管理部', action: 'approve', actor: '张三', comment: '同意发布，按计划推进。', at: '2026-07-02 15:00' }
    ]
  }
]

/**
 * @template T
 * @param {T} value
 * @returns {T}
 */
function clone(value) {
  return value ? JSON.parse(JSON.stringify(value)) : value
}

/**
 * @param {string} key
 * @param {any} data
 */
function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    // ignore storage errors
  }
}

/**
 * 读取持久化数据；首次加载写入种子
 * @template T
 * @param {string} key
 * @param {T[]} seeds
 * @returns {T[]}
 */
function loadWithSeeds(key, seeds) {
  try {
    const raw = localStorage.getItem(key)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch {
    // ignore parse errors
  }
  const initial = clone(seeds)
  saveToStorage(key, initial)
  return initial
}

/** @type {Approval[] | null} */
let _approvalsCache = null
/** @type {FlowConfig[] | null} */
let _flowsCache = null

/**
 * @returns {Approval[]}
 */
function getApprovalsCached() {
  if (!_approvalsCache) {
    _approvalsCache = loadWithSeeds(APPROVALS_KEY, SEED_APPROVALS)
  }
  return _approvalsCache
}

/**
 * @returns {FlowConfig[]}
 */
function getFlowsCached() {
  if (!_flowsCache) {
    _flowsCache = loadWithSeeds(FLOWS_KEY, SEED_FLOW_CONFIGS)
  }
  return _flowsCache
}

function persistApprovals() {
  saveToStorage(APPROVALS_KEY, getApprovalsCached())
}

function persistFlows() {
  saveToStorage(FLOWS_KEY, getFlowsCached())
}

/**
 * @param {Record<string, any>} item
 * @param {Record<string, any>} [filter]
 */
function matchesFilter(item, filter = {}) {
  return Object.entries(filter).every(([k, v]) => {
    if (v === undefined || v === null || v === '') return true
    return String(item[k]) === String(v)
  })
}

/**
 * 发布审核结果联动项目状态（2026-07-27 口径）：
 * 末级通过 → 项目 pending 推进为 approved（待发布，发布采购按钮可用）；
 * 驳回 → 项目退回 draft 并记录驳回意见，经办人可修改后重新提交。
 * @param {Approval} approval
 * @param {string} [comment]
 */
function syncProjectStatus(approval, comment) {
  if (approval.type !== 'project' || !approval.projectId) return
  const project = projectStore.getProjectById(approval.projectId)
  if (!project || project.status !== 'pending') return
  const now = new Date().toLocaleString()
  if (approval.status === 'approved') {
    projectStore.saveProject({ ...project, status: 'approved', approveTime: now, rejectReason: '' })
  } else if (approval.status === 'rejected') {
    projectStore.saveProject({ ...project, status: 'draft', rejectReason: comment || '未填写原因' })
  }
}

export const approvalStore = {
  // ---------- 审批单实例 ----------
  /**
   * filter 支持 { status, type, submittedBy, projectId } 等字段精确匹配
   * @param {Record<string, any>} [filter]
   * @returns {Approval[]}
   */
  list(filter) {
    const all = clone(getApprovalsCached())
    return filter ? all.filter((item) => matchesFilter(item, filter)) : all
  },
  /**
   * 全量替换审批单并持久化（兼容既有调用方）
   * @param {Approval[]} [list]
   */
  saveAll(list) {
    _approvalsCache = (list || []).map((item) => ({ ...item }))
    persistApprovals()
    return null
  },
  /**
   * @param {string|number} id
   * @returns {Approval | null}
   */
  get(id) {
    return this.list().find((item) => String(item.id) === String(id)) || null
  },
  /**
   * 按发布者类型取当前生效的审批链：优先已发布启用的流程配置，缺失时回退默认链
   * @param {string} publisherKind
   * @returns {string[]}
   */
  resolveChain(publisherKind) {
    const kind = publisherKind === 'self' ? 'self' : 'agent'
    const config = this.getFlowConfigs().find(
      (f) => f.publisherKind === kind && f.status === 'published'
    )
    const chain = config?.chain?.length ? config.chain : DEFAULT_CHAINS[kind]
    return [...chain]
  },
  /**
   * 创建审批单并真实写入 localStorage（2026-07-27 起由 no-op 演示改为持久化）
   * submittedByAccount：提交人演示账号（2026-07-31 口径，经办/审核互斥判定依据，显示名仍用 submittedBy）
   * @param {{ type: string, refId: string|number, title?: string, publisherKind?: string, submittedBy?: string, submittedByAccount?: string, projectId?: string|number }} input
   * @returns {Approval}
   */
  create({ type, refId, title, publisherKind = 'agent', submittedBy = '', submittedByAccount = '', projectId = '' }) {
    /** @type {Approval} */
    const instance = {
      id: `ap-${Date.now()}`,
      type,
      refId: String(refId ?? ''),
      title: title || '',
      projectId: projectId ? String(projectId) : '',
      submittedBy,
      submittedByAccount,
      publisherKind: publisherKind === 'self' ? 'self' : 'agent',
      chain: this.resolveChain(publisherKind),
      currentNodeIndex: 0,
      currentAssignee: '',
      status: 'pending',
      submittedAt: new Date().toLocaleString(),
      finishedAt: '',
      records: []
    }
    getApprovalsCached().unshift(instance)
    persistApprovals()
    return { ...instance }
  },
  /**
   * 审批操作（真实写入）：approve/reject/add-sign/transfer/return。
   * approve 在末级节点办结为 approved，否则推进到下一节点；
   * reject 直接办结为 rejected（驳回必须带原因，由调用方校验）；
   * add-sign/transfer 将当前节点转给 target 办理；return 退回上一节点（首节点停留）。
   * @param {string|number} id
   * @param {string} [action]
   * @param {string} [actor]
   * @param {string} [comment]
   * @param {string} [target]
   * @returns {Approval | null}
   */
  act(id, action = 'approve', actor = '', comment = '', target = '') {
    const list = getApprovalsCached()
    const item = list.find((a) => String(a.id) === String(id))
    if (!item || item.status !== 'pending') return null
    const now = new Date().toLocaleString()
    const node = item.chain[item.currentNodeIndex] || ''
    item.records.push({ node, action, actor, comment, at: now })

    if (action === 'approve') {
      item.currentAssignee = ''
      if (item.currentNodeIndex >= item.chain.length - 1) {
        item.status = 'approved'
        item.finishedAt = now
      } else {
        item.currentNodeIndex += 1
      }
    } else if (action === 'reject') {
      item.status = 'rejected'
      item.finishedAt = now
      item.currentAssignee = ''
    } else if (action === 'add-sign' || action === 'transfer') {
      if (target) item.currentAssignee = target
    } else if (action === 'return') {
      item.currentNodeIndex = Math.max(0, item.currentNodeIndex - 1)
      item.currentAssignee = ''
    }

    persistApprovals()
    syncProjectStatus(item, comment)
    return { ...item }
  },
  /**
   * 某角色/人员的待办：当前节点名匹配 role，或转办后 currentAssignee 匹配 role
   * @param {string} role
   * @returns {Approval[]}
   */
  pendingFor(role) {
    if (!role) return []
    return this.list({ status: 'pending' }).filter((item) => {
      if (item.currentAssignee) return item.currentAssignee === role
      return item.chain[item.currentNodeIndex] === role
    })
  },
  /**
   * 某角色/人员已处理过的审批单（records 中出现其操作）
   * @param {string} role
   * @returns {Approval[]}
   */
  doneBy(role) {
    if (!role) return []
    return this.list().filter((item) => item.records.some((r) => r.actor === role))
  },

  // ---------- 审批流配置 ----------
  /**
   * @returns {FlowConfig[]}
   */
  getFlowConfigs() {
    return clone(getFlowsCached())
  },
  /**
   * 全量替换审批流配置并持久化（兼容既有调用方）
   * @param {FlowConfig[]} [configs]
   */
  saveFlowConfigs(configs) {
    _flowsCache = (configs || []).map((item) => ({ ...item }))
    persistFlows()
    return null
  },
  /**
   * @param {string|number} id
   * @returns {FlowConfig | null}
   */
  getFlowConfigById(id) {
    return this.getFlowConfigs().find((f) => String(f.id) === String(id)) || null
  },
  /**
   * 新建/更新审批流配置（按 id upsert），真实写入 localStorage
   * @param {Partial<FlowConfig>} config
   * @returns {FlowConfig}
   */
  saveFlowConfig(config) {
    const list = getFlowsCached()
    const now = new Date().toLocaleString()
    /** @type {FlowConfig} */
    const toSave = {
      id: config.id || `flow-${Date.now()}`,
      name: config.name || '未命名审批流',
      publisherKind: config.publisherKind === 'self' ? 'self' : 'agent',
      chain: [...(config.chain || [])],
      status: config.status || 'draft',
      remark: config.remark || '',
      updatedAt: now,
      publishedAt: config.publishedAt || ''
    }
    const idx = list.findIndex((f) => String(f.id) === String(toSave.id))
    if (idx >= 0) {
      toSave.publishedAt = list[idx].publishedAt || ''
      list[idx] = toSave
    } else {
      list.push(toSave)
    }
    persistFlows()
    return { ...toSave }
  },
  /**
   * 启停/发布审批流，真实写入 localStorage
   * @param {string|number} id
   * @param {string} status
   * @returns {FlowConfig | null}
   */
  setFlowStatus(id, status) {
    const list = getFlowsCached()
    const found = list.find((f) => String(f.id) === String(id))
    if (!found) return null
    found.status = status
    found.updatedAt = new Date().toLocaleString()
    if (status === 'published' && !found.publishedAt) {
      found.publishedAt = found.updatedAt
    }
    persistFlows()
    return { ...found }
  }
}
