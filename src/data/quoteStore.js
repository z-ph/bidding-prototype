// 投标人报价 mock 存储：按「项目 + 供应商」持久化报价填报内容
// 结构：{ "<projectId>::<supplierName>": { quote, items, savedAt } }
//   quote: { [fieldKey]: value } 开标一览表填报值（字段由项目报价模板驱动）
//   items: [{ name, spec, quantity, unit, price }] 分项报价表
//   savedAt: 最后保存时间（new Date().toLocaleString()）

const QUOTES_KEY = 'bidding-quotes'

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore storage errors
  }
}

export const quoteStore = {
  getQuotes() {
    return load(QUOTES_KEY, {})
  },
  // 读取某供应商在某项目下已保存的报价；无 projectId 安全返回 null（由页面 guard 阻断渲染）
  getQuote(projectId, supplierName) {
    if (!projectId) return null
    return this.getQuotes()[`${projectId}::${supplierName}`] || null
  },
  saveQuote(projectId, supplierName, { quote, items }) {
    if (!projectId) return null
    const quotes = this.getQuotes()
    const record = { quote, items, savedAt: new Date().toLocaleString() }
    quotes[`${projectId}::${supplierName}`] = record
    save(QUOTES_KEY, quotes)
    return record
  }
}
