// 评审条款关联 mock 存储（纯内存静态种子，无任何持久化）
// 记录投标文件与招标文件评审条款的挂接关系，按项目隔离，供评标专家查阅

// 种子：项目 3 的 A科技有限公司 已挂接全部条款（开标前可查看挂接关系）
const SEED_LINKS = {
  '3': {
    c1: '投标函及授权委托书.pdf',
    c2: '营业执照等资质证明.pdf',
    c3: '技术方案与参数响应.pdf',
    c4: '项目实施方案.pdf',
    c5: '报价一览表.pdf',
    c6: '分项报价表.pdf'
  }
}

function clone(value) {
  return value ? JSON.parse(JSON.stringify(value)) : value
}

export const clauseStore = {
  getLinks(projectId) {
    return clone(SEED_LINKS[String(projectId)]) || {}
  },
  setLink(projectId, clauseId, fileName) {
    // 纯演示：不保存数据
    const current = this.getLinks(projectId)
    return { ...current, [clauseId]: fileName || '' }
  },
  clearLinks() {
    return null
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
