// 采购数据分析 mock 数据存储（localStorage 持久化）
// 供 AnalyticsDashboard（价格趋势）、AnalyticsPriceCompare（材料比价）、AnalyticsRiskWarning（风险预警）共享。
// 数据来源口径为 e签宝接口，原型阶段使用本 store 的 mock 数据（预留 src/utils/eqianbaoAnalyticsApi.js 切换）。
// 本文件为共享契约：导出名、参数与返回结构固定，实施 agent 不得修改签名；如需扩展请先协调。

const PRICES_KEY = 'bidding-analytics-prices'
const SUPPLIERS_KEY = 'bidding-analytics-suppliers'
const WARNING_RULES_KEY = 'bidding-analytics-warning-rules'

// 供应商画像：legalPerson（法人相同预警）、parentId（上下级预警）字段供预警规则使用
const defaultSuppliers = [
  { id: 'sup-1', name: '华建钢材有限公司', legalPerson: '张建国', parentId: '' },
  { id: 'sup-2', name: '宏远物资有限公司', legalPerson: '张建国', parentId: '' },
  { id: 'sup-3', name: '中材供应链有限公司', legalPerson: '李国强', parentId: '' },
  { id: 'sup-4', name: '中材华东分公司', legalPerson: '刘明', parentId: 'sup-3' },
  { id: 'sup-5', name: '鑫源建材有限公司', legalPerson: '陈鑫', parentId: '' }
]

// 价格记录：{ id, material, supplierId, supplierName, price, projectId, at }
// 覆盖 3 种材料、5 家供应商、2026-01 ~ 2026-07，可画出趋势与比价
const defaultPrices = [
  { id: 'pr-1', material: '螺纹钢 HRB400（元/吨）', supplierId: 'sup-1', supplierName: '华建钢材有限公司', price: 3850, projectId: '1', at: '2026-01-15' },
  { id: 'pr-2', material: '螺纹钢 HRB400（元/吨）', supplierId: 'sup-1', supplierName: '华建钢材有限公司', price: 3920, projectId: '1', at: '2026-03-10' },
  { id: 'pr-3', material: '螺纹钢 HRB400（元/吨）', supplierId: 'sup-1', supplierName: '华建钢材有限公司', price: 3780, projectId: '5', at: '2026-05-20' },
  { id: 'pr-4', material: '螺纹钢 HRB400（元/吨）', supplierId: 'sup-1', supplierName: '华建钢材有限公司', price: 3880, projectId: '5', at: '2026-07-08' },
  { id: 'pr-5', material: '螺纹钢 HRB400（元/吨）', supplierId: 'sup-2', supplierName: '宏远物资有限公司', price: 3890, projectId: '1', at: '2026-03-12' },
  { id: 'pr-6', material: '螺纹钢 HRB400（元/吨）', supplierId: 'sup-2', supplierName: '宏远物资有限公司', price: 3810, projectId: '5', at: '2026-07-06' },
  { id: 'pr-7', material: '普通硅酸盐水泥（元/吨）', supplierId: 'sup-3', supplierName: '中材供应链有限公司', price: 460, projectId: '1', at: '2026-02-18' },
  { id: 'pr-8', material: '普通硅酸盐水泥（元/吨）', supplierId: 'sup-3', supplierName: '中材供应链有限公司', price: 445, projectId: '2', at: '2026-04-09' },
  { id: 'pr-9', material: '普通硅酸盐水泥（元/吨）', supplierId: 'sup-3', supplierName: '中材供应链有限公司', price: 470, projectId: '2', at: '2026-06-25' },
  { id: 'pr-10', material: '普通硅酸盐水泥（元/吨）', supplierId: 'sup-4', supplierName: '中材华东分公司', price: 455, projectId: '2', at: '2026-04-11' },
  { id: 'pr-11', material: '普通硅酸盐水泥（元/吨）', supplierId: 'sup-4', supplierName: '中材华东分公司', price: 465, projectId: '2', at: '2026-06-27' },
  { id: 'pr-12', material: '交联电缆 YJV-4×35（元/米）', supplierId: 'sup-4', supplierName: '中材华东分公司', price: 18.5, projectId: '5', at: '2026-03-22' },
  { id: 'pr-13', material: '交联电缆 YJV-4×35（元/米）', supplierId: 'sup-4', supplierName: '中材华东分公司', price: 17.8, projectId: '5', at: '2026-06-15' },
  { id: 'pr-14', material: '交联电缆 YJV-4×35（元/米）', supplierId: 'sup-5', supplierName: '鑫源建材有限公司', price: 32, projectId: '5', at: '2026-06-18' }
]

// 预警规则开关：关闭后不再产生该类预警；abnormalHighPriceThreshold 为高出均价百分比阈值
const defaultWarningRules = {
  sameLegalPerson: true,
  parentChild: true,
  abnormalHighPrice: true,
  abnormalHighPriceThreshold: 20
}

