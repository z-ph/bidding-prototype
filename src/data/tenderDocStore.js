// 招标文件版本链 mock 数据存储（纯内存静态种子，无任何持久化）
// 支持按项目读取多版本招标文件，供 TenderDoc、BidDownload、ExpertProject 共享同一文件对象
//
// 版本业务状态口径：
// - editing / previewing：编制中
// - pendingConfirm：待确认（招标人确认）
// - published：已发布（当前生效版本）
// - archived：已归档（历史版本）

import { defaultCatalog } from './tenderDocCatalog.js'

const defaultFileList = [
  { uid: '-1', name: '图纸.zip', size: 1024000 },
  { uid: '-2', name: '技术参数表.xlsx', size: 256000 }
]

// 评标办法默认评分项（名称 + 权重），权重合计 100，驱动 ExpertProject 评分页
const defaultScoreItems = [
  { id: 'business', name: '商务标', weight: 30 },
  { id: 'tech', name: '技术标', weight: 40 },
  { id: 'price', name: '价格标', weight: 30 }
]

export function getDefaultScoreItems() {
  return JSON.parse(JSON.stringify(defaultScoreItems))
}

const defaultHistory = (versionNo, creator) => [
  { id: 1, content: `${creator} 创建了招标文件 ${versionNo}`, time: '2026-07-08 09:00', type: 'primary' },
  { id: 2, content: `${creator} 编辑了"招标公告"章节`, time: '2026-07-08 10:30', type: 'info' }
]

// 种子：项目 1（招标中）/ 3（待开标）/ 5（评标中）均已发布 V1.0；项目 6（公告中）编制中待确认
const SEED_DOCS = {
  '1': [
    {
      id: 'td-1-1',
      projectId: '1',
      versionNo: 'V1.0',
      status: 'published',
      catalog: JSON.parse(JSON.stringify(defaultCatalog)),
      fileList: JSON.parse(JSON.stringify(defaultFileList)),
      scoreItems: JSON.parse(JSON.stringify(defaultScoreItems)),
      history: defaultHistory('V1.0', '李四'),
      creator: '李四',
      confirmer: '张三',
      updatedAt: '2026-07-08 10:30',
      publishedAt: '2026-07-08 10:30'
    }
  ],
  '3': [
    {
      id: 'td-3-1',
      projectId: '3',
      versionNo: 'V1.0',
      status: 'published',
      catalog: JSON.parse(JSON.stringify(defaultCatalog)),
      fileList: JSON.parse(JSON.stringify(defaultFileList)),
      scoreItems: JSON.parse(JSON.stringify(defaultScoreItems)),
      history: defaultHistory('V1.0', '张三'),
      creator: '张三',
      confirmer: '张三',
      updatedAt: '2026-07-03 09:00',
      publishedAt: '2026-07-03 09:00'
    }
  ],
  '5': [
    {
      id: 'td-5-1',
      projectId: '5',
      versionNo: 'V1.0',
      status: 'published',
      catalog: JSON.parse(JSON.stringify(defaultCatalog)),
      fileList: JSON.parse(JSON.stringify(defaultFileList)),
      scoreItems: JSON.parse(JSON.stringify(defaultScoreItems)),
      history: defaultHistory('V1.0', '张三'),
      creator: '张三',
      confirmer: '张三',
      updatedAt: '2026-07-06 09:00',
      publishedAt: '2026-07-06 09:00'
    }
  ],
  '6': [
    {
      id: 'td-6-1',
      projectId: '6',
      versionNo: 'V1.0',
      status: 'editing',
      catalog: JSON.parse(JSON.stringify(defaultCatalog)),
      fileList: JSON.parse(JSON.stringify(defaultFileList)),
      scoreItems: JSON.parse(JSON.stringify(defaultScoreItems)),
      history: [
        { id: 1, content: '张三 创建了招标文件 V1.0', time: '2026-07-15 09:00', type: 'primary' }
      ],
      creator: '张三',
      confirmer: '',
      updatedAt: '2026-07-15 09:00',
      publishedAt: ''
    }
  ]
}

function clone(value) {
  return value ? JSON.parse(JSON.stringify(value)) : value
}

export const tenderDocStore = {
  getAll() {
    return clone(SEED_DOCS) || {}
  },
  saveAll() {
    return null
  },
  getProjectVersions(projectId) {
    const key = String(projectId)
    if (SEED_DOCS[key] && SEED_DOCS[key].length > 0) {
      return clone(SEED_DOCS[key])
    }
    // 未预置的项目返回一份编制中的初始版本（仅内存，不落盘）
    return [this.createInitialVersion(projectId)]
  },
  getLatestVersion(projectId) {
    const versions = this.getProjectVersions(projectId)
    return versions[versions.length - 1]
  },
  getCurrentPublishedVersion(projectId) {
    const versions = this.getProjectVersions(projectId)
    const published = versions.filter((v) => v.status === 'published')
    return published.length > 0 ? published[published.length - 1] : null
  },
  // 读取已发布版本的评分项配置，驱动 ExpertProject 评分页；缺失时回退默认配置
  getPublishedScoreItems(projectId) {
    const published = this.getCurrentPublishedVersion(projectId)
    const items = published?.scoreItems
    if (!items || items.length === 0) return getDefaultScoreItems()
    return items
  },
  createInitialVersion(projectId) {
    return {
      id: `td-${projectId}-demo`,
      projectId: String(projectId),
      versionNo: 'V1.0',
      status: 'editing',
      catalog: JSON.parse(JSON.stringify(defaultCatalog)),
      fileList: [],
      scoreItems: JSON.parse(JSON.stringify(defaultScoreItems)),
      history: [
        { id: 1, content: '新建招标文件 V1.0', time: '（演示）', type: 'primary' }
      ],
      creator: '',
      confirmer: '',
      updatedAt: '（演示）',
      publishedAt: ''
    }
  },
  addVersion(projectId, baseVersion, creator) {
    // 纯演示：不写入数据
    return { ...this.createInitialVersion(projectId), creator: creator || baseVersion?.creator || '' }
  },
  updateVersion(projectId, versionId, patch) {
    // 纯演示：不写入数据
    const versions = this.getProjectVersions(projectId)
    const found = versions.find((v) => v.id === versionId)
    return found ? { ...found, ...patch, id: found.id } : null
  },
  publishVersion(projectId, versionId, patch) {
    // 纯演示：不写入数据
    const versions = this.getProjectVersions(projectId)
    const found = versions.find((v) => v.id === versionId)
    return found ? { ...found, ...patch, id: found.id, status: 'published', publishedAt: '（演示）' } : null
  }
}
