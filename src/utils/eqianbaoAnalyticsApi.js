// e签宝采购数据分析接口（预留占位，一期不实现）
//
// 口径（spec/changes/add-procurement-analytics-20260717，任务 data-source-stub）：
// - 数据分析模块的数据由 e签宝提供，我方通过甲方提供的接口调用获取；
// - 一期（原型阶段）预留不实现：页面一律从 src/data/analyticsStore.js 取 mock 数据，
//   本文件不被任何页面直接调用，也无任何真实网络请求；
// - 甲方提供 e签宝接口文档后，仅需在此实现真实调用并把页面数据源从 analyticsStore
//   切换为本模块，页面视图层无需改动。
//
// 函数签名与 analyticsStore 读取侧一一对应，便于后续无缝切换。

const NOT_IMPLEMENTED =
  '未实现：e签宝数据分析接口为一期预留（数据由 e签宝提供、经甲方接口调用），原型阶段请使用 src/data/analyticsStore.js 的 mock 数据'

function unimplemented(apiName) {
  return Promise.reject(new Error(`${NOT_IMPLEMENTED}（${apiName}）`))
}

// 价格趋势：{ material?, supplierId?, from?, to? } 组合筛选，按时间升序返回价格记录
// 对应 analyticsStore.trends(params)
export function fetchPriceTrends(params = {}) {
  void params
  return unimplemented('fetchPriceTrends')
}

// 材料比价：同一材料并列各供应商历史报价（最新价/最低/最高/均价/供应商间价差）
// 对应 analyticsStore.compare(material)
export function fetchMaterialPriceCompare(material) {
  void material
  return unimplemented('fetchMaterialPriceCompare')
}

// 风险预警列表：法人相同 / 上下级关系 / 报价异常高 三类规则命中
// 对应 analyticsStore.warnings()
export function fetchRiskWarnings() {
  return unimplemented('fetchRiskWarnings')
}

// 供应商画像：含 legalPerson（法人相同预警）、parentId（上下级预警）等字段
// 对应 analyticsStore.getSuppliers()
export function fetchSuppliers() {
  return unimplemented('fetchSuppliers')
}

// 全部材料名（去重，供筛选项）
// 对应 analyticsStore.getMaterials()
export function fetchMaterials() {
  return unimplemented('fetchMaterials')
}
