// 供应商授权 mock 数据存储（localStorage 持久化）
// 供 SupplierAuthorization（招标人/代理维护授权名单）、BidDownload（招标文件下载门控）、
// BidderProjects（投标邀请书查看）共享。
// 授权为年度周期：grantedAt +1 年为 expiresAt，过期自动判定为 expired，视同未授权（概要三）。
// 本文件为共享契约：导出名、参数与返回结构固定，实施 agent 不得修改签名；如需扩展请先协调。

const AUTHORIZATIONS_KEY = 'bidding-authorizations'
const INVITATIONS_KEY = 'bidding-invitations'

export const AUTHORIZATION_STATUS_MAP = {
  authorized: { label: '已授权', color: 'success' },
  revoked: { label: '已撤销', color: 'error' },
  expired: { label: '需重新授权', color: 'warning' }
}

// 授权：{ id, projectId, supplierId, supplierName, status, grantedBy, grantedAt, expiresAt }
// grantedAt / expiresAt 为 ISO 日期字符串（YYYY-MM-DD）
const defaultAuthorizations = [
  {
    id: 'auth-1',
    projectId: '3',
    supplierId: 'sup-1',
    supplierName: 'A科技有限公司',
    status: 'authorized',
    grantedBy: '张三',
    grantedAt: '2026-07-01',
    expiresAt: '2027-07-01'
  },
  {
    id: 'auth-2',
    projectId: '3',
    supplierId: 'sup-2',
    supplierName: 'B实业有限公司',
    status: 'authorized',
    grantedBy: '张三',
    grantedAt: '2025-06-01',
    expiresAt: '2026-06-01'
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

function todayString() {
  return new Date().toISOString().slice(0, 10)
}

// 年度授权：授权日 +1 年为有效期截止
function plusOneYear(dateStr) {
  const d = new Date(dateStr)
  d.setFullYear(d.getFullYear() + 1)
  return d.toISOString().slice(0, 10)
}

// 过期自动判定：authorized 且 expiresAt 已过时改写为 expired 并持久化
function withExpiryCheck(list) {
  const today = todayString()
  let dirty = false
  const next = list.map((item) => {
    if (item.status === 'authorized' && item.expiresAt && item.expiresAt < today) {
      dirty = true
      return { ...item, status: 'expired' }
    }
    return item
  })
  if (dirty) save(AUTHORIZATIONS_KEY, next)
  return next
}

export const authorizationStore = {
  // filter 支持 { projectId, supplierId, status } 字段精确匹配；返回前已做过期判定
  list(filter) {
    const all = withExpiryCheck(load(AUTHORIZATIONS_KEY, defaultAuthorizations))
    if (!filter) return all
    return all.filter((item) =>
      Object.entries(filter).every(([k, v]) => {
        if (v === undefined || v === null || v === '') return true
        return String(item[k]) === String(v)
      })
    )
  },
  saveAll(list) {
    save(AUTHORIZATIONS_KEY, list)
  },
  // 授权（或过期/撤销后重新授权）：同项目同供应商复用原记录，重置年度有效期
  authorize({ projectId, supplierId, supplierName = '', grantedBy = '' }) {
    const all = this.list()
    const grantedAt = todayString()
    const idx = all.findIndex(
      (item) => String(item.projectId) === String(projectId) && String(item.supplierId) === String(supplierId)
    )
    const record = {
      ...(idx >= 0 ? all[idx] : {}),
      id: idx >= 0 ? all[idx].id : `auth-${Date.now()}`,
      projectId: String(projectId),
      supplierId: String(supplierId),
      supplierName,
      status: 'authorized',
      grantedBy,
      grantedAt,
      expiresAt: plusOneYear(grantedAt)
    }
    if (idx >= 0) {
      all[idx] = record
    } else {
      all.unshift(record)
    }
    this.saveAll(all)
    return record
  },
  // 撤销授权：状态置为 revoked，下载权限随之失效
  revoke(id) {
    const all = this.list()
    const idx = all.findIndex((item) => String(item.id) === String(id))
    if (idx === -1) return null
    all[idx] = { ...all[idx], status: 'revoked' }
    this.saveAll(all)
    return all[idx]
  },
  // 是否已授权：仅 status=authorized 且未过期；过期记录会被自动判定为 expired 后返回 false
  isAuthorized(projectId, supplierId) {
    return this.list().some(
      (item) =>
        String(item.projectId) === String(projectId) &&
        String(item.supplierId) === String(supplierId) &&
        item.status === 'authorized'
    )
  },

  // ---------- 投标邀请书（模板 mock，项目信息/标段/时间由页面填充）----------
  // 邀请书：{ id, projectId, supplierId, supplierName, code, generatedAt }
  getInvitations(filter) {
    const all = load(INVITATIONS_KEY, [])
    if (!filter) return all
    return all.filter((item) =>
      Object.entries(filter).every(([k, v]) => {
        if (v === undefined || v === null || v === '') return true
        return String(item[k]) === String(v)
      })
    )
  },
  // 按项目+供应商生成邀请书；已生成过则直接返回原记录（编号保持不变）
  genInvitation(projectId, supplierId) {
    const all = this.getInvitations()
    const existing = all.find(
      (item) => String(item.projectId) === String(projectId) && String(item.supplierId) === String(supplierId)
    )
    if (existing) return existing
    const date = todayString().replace(/-/g, '')
    const invitation = {
      id: `inv-${Date.now()}`,
      projectId: String(projectId),
      supplierId: String(supplierId),
      supplierName:
        this.list({ projectId, supplierId })[0]?.supplierName || '',
      code: `INV${date}${String(Math.floor(Math.random() * 9000) + 1000)}`,
      generatedAt: new Date().toLocaleString()
    }
    all.unshift(invitation)
    save(INVITATIONS_KEY, all)
    return invitation
  }
}
