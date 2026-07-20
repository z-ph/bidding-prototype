// 监督异常/意见记录 mock 存储（纯内存静态种子，无任何持久化）
// 由 SupervisorHall（项目监督视图登记，source: 'hall'）与 SupervisorAbnormal（异常登记页，source: 'abnormal'）共同消费。

// 记录结构：{ id, projectId, project, type, desc, status, time, source }
const SEED_RECORDS = [
  {
    id: 'YC20260718001',
    projectId: '3',
    project: 'XX大学实验室设备采购项目',
    type: '开标异常',
    desc: '开标前发现 B实业有限公司 授权已过期，已要求招标人在开标前完成重新授权确认。',
    status: '待处理',
    time: '2026-07-18 16:40',
    source: 'hall'
  },
  {
    id: 'YC20260701002',
    projectId: '7',
    project: '市政养护材料采购项目',
    type: '监督意见',
    desc: '评标过程符合法定程序，评标委员会组建及抽取记录完整，无异议。',
    status: '已处理',
    time: '2026-07-01 11:20',
    source: 'abnormal'
  }
]

function clone(value) {
  return value ? JSON.parse(JSON.stringify(value)) : value
}

export const supervisorStore = {
  getRecords() {
    return clone(SEED_RECORDS)
  },
  addRecord({ projectId = '', project = '', type = '监督记录', desc = '', source = 'abnormal' }) {
    // 纯演示：不写入数据，返回构造好的记录供展示
    return {
      id: 'YC（演示）',
      projectId: String(projectId || ''),
      project,
      type,
      desc,
      status: '待处理',
      time: '（演示）',
      source
    }
  },
  // 纯演示：种子已内置，直接返回记录列表
  seedIfEmpty() {
    return this.getRecords()
  }
}
