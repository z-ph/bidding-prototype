// 评标状态共享存储（localStorage 持久化）
// 由 ExpertProject（专家评分/签名/报告）、ExpertTasks（任务/过期）、EvaluationHall（汇总/提交控制）共同消费。
// 本文件为共享契约：导出名、参数与返回结构固定，实施 agent 不得修改签名；如需扩展请先协调。

const EVAL_KEY = 'bidding-evaluation'

// 数据结构（按 projectId 存一份）：
// {
//   leader: string | null,              // 评标组长姓名；null = 未推选
//   deadline: string | null,            // ISO 字符串，评标截止时间；过期禁止进入/提交
//   experts: {
//     [expertName]: {
//       scores: { [bidderName]: { [scoreItem]: number } },
//       opinion: string,
//       submitted: boolean, submittedAt: string | null,
//       signed: boolean, signedAt: string | null,
//       revoked: boolean, revokeReason: string | null
//     }
//   },
//   report: null | {
//     id: string, version: string, content: string,
//     candidates: string[], createdAt: string, createdBy: string,
//     archived: boolean
//   },
//   status: 'evaluating' | 'submitted' | 'confirmed'
// }

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

const emptyEval = () => ({
  leader: null,
  deadline: null,
  experts: {},
  report: null,
  status: 'evaluating'
})

export const evaluationStore = {
  // 返回全部项目的评标状态 map
  getAll() {
    return load(EVAL_KEY, {})
  },
  saveAll(map) {
    save(EVAL_KEY, map)
  },
  // 返回单个项目评标状态（无记录时返回默认结构）
  getEval(projectId) {
    const all = this.getAll()
    return all[projectId] || emptyEval()
  },
  // 整体覆盖写单个项目
  saveEval(projectId, data) {
    const all = this.getAll()
    all[projectId] = data
    this.saveAll(all)
    return all[projectId]
  },
  // 读-改-写：updater(draft) 内直接修改 draft
  updateEval(projectId, updater) {
    const data = this.getEval(projectId)
    updater(data)
    return this.saveEval(projectId, data)
  },
  resetEval(projectId) {
    const all = this.getAll()
    delete all[projectId]
    this.saveAll(all)
  },
  // 提交进度：{ total, submitted, allSubmitted, pendingExperts: [姓名] }
  getSubmittedInfo(projectId) {
    const experts = this.getEval(projectId).experts || {}
    const names = Object.keys(experts)
    const pendingExperts = names.filter((n) => !experts[n]?.submitted)
    return {
      total: names.length,
      submitted: names.length - pendingExperts.length,
      allSubmitted: names.length > 0 && pendingExperts.length === 0,
      pendingExperts
    }
  }
}
