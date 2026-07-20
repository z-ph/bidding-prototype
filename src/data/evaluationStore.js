// 评标状态共享存储（纯内存静态种子，无任何持久化）
// 由 ExpertProject（专家评分/签名/报告）、ExpertTasks（任务/过期）、EvaluationHall（汇总/提交控制）共同消费。
// 本文件为共享契约：导出名、参数与返回结构固定。
//
// 数据结构（按 projectId 存一份）：
// {
//   leader: string | null,              // 评标组长姓名
//   deadline: string | null,            // 'YYYY-MM-DD HH:mm'，评标截止时间
//   experts: {
//     [expertName]: {
//       scores: { [bidderName]: { [scoreItem]: number } },
//       comments: { [bidderName]: string },
//       opinion: string,
//       submitted, submittedAt, signed, signedAt,
//       revoked, revokeReason, revokedAt
//     }
//   },
//   report: null | { id, version, content, candidates, createdAt, createdBy, archived,
//                    signatures, summary, opinions, archiveLog },
//   status: 'evaluating' | 'submitted' | 'confirmed'
// }

const SCORE_ITEMS = ['business', 'tech', 'price']

// 项目 5（轨道交通电缆材料采购）评标种子：3 名专家全部评分/签名/提交，组长已提交评标结果并生成报告
const expertEntry = (name, opinion, submittedAt) => ({
  scores: {
    'A科技有限公司': { business: 27, tech: 36, price: 27 },
    'B实业有限公司': { business: 24, tech: 32, price: 25 },
    'C股份有限公司': { business: 22, tech: 30, price: 24 }
  },
  comments: {
    'A科技有限公司': '技术方案完整，业绩丰富。',
    'B实业有限公司': '方案基本满足要求，交货期偏长。',
    'C股份有限公司': '价格有优势，技术参数响应一般。'
  },
  opinion,
  submitted: true,
  submittedAt,
  signed: true,
  signedAt: submittedAt,
  revoked: false,
  revokeReason: null,
  revokedAt: null
})

const SEED_EVALS = {
  '5': {
    leader: '专家乙',
    deadline: '2026-07-25 17:00',
    experts: {
      专家甲: expertEntry('专家甲', 'A科技有限公司综合表现最优，推荐为第一候选人。', '2026-07-18 15:20'),
      专家乙: expertEntry('专家乙', '三家投标人均通过符合性审查，A科技有限公司技术与商务得分领先。', '2026-07-18 16:05'),
      专家丙: expertEntry('专家丙', '评标过程规范，推荐候选人排序合理。', '2026-07-18 16:40')
    },
    report: {
      id: 'RPT-5-001',
      version: 'V1.0',
      content: '轨道交通电缆材料采购项目评标报告\n\n一、项目概况：本项目共 2 个标段，3 家投标人参与投标。\n二、评标过程：评标委员会由 3 名专家组成，按招标文件规定的综合评分法进行评审。\n三、评审结果：经综合评分，推荐候选人如下：第一候选人 A科技有限公司，第二候选人 B实业有限公司，第三候选人 C股份有限公司。\n四、评标结论：评标委员会一致同意上述推荐结果。',
      candidates: ['A科技有限公司', 'B实业有限公司', 'C股份有限公司'],
      createdAt: '2026-07-18 16:50',
      createdBy: '专家乙',
      archived: false,
      signatures: [
        { name: '专家甲', signed: true, signedAt: '2026-07-18 15:20' },
        { name: '专家乙', signed: true, signedAt: '2026-07-18 16:05' },
        { name: '专家丙', signed: true, signedAt: '2026-07-18 16:40' }
      ],
      summary: [
        { bidder: 'A科技有限公司', average: 90, rank: 1 },
        { bidder: 'B实业有限公司', average: 81, rank: 2 },
        { bidder: 'C股份有限公司', average: 76, rank: 3 }
      ],
      opinions: [
        { expert: '专家甲', opinion: 'A科技有限公司综合表现最优，推荐为第一候选人。' },
        { expert: '专家乙', opinion: '三家投标人均通过符合性审查，A科技有限公司技术与商务得分领先。' },
        { expert: '专家丙', opinion: '评标过程规范，推荐候选人排序合理。' }
      ],
      archiveLog: []
    },
    status: 'submitted'
  }
}

function clone(value) {
  return value ? JSON.parse(JSON.stringify(value)) : value
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
    return clone(SEED_EVALS) || {}
  },
  saveAll() {
    return null
  },
  // 返回单个项目评标状态（无记录时返回默认结构）
  getEval(projectId) {
    return clone(SEED_EVALS[String(projectId)]) || emptyEval()
  },
  saveEval(projectId) {
    // 纯演示：不保存数据
    return this.getEval(projectId)
  },
  updateEval(projectId, updater) {
    // 纯演示：不保存数据，updater 作用于副本后丢弃
    const data = this.getEval(projectId)
    if (typeof updater === 'function') updater(data)
    return data
  },
  resetEval() {
    return null
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

// 截止时间是否已过期。兼容 ISO 与 'YYYY-MM-DD HH:mm'；未设置截止时间视为未过期。
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
