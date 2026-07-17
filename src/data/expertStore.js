// 专家库与抽取结果 mock 存储
// 维护专家专业领域、所属单位、回避单位，支持按条件随机抽取并生成评标委员会名单
// 20260717 需求口径：回避条件仅按「单位」（需求确认清单 40，不做地区/黑名单）；
// 评分人员可指定也可抽取（清单 41）；专家账号由后台提前创建（清单 43）。

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

// 专家确认状态 confirmStatus：pending 待确认 / confirmed 已确认参加 / declined 已拒绝
// 抽取结果结构（按 projectId 存一份）：
// {
//   projectId, fields, count, avoidOrgs, benchCount,
//   experts: [{ id,name,field,org,avoidOrgs,phone, confirmStatus, confirmAt, declineReason,
//               promotedAt?, promotedFor? }],   // 正式名单（含从备选递补进来的成员）
//   bench:   [{ ...同上 }],                      // 备选名单，正式专家拒绝后按序递补
//   extractedAt, confirmed, confirmedAt
// }

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

// 兼容旧版抽取结果（无 bench / confirmStatus 字段）：
// 旧结果在确认通知时专家即已可参评，缺失状态按已确认回填，保证旧演示数据可用。
function normalizeResult(result) {
  if (!result) return null
  const legacyStatus = result.confirmed ? 'confirmed' : 'pending'
  return {
    ...result,
    experts: (result.experts || []).map((e) => ({
      confirmAt: '',
      declineReason: '',
      ...e,
      confirmStatus: e.confirmStatus || legacyStatus
    })),
    bench: (result.bench || []).map((e) => ({
      confirmAt: '',
      declineReason: '',
      ...e,
      confirmStatus: e.confirmStatus || 'pending'
    }))
  }
}

export const expertStore = {
  getExperts() {
    return load(EXPERTS_KEY, defaultExperts)
  },
  getResults() {
    const raw = load(RESULT_KEY, {})
    const normalized = {}
    Object.keys(raw).forEach((k) => {
      normalized[k] = normalizeResult(raw[k])
    })
    return normalized
  },
  getResult(projectId) {
    return this.getResults()[String(projectId)] || null
  },
  // 按专业领域 + 回避规则（仅单位）过滤并随机抽取；benchCount 为备选人数
  extract(projectId, { fields = [], count = 3, avoidOrgs = [], benchCount = 0 }) {
    const all = this.getExperts()
    const isAvoided = (e) =>
      avoidOrgs.includes(e.org) || e.avoidOrgs.some((o) => avoidOrgs.includes(o))

    let candidates = all.filter((e) => !isAvoided(e) && (fields.length === 0 || fields.includes(e.field)))
    // 符合领域的不足时，在非回避专家中补足（含备选名额）
    const need = count + Math.max(0, benchCount)
    if (candidates.length < need) {
      const extra = all.filter((e) => !isAvoided(e) && !candidates.includes(e))
      candidates = [...candidates, ...extra]
    }
    const shuffled = [...candidates].sort(() => Math.random() - 0.5)
    const withStatus = (e) => ({ ...e, confirmStatus: 'pending', confirmAt: '', declineReason: '' })
    const selected = shuffled.slice(0, Math.min(count, shuffled.length)).map(withStatus)
    const bench = shuffled.slice(selected.length, selected.length + Math.max(0, benchCount)).map(withStatus)
    const result = {
      projectId: String(projectId),
      fields,
      count,
      avoidOrgs,
      benchCount,
      experts: selected,
      bench,
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
  // 专家确认/拒绝反馈（cal-005）：被抽中专家在 ExpertTasks 操作，状态回写抽取结果；
  // 正式专家拒绝后自动从备选名单按序递补（递补成员进入正式名单并标记 promotedAt/promotedFor）
  respondToTask(projectId, expertName, action, reason = '') {
    const results = this.getResults()
    const key = String(projectId)
    const result = results[key]
    if (!result || !result.confirmed) return null
    const idx = result.experts.findIndex((e) => e.name === expertName)
    if (idx === -1) return null
    const now = new Date().toLocaleString()
    const target = result.experts[idx]
    if (action === 'confirm') {
      target.confirmStatus = 'confirmed'
      target.confirmAt = now
      target.declineReason = ''
    } else if (action === 'decline') {
      target.confirmStatus = 'declined'
      target.confirmAt = now
      target.declineReason = reason || ''
      // 备选递补：取第一个待确认的备选专家补入正式名单
      const benchIdx = result.bench.findIndex((e) => e.confirmStatus === 'pending')
      if (benchIdx >= 0) {
        const [promoted] = result.bench.splice(benchIdx, 1)
        result.experts.push({ ...promoted, promotedAt: now, promotedFor: expertName })
      }
    } else {
      return null
    }
    results[key] = result
    save(RESULT_KEY, results)
    return result
  },
  // 读取分配给某专家的已确认任务（含确认反馈状态，供 ExpertTasks 展示与操作）
  getTasksForExpert(expertName) {
    const results = this.getResults()
    return Object.values(results)
      .filter((r) => r && r.confirmed && r.experts.some((e) => e.name === expertName))
      .map((r) => {
        const me = r.experts.find((e) => e.name === expertName)
        return {
          projectId: r.projectId,
          extractedAt: r.extractedAt,
          confirmedAt: r.confirmedAt,
          confirmStatus: me?.confirmStatus || 'pending',
          declineReason: me?.declineReason || '',
          promotedAt: me?.promotedAt || ''
        }
      })
  }
}
