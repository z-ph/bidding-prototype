// 专家库与抽取结果 mock 存储（纯内存静态种子，无任何持久化）
// 维护专家专业领域、所属单位、回避单位；抽取结果按项目预置。
// 专家确认状态 confirmStatus：pending 待确认 / confirmed 已确认参加 / declined 已拒绝

export const DEFAULT_EXPERTS = [
  { id: 'e1', name: '专家甲', field: '电子信息', org: '深圳大学', avoidOrgs: ['A科技有限公司'], phone: '138****0001' },
  { id: 'e2', name: '专家乙', field: '机械设备', org: '南方科技大学', avoidOrgs: [], phone: '138****0002' },
  { id: 'e3', name: '专家丙', field: '工程造价', org: '深圳造价协会', avoidOrgs: ['B实业有限公司'], phone: '138****0003' },
  { id: 'e4', name: '专家丁', field: '电子信息', org: '哈工大（深圳）', avoidOrgs: [], phone: '138****0004' },
  { id: 'e5', name: '专家戊', field: '机械设备', org: '深圳机械研究院', avoidOrgs: ['C股份有限公司'], phone: '138****0005' },
  { id: 'e6', name: '专家己', field: '软件工程', org: '腾讯研究院', avoidOrgs: [], phone: '138****0006' },
  { id: 'e7', name: '专家庚', field: '工程造价', org: '中建三局', avoidOrgs: [], phone: '138****0007' },
  { id: 'e8', name: '专家辛', field: '软件工程', org: '华为研究院', avoidOrgs: ['A科技有限公司'], phone: '138****0008' }
]

// 抽取结果种子：项目 5（评标中）已抽取并确认通知，3 名正式专家全部确认参加，1 名备选
const SEED_RESULTS = {
  '5': {
    projectId: '5',
    fields: ['电子信息', '机械设备'],
    count: 3,
    avoidOrgs: ['XX市轨道交通集团'],
    benchCount: 1,
    experts: [
      { id: 'e1', name: '专家甲', field: '电子信息', org: '深圳大学', avoidOrgs: ['A科技有限公司'], phone: '138****0001', confirmStatus: 'confirmed', confirmAt: '2026-07-16 14:00', declineReason: '' },
      { id: 'e2', name: '专家乙', field: '机械设备', org: '南方科技大学', avoidOrgs: [], phone: '138****0002', confirmStatus: 'confirmed', confirmAt: '2026-07-16 14:30', declineReason: '' },
      { id: 'e3', name: '专家丙', field: '工程造价', org: '深圳造价协会', avoidOrgs: ['B实业有限公司'], phone: '138****0003', confirmStatus: 'confirmed', confirmAt: '2026-07-16 15:10', declineReason: '' }
    ],
    bench: [
      { id: 'e4', name: '专家丁', field: '电子信息', org: '哈工大（深圳）', avoidOrgs: [], phone: '138****0004', confirmStatus: 'pending', confirmAt: '', declineReason: '' }
    ],
    extractedAt: '2026-07-16 10:30',
    confirmed: true,
    confirmedAt: '2026-07-16 11:00'
  }
}

function clone(value) {
  return value ? JSON.parse(JSON.stringify(value)) : value
}

export const expertStore = {
  getExperts() {
    return clone(DEFAULT_EXPERTS)
  },
  getResults() {
    return clone(SEED_RESULTS) || {}
  },
  getResult(projectId) {
    return this.getResults()[String(projectId)] || null
  },
  // 纯演示：抽取不写入数据，返回一份静态示例名单供展示
  extract(projectId, { fields = [], count = 3, avoidOrgs = [], benchCount = 0 } = {}) {
    const isAvoided = (e) =>
      avoidOrgs.includes(e.org) || e.avoidOrgs.some((o) => avoidOrgs.includes(o))
    let candidates = DEFAULT_EXPERTS.filter((e) => !isAvoided(e) && (fields.length === 0 || fields.includes(e.field)))
    if (candidates.length < count + benchCount) {
      const extra = DEFAULT_EXPERTS.filter((e) => !isAvoided(e) && !candidates.includes(e))
      candidates = [...candidates, ...extra]
    }
    const withStatus = (e) => ({ ...e, confirmStatus: 'pending', confirmAt: '', declineReason: '' })
    const selected = candidates.slice(0, Math.min(count, candidates.length)).map(withStatus)
    const bench = candidates.slice(selected.length, selected.length + Math.max(0, benchCount)).map(withStatus)
    return {
      projectId: String(projectId),
      fields,
      count,
      avoidOrgs,
      benchCount,
      experts: selected,
      bench,
      extractedAt: '（演示）',
      confirmed: false,
      confirmedAt: ''
    }
  },
  confirmResult(projectId) {
    // 纯演示：不保存数据
    return this.getResult(projectId)
  },
  respondToTask(projectId) {
    // 纯演示：不保存数据
    return this.getResult(projectId)
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
