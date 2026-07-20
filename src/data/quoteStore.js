// 投标人报价 mock 存储（纯内存静态种子，无任何持久化）
// 结构：{ "<projectId>::<supplierName>": { quote, items, savedAt } }
//   quote: { [fieldKey]: value } 开标一览表填报值
//   items: [{ name, spec, quantity, unit, price }] 分项报价表
//
// 种子口径：项目 3（待开标）三家投标人均已报价，总价与开标大厅唱标一致（万元）

const SEED_QUOTES = {
  '3::A科技有限公司': {
    quote: {
      totalPrice: 820,
      currency: '人民币（元）',
      deliveryPeriod: '合同签订后 60 个日历日',
      warrantyPeriod: '3 年',
      paymentTerms: '按招标文件要求响应',
      bidValidity: '90 天'
    },
    items: [
      { name: '精密实验仪器', spec: 'PX-3000', quantity: 10, unit: '台', price: 520 },
      { name: '实验耗材套件', spec: 'HC-200', quantity: 200, unit: '套', price: 300 }
    ],
    savedAt: '2026-07-19 16:20'
  },
  '3::B实业有限公司': {
    quote: {
      totalPrice: 845,
      currency: '人民币（元）',
      deliveryPeriod: '合同签订后 75 个日历日',
      warrantyPeriod: '2 年',
      paymentTerms: '按招标文件要求响应',
      bidValidity: '90 天'
    },
    items: [
      { name: '精密实验仪器', spec: 'PX-3000', quantity: 10, unit: '台', price: 540 },
      { name: '实验耗材套件', spec: 'HC-200', quantity: 200, unit: '套', price: 305 }
    ],
    savedAt: '2026-07-19 11:05'
  },
  '3::C股份有限公司': {
    quote: {
      totalPrice: 798,
      currency: '人民币（元）',
      deliveryPeriod: '合同签订后 60 个日历日',
      warrantyPeriod: '3 年',
      paymentTerms: '按招标文件要求响应',
      bidValidity: '90 天'
    },
    items: [
      { name: '精密实验仪器', spec: 'PX-2800', quantity: 10, unit: '台', price: 498 },
      { name: '实验耗材套件', spec: 'HC-200', quantity: 200, unit: '套', price: 300 }
    ],
    savedAt: '2026-07-20 09:10'
  }
}

function clone(value) {
  return value ? JSON.parse(JSON.stringify(value)) : value
}

export const quoteStore = {
  getQuotes() {
    return clone(SEED_QUOTES) || {}
  },
  // 读取某供应商在某项目下已保存的报价；无 projectId 安全返回 null
  getQuote(projectId, supplierName) {
    if (!projectId) return null
    return this.getQuotes()[`${projectId}::${supplierName}`] || null
  },
  saveQuote(projectId, supplierName, { quote, items } = {}) {
    // 纯演示：不保存数据，原样返回记录以兼容调用方
    if (!projectId) return null
    return { quote, items, savedAt: '（演示）' }
  }
}
