// 供应商授权 mock 数据存储（纯内存静态种子，无任何持久化）
// 供 SupplierAuthorization（招标人/代理维护授权名单）、BidDownload（招标文件下载门控）、
// BidderProjects（投标邀请书查看）共享。
// 授权为年度周期：grantedAt +1 年为 expiresAt，过期自动判定为 expired，视同未授权。
// 本文件为共享契约：导出名、参数与返回结构固定。

export const AUTHORIZATION_STATUS_MAP = {
  authorized: { label: '已授权', color: 'success' },
  revoked: { label: '已撤销', color: 'error' },
  expired: { label: '需重新授权', color: 'warning' }
}

// 授权：{ id, projectId, supplierId, supplierName, status, grantedBy, grantedAt, expiresAt }
// 种子：项目 3（待开标）授权 A科技/ C股份，B实业 已过期（下载门控演示）
const SEED_AUTHORIZATIONS = [
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
  },
  {
    id: 'auth-3',
    projectId: '3',
    supplierId: 'sup-3',
    supplierName: 'C股份有限公司',
    status: 'authorized',
    grantedBy: '张三',
    grantedAt: '2026-07-02',
    expiresAt: '2027-07-02'
  },
  {
    id: 'auth-4',
    projectId: '1',
    supplierId: 'sup-1',
    supplierName: 'A科技有限公司',
    status: 'authorized',
    grantedBy: '张三',
    grantedAt: '2026-07-10',
    expiresAt: '2027-07-10'
  }
]

// 投标邀请书种子（模板 mock，项目信息由页面填充）
const SEED_INVITATIONS = [
  {
    id: 'inv-1',
    projectId: '3',
    supplierId: 'sup-1',
    supplierName: 'A科技有限公司',
    code: 'INV20260705001',
    generatedAt: '2026-07-05 10:00'
  },
  {
    id: 'inv-2',
    projectId: '3',
    supplierId: 'sup-2',
    supplierName: 'B实业有限公司',
    code: 'INV20260705002',
    generatedAt: '2026-07-05 10:05'
  },
  {
    id: 'inv-3',
    projectId: '3',
    supplierId: 'sup-3',
    supplierName: 'C股份有限公司',
    code: 'INV20260705003',
    generatedAt: '2026-07-05 10:10'
  }
]

function todayString() {
  return new Date().toISOString().slice(0, 10)
}

// 过期自动判定（纯读取，不落盘）：authorized 且 expiresAt 已过时视为 expired
function withExpiryCheck(list) {
  const today = todayString()
  return list.map((item) =>
    item.status === 'authorized' && item.expiresAt && item.expiresAt < today
      ? { ...item, status: 'expired' }
      : item
  )
}

function clone(value) {
  return value ? JSON.parse(JSON.stringify(value)) : value
}

export const authorizationStore = {
  // filter 支持 { projectId, supplierId, status } 字段精确匹配；返回前已做过期判定
  list(filter) {
    const all = withExpiryCheck(clone(SEED_AUTHORIZATIONS))
    if (!filter) return all
    return all.filter((item) =>
      Object.entries(filter).every(([k, v]) => {
        if (v === undefined || v === null || v === '') return true
        return String(item[k]) === String(v)
      })
    )
  },
  saveAll() {
    return null
  },
  // 纯演示：授权不写入数据
  authorize({ projectId, supplierId, supplierName = '', grantedBy = '' }) {
    const grantedAt = todayString()
    return {
      id: 'auth-demo',
      projectId: String(projectId),
      supplierId: String(supplierId),
      supplierName,
      status: 'authorized',
      grantedBy,
      grantedAt,
      expiresAt: '（演示）'
    }
  },
  revoke(id) {
    // 纯演示：不写入数据
    const found = this.list().find((item) => String(item.id) === String(id))
    return found ? { ...found, status: 'revoked' } : null
  },
  // 是否已授权：仅 status=authorized 且未过期
  isAuthorized(projectId, supplierId) {
    return this.list().some(
      (item) =>
        String(item.projectId) === String(projectId) &&
        String(item.supplierId) === String(supplierId) &&
        item.status === 'authorized'
    )
  },

  // ---------- 投标邀请书 ----------
  getInvitations(filter) {
    const all = clone(SEED_INVITATIONS)
    if (!filter) return all
    return all.filter((item) =>
      Object.entries(filter).every(([k, v]) => {
        if (v === undefined || v === null || v === '') return true
        return String(item[k]) === String(v)
      })
    )
  },
  // 按项目+供应商读取邀请书；已生成过则返回原记录，否则返回一份演示记录
  genInvitation(projectId, supplierId) {
    const all = this.getInvitations()
    const existing = all.find(
      (item) => String(item.projectId) === String(projectId) && String(item.supplierId) === String(supplierId)
    )
    if (existing) return existing
    return {
      id: 'inv-demo',
      projectId: String(projectId),
      supplierId: String(supplierId),
      supplierName: this.list({ projectId, supplierId })[0]?.supplierName || '',
      code: 'INV（演示）',
      generatedAt: '（演示）'
    }
  }
}
