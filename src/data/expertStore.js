// 专家库与抽取结果 mock 存储
// 维护专家专业领域、所属单位、回避单位，支持按条件随机抽取并生成评标委员会名单

const EXPERTS_KEY = 'bidding-experts'
const RESULT_KEY = 'bidding-expert-results'

const defaultExperts = [
  { id: 'e1', name: '专家甲', field: '电子信息', org: '深圳大学', avoidOrgs: ['A科技有限公司'], phone: '138****0001' },
  { id: 'e2', name: '专家乙', field: '机械设备', org: '南方科技大学', avoidOrgs: [], phone: '138****0002' },
  { id: 'e3', name: '专家丙', field: '工程造价', org: '深圳造价协会', avoidOrgs: ['B实业有限公司'], phone: '138****0003' },
  { id: 'e4', name: '专家丁', field: '电子信息', org: '哈工大（深圳）', avoidOrgs: [], phone: '138****0004' },
  { id: 'e5', name: '专家戊', field: '机械设备', org: '深圳机械研究院', avoidOrgs: ['C股份有限公司'], phone: '138****0005' },
  { id: 'e6', name: '专家己', field: '软件工程', org: '腾讯研究院', avoidOrgs: [], phone: '138****0006' },
  { id: 'e7', name: '专家庚', field: '工程造价', org: '中建三局', avoidOrgs: [], phone: '138****0007' },
  { id: 'e8', name: '专家辛', field: '软件工程', org: '华为研究院', avoidOrgs: ['A科技有限公司'], phone: '138****0008' }
]

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

export const expertStore = {
  getExperts() {
    return load(EXPERTS_KEY, defaultExperts)
  },
  getResults() {
    return load(RESULT_KEY, {})
  },
  getResult(projectId) {
    return this.getResults()[String(projectId)] || null
  },
  // 按专业领域 + 回避规则过滤并随机抽取
  extract(projectId, { fields = [], count = 3, avoidOrgs = [] }) {
    const all = this.getExperts()
    const isAvoided = (e) =>
      avoidOrgs.includes(e.org) || e.avoidOrgs.some((o) => avoidOrgs.includes(o))

    let candidates = all.filter((e) => !isAvoided(e) && (fields.length === 0 || fields.includes(e.field)))
    // 符合领域的不足时，在非回避专家中补足
    if (candidates.length < count) {
      const extra = all.filter((e) => !isAvoided(e) && !candidates.includes(e))
      candidates = [...candidates, ...extra]
    }
    const shuffled = [...candidates].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, Math.min(count, shuffled.length))
    const result = {
      projectId: String(projectId),
      fields,
      count,
      avoidOrgs,
      experts: selected,
      extractedAt: new Date().toLocaleString(),
      confirmed: false,
      confirmedAt: ''
    }
    const results = this.getResults()
    results[String(projectId)] = result
    save(RESULT_KEY, results)
    return result
  },
  confirmResult(projectId) {
    const results = this.getResults()
    const key = String(projectId)
    if (!results[key]) return null
    results[key].confirmed = true
    results[key].confirmedAt = new Date().toLocaleString()
    save(RESULT_KEY, results)
    return results[key]
  },
  // 读取分配给某专家的已确认任务
  getTasksForExpert(expertName) {
    const results = this.getResults()
    return Object.values(results)
      .filter((r) => r.confirmed && r.experts.some((e) => e.name === expertName))
      .map((r) => ({
        projectId: r.projectId,
        extractedAt: r.extractedAt,
        confirmedAt: r.confirmedAt
      }))
  }
}
