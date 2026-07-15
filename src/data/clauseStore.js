// 评审条款关联 mock 存储
// 记录投标文件与招标文件评审条款的挂接关系，按项目隔离，供评标专家查阅

const KEY = 'bidding-clause-links'

function loadAll() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveAll(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    // ignore storage errors
  }
}

export const clauseStore = {
  getLinks(projectId) {
    const all = loadAll()
    return all[String(projectId)] || {}
  },
  setLink(projectId, clauseId, fileName) {
    const all = loadAll()
    const key = String(projectId)
    all[key] = { ...(all[key] || {}), [clauseId]: fileName || '' }
    saveAll(all)
    return all[key]
  },
  clearLinks(projectId) {
    const all = loadAll()
    delete all[String(projectId)]
    saveAll(all)
  }
}

// 默认评审条款（招标文件评审要求），供 BidUpload 展示并逐条挂接投标文件
export const defaultClauses = [
  { id: 'c1', name: '投标函及授权委托书', category: '商务' },
  { id: 'c2', name: '营业执照等资质证明', category: '商务' },
  { id: 'c3', name: '技术方案与参数响应', category: '技术' },
  { id: 'c4', name: '项目实施方案', category: '技术' },
  { id: 'c5', name: '报价一览表', category: '报价' },
  { id: 'c6', name: '分项报价表', category: '报价' }
]
