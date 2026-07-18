// 监督异常/意见记录 mock 存储（localStorage 持久化）
// 由 SupervisorHall（项目监督视图登记，source: 'hall'）与 SupervisorAbnormal（异常登记页，source: 'abnormal'）共同消费。

const RECORDS_KEY = 'bidding-supervisor-records'

// 记录结构：
// {
//   id: string,          // 'YC' + Date.now()
//   projectId: string,   // 关联项目 id；无项目上下文时存空串
//   project: string,     // 涉及项目名称（冗余展示用）
//   type: string,        // 监督记录/监督意见（大厅）或 开标异常/评标异常/专家违规/其他（登记页）
//   desc: string,
//   status: string,      // 默认 '待处理'
//   time: string,        // new Date().toLocaleString()
//   source: string       // 登记入口：'hall' 监督大厅 / 'abnormal' 异常登记页
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

export const supervisorStore = {
  getRecords() {
    return load(RECORDS_KEY, [])
  },
  addRecord({ projectId = '', project = '', type = '监督记录', desc = '', source = 'abnormal' }) {
    const records = this.getRecords()
    const record = {
      id: 'YC' + Date.now(),
      projectId: String(projectId || ''),
      project,
      type,
      desc,
      status: '待处理',
      time: new Date().toLocaleString(),
      source
    }
    records.unshift(record)
    save(RECORDS_KEY, records)
    return record
  },
  // 首次为空时写入种子（演示记录只种一次）
  seedIfEmpty(seedList) {
    const records = this.getRecords()
    if (records.length > 0) return records
    save(RECORDS_KEY, seedList)
    return seedList
  }
}
