// 异议/质疑 mock 数据存储
// 使用 localStorage 持久化，供 BidDownload（投标人提交质疑）与 ObjectionManage（招标人/代理查看答复）共享

const OBJECTIONS_KEY = 'bidding-objections'

const defaultObjections = [
  {
    id: 'obj-1',
    project: 'XX市轨道交通设备采购项目',
    projectId: '1',
    type: '招标文件',
    subType: '技术',
    bidder: 'B实业有限公司',
    content: '技术参数中某指标设置过高，建议澄清。',
    status: '已答复',
    attachments: [],
    reply: '经核实，该指标已按实际需求设定，详见澄清说明（一）。',
    createdAt: '2026-07-05 10:30'
  },
  {
    id: 'obj-2',
    project: '软件开发服务项目',
    projectId: '3',
    type: '评标',
    subType: '其他',
    bidder: 'A科技有限公司',
    content: '对评分结果有异议，申请复核。',
    status: '待答复',
    attachments: [],
    reply: '',
    createdAt: '2026-07-12 14:00'
  }
]

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

export const objectionStore = {
  getAll() {
    return load(OBJECTIONS_KEY, defaultObjections)
  },
  saveAll(list) {
    save(OBJECTIONS_KEY, list)
  },
  add(item) {
    const list = this.getAll()
    const next = [item, ...list]
    this.saveAll(next)
    return next
  },
  update(id, patch) {
    const list = this.getAll()
    const next = list.map((item) => (item.id === id ? { ...item, ...patch } : item))
    this.saveAll(next)
    return next
  },
  getTenderDocQuestions() {
    return this.getAll().filter((item) => item.type === '招标文件')
  }
}
