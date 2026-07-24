// 供应商台账数据存储（localStorage 持久化）
// localStorage key: bidding-suppliers
// 与 SupplierProfile 的企业档案数据独立，本 store 为管理员/采购单位视角的供应商登记台账

const STORAGE_KEY = 'bidding-suppliers'

const DEFAULT_SUPPLIERS = [
  { id: 'S001', name: 'A科技有限公司', creditCode: '91110000XXXXXXXX', contact: '张总', phone: '13800138001', type: '材料供应商', status: '已认证', registerDate: '2026-01-15', projects: ['1', '5'] },
  { id: 'S002', name: 'B实业有限公司', creditCode: '91110000YYYYYYYY', contact: '李经理', phone: '13800138002', type: '劳务供应商', status: '已认证', registerDate: '2026-02-20', projects: ['1', '3'] },
  { id: 'S003', name: 'C股份有限公司', creditCode: '91110000ZZZZZZZZ', contact: '王工', phone: '13800138003', type: '服务供应商', status: '待审核', registerDate: '2026-03-10', projects: ['1', '5'] },
  { id: 'S004', name: 'D建材有限公司', creditCode: '91110000AAAAAAA', contact: '赵经理', phone: '13800138004', type: '材料供应商', status: '已认证', registerDate: '2026-04-05', projects: ['2', '4'] }
]

function loadSuppliers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch {
    // ignore parse errors
  }
  // 首次加载：写入种子数据
  saveSuppliers(DEFAULT_SUPPLIERS)
  return DEFAULT_SUPPLIERS.map((s) => ({ ...s }))
}

function saveSuppliers(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // ignore storage errors
  }
}

// 内存缓存，避免频繁读 localStorage
let _cache = null

function getCached() {
  if (!_cache) {
    _cache = loadSuppliers()
  }
  return _cache
}

function persist() {
  saveSuppliers(_cache)
}

/** 返回供应商列表（浅拷贝） */
export function getSuppliers() {
  return getCached().map((s) => ({ ...s }))
}

/** 返回单个供应商详情（浅拷贝） */
export function getSupplier(id) {
  const found = getCached().find((s) => s.id === id)
  return found ? { ...found } : null
}

/** 更新供应商信息（返回更新后的对象，未找到返回 null） */
export function updateSupplier(id, data) {
  const list = getCached()
  const idx = list.findIndex((s) => s.id === id)
  if (idx === -1) return null
  list[idx] = { ...list[idx], ...data }
  persist()
  return { ...list[idx] }
}

/** 更新供应商认证状态（管理员审核用） */
export function updateSupplierStatus(id, status) {
  return updateSupplier(id, { status })
}

/** 新增供应商 */
export function addSupplier(data) {
  const list = getCached()
  const newId = 'S' + String(Date.now()).slice(-6)
  const supplier = {
    id: newId,
    ...data,
    registerDate: new Date().toISOString().slice(0, 10)
  }
  list.push(supplier)
  persist()
  return { ...supplier }
}