export const WARNING_RULE_LABELS = {
  sameLegalPerson: '法人相同',
  parentChild: '上下级关系',
  abnormalHighPrice: '报价异常高'
}

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

export const analyticsStore = {
  getPrices() {
    return load(PRICES_KEY, defaultPrices)
  },
  savePrices(prices) {
    save(PRICES_KEY, prices)
  },
  getSuppliers() {
    return load(SUPPLIERS_KEY, defaultSuppliers)
  },
  getWarningRules() {
    return { ...defaultWarningRules, ...load(WARNING_RULES_KEY, {}) }
  },
  saveWarningRules(rules) {
    save(WARNING_RULES_KEY, rules)
  },
  // 全部材料名（去重，供筛选项）
  getMaterials() {
    return [...new Set(this.getPrices().map((p) => p.material))]
  },
  // 价格趋势：{ material?, supplierId?, from?, to? } 组合筛选，按时间升序返回
  trends({ material, supplierId, from, to } = {}) {
    return this.getPrices()
      .filter((p) => {
        if (material && p.material !== material) return false
        if (supplierId && String(p.supplierId) !== String(supplierId)) return false
        if (from && p.at < from) return false
        if (to && p.at > to) return false
        return true
      })
      .sort((a, b) => (a.at < b.at ? -1 : 1))
  },
  // 材料比价：同一材料并列各供应商历史报价，含最新价/最低/最高/均价与供应商间最新价价差
  compare(material) {
    const prices = this.trends({ material })
    const bySupplier = new Map()
    prices.forEach((p) => {
      if (!bySupplier.has(p.supplierId)) {
        bySupplier.set(p.supplierId, { supplierId: p.supplierId, supplierName: p.supplierName, records: [] })
      }
      bySupplier.get(p.supplierId).records.push({ price: p.price, at: p.at, projectId: p.projectId })
    })
    const suppliers = [...bySupplier.values()].map((s) => {
      const values = s.records.map((r) => r.price)
      const sum = values.reduce((acc, v) => acc + v, 0)
      return {
        ...s,
        latest: values[values.length - 1],
        min: Math.min(...values),
        max: Math.max(...values),
        avg: Number((sum / values.length).toFixed(2))
      }
    })
    const latests = suppliers.map((s) => s.latest)
    return {
      material,
      suppliers,
      spread: latests.length > 1 ? Number((Math.max(...latests) - Math.min(...latests)).toFixed(2)) : 0
    }
  },
  // 风险预警：按规则开关动态计算，返回 { id, rule, ruleLabel, message, suppliers, material?, projectId?, at }
  warnings() {
    const rules = this.getWarningRules()
    const suppliers = this.getSuppliers()
    const prices = this.getPrices()
    const result = []
    if (rules.sameLegalPerson) {
      const byLegal = new Map()
      suppliers.forEach((s) => {
        if (!s.legalPerson) return
        byLegal.set(s.legalPerson, [...(byLegal.get(s.legalPerson) || []), s])
      })
      byLegal.forEach((group, legalPerson) => {
        if (group.length < 2) return
        result.push({
          id: `warn-legal-${legalPerson}`,
          rule: 'sameLegalPerson',
          ruleLabel: WARNING_RULE_LABELS.sameLegalPerson,
          message: `供应商 ${group.map((s) => s.name).join('、')} 的法定代表人均为 ${legalPerson}`,
          suppliers: group.map((s) => s.name),
          at: ''
        })
      })
    }
    if (rules.parentChild) {
      suppliers
        .filter((s) => s.parentId)
        .forEach((child) => {
          const parent = suppliers.find((p) => String(p.id) === String(child.parentId))
          if (!parent) return
          result.push({
            id: `warn-parent-${child.id}`,
            rule: 'parentChild',
            ruleLabel: WARNING_RULE_LABELS.parentChild,
            message: `${child.name} 为 ${parent.name} 的下级单位，存在上下级关系`,
            suppliers: [parent.name, child.name],
            at: ''
          })
        })
    }
    if (rules.abnormalHighPrice) {
      const threshold = Number(rules.abnormalHighPriceThreshold) || 0
      const byMaterial = new Map()
      prices.forEach((p) => byMaterial.set(p.material, [...(byMaterial.get(p.material) || []), p]))
      byMaterial.forEach((list, material) => {
        const avg = list.reduce((acc, p) => acc + p.price, 0) / list.length
        list
          .filter((p) => p.price > avg * (1 + threshold / 100))
          .forEach((p) => {
            result.push({
              id: `warn-price-${p.id}`,
              rule: 'abnormalHighPrice',
              ruleLabel: WARNING_RULE_LABELS.abnormalHighPrice,
              message: `${p.supplierName} 在 ${material} 的报价 ${p.price} 高于均价 ${avg.toFixed(2)} 超过 ${threshold}%`,
              suppliers: [p.supplierName],
              material,
              projectId: p.projectId,
              at: p.at
            })
          })
      })
    }
    return result
  }
}
