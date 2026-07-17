// 评标状态共享存储（localStorage 持久化）
// 由 ExpertProject（专家评分/签名/报告）、ExpertTasks（任务/过期）、EvaluationHall（汇总/提交控制）共同消费。
// 本文件为共享契约：导出名、参数与返回结构固定，实施 agent 不得修改签名；如需扩展请先协调。

const EVAL_KEY = 'bidding-evaluation'

// 数据结构（按 projectId 存一份）：
// {
//   leader: string | null,              // 评标组长姓名；null = 未推选（初始不默认设定，实时推选产生）
//   deadline: string | null,            // ISO 字符串，评标截止时间；过期禁止进入/提交
//   experts: {
//     [expertName]: {
//       scores: { [bidderName]: { [scoreItem]: number } },
//       comments: { [bidderName]: string },   // 扩展：按投标人的评审意见（20260717 加固新增）
//       opinion: string,                      // 评审意见/组长报告意见
//       submitted: boolean, submittedAt: string | null,
//       signed: boolean, signedAt: string | null,
//       revoked: boolean, revokeReason: string | null, revokedAt: string | null
//     }
//   },
//   report: null | {
//     id: string, version: string, content: string,   // content 为报告全文（纯文本）
//     candidates: string[], createdAt: string, createdBy: string,
//     archived: boolean,
//     // 以下为 20260717 加固扩展字段（向后兼容的增量字段）：
//     signatures: [{ name: string, signed: boolean, signedAt: string | null }], // 委员会签名状态
//     summary: [{ bidder: string, average: number, rank: number }],             // 评分汇总快照
//     opinions: [{ expert: string, opinion: string }],                          // 各专家意见快照
//     archiveLog: [{ action: string, time: string, operator: string, version: string }] // 归档/版本记录
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

// 截止时间是否已过期（新增辅助导出，不改既有 API）。
// 兼容 ISO 字符串与 'YYYY-MM-DD HH:mm' 格式；未设置截止时间视为未过期。
export function isEvalExpired(deadline) {
  if (!deadline) return false
  const text = String(deadline).trim()
  const time = new Date(text.includes('T') ? text : text.replace(' ', 'T')).getTime()
  if (Number.isNaN(time)) return false
  return Date.now() > time
}

// 格式化截止时间用于展示
export function formatDeadline(deadline) {
  if (!deadline) return '未设定'
  const text = String(deadline).trim()
  const d = new Date(text.includes('T') ? text : text.replace(' ', 'T'))
  if (Number.isNaN(d.getTime())) return text
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
