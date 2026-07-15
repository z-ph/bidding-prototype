// 招标文件版本链 mock 数据存储
// 支持按项目保存多版本招标文件，供 TenderDoc、BidDownload、ExpertProject 共享同一文件对象

import { defaultCatalog } from './tenderDocCatalog.js'

const TENDER_DOCS_KEY = 'bidding-tender-docs-v1'

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
  { id: 2, content: `${creator} 编辑了“招标公告”章节`, time: '2026-07-08 10:30', type: 'info' }
]

const seedDocs = {
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
      history: defaultHistory('V1.0', '李四'),
      creator: '李四',
      confirmer: '张三',
      updatedAt: '2026-07-03 09:00',
      publishedAt: '2026-07-03 09:00'
    }
  ]
}

function loadAll() {
  try {
    const raw = localStorage.getItem(TENDER_DOCS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveAll(docs) {
  try {
    localStorage.setItem(TENDER_DOCS_KEY, JSON.stringify(docs))
  } catch {
    // ignore storage errors
  }
}

function nowString() {
  return new Date().toLocaleString()
}

function generateId(projectId) {
  return `td-${projectId}-${Date.now()}`
}

function nextVersionNo(versions) {
  if (!versions || versions.length === 0) return 'V1.0'
  const last = versions[versions.length - 1].versionNo
  const match = last.match(/V(\d+)\.(\d+)/)
  if (!match) return `V${versions.length + 1}.0`
  const major = Number(match[1])
  const minor = Number(match[2]) + 1
  return `V${major}.${minor}`
}

export const tenderDocStore = {
  getAll() {
    return loadAll()
  },
  saveAll(docs) {
    saveAll(docs)
  },
  getProjectVersions(projectId) {
    const docs = loadAll()
    const key = String(projectId)
    if (!docs[key] || docs[key].length === 0) {
      const seed = seedDocs[key]
        ? JSON.parse(JSON.stringify(seedDocs[key]))
        : [this.createInitialVersion(projectId)]
      docs[key] = seed
      saveAll(docs)
    }
    return docs[key]
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
      id: generateId(projectId),
      projectId: String(projectId),
      versionNo: 'V1.0',
      status: 'editing',
      catalog: JSON.parse(JSON.stringify(defaultCatalog)),
      fileList: [],
      scoreItems: JSON.parse(JSON.stringify(defaultScoreItems)),
      history: [
        { id: Date.now(), content: '新建招标文件 V1.0', time: nowString(), type: 'primary' }
      ],
      creator: '',
      confirmer: '',
      updatedAt: nowString(),
      publishedAt: ''
    }
  },
  addVersion(projectId, baseVersion, creator) {
    const docs = loadAll()
    const key = String(projectId)
    const versions = docs[key] || []
    const nextNo = nextVersionNo(versions)
    const newVersion = {
      id: generateId(projectId),
      projectId: key,
      versionNo: nextNo,
      status: 'editing',
      catalog: JSON.parse(JSON.stringify(baseVersion?.catalog || defaultCatalog)),
      fileList: JSON.parse(JSON.stringify(baseVersion?.fileList || [])),
      scoreItems: JSON.parse(JSON.stringify(baseVersion?.scoreItems || defaultScoreItems)),
      history: [
        { id: Date.now(), content: `${creator || '用户'} 基于 ${baseVersion?.versionNo || '历史版本'} 创建新版本 ${nextNo}`, time: nowString(), type: 'primary' },
        ...JSON.parse(JSON.stringify(baseVersion?.history || []))
      ],
      creator: creator || baseVersion?.creator || '',
      confirmer: '',
      updatedAt: nowString(),
      publishedAt: ''
    }
    versions.push(newVersion)
    docs[key] = versions
    saveAll(docs)
    return newVersion
  },
  updateVersion(projectId, versionId, patch) {
    const docs = loadAll()
    const key = String(projectId)
    const versions = docs[key] || []
    const idx = versions.findIndex((v) => v.id === versionId)
    if (idx === -1) return null
    const next = { ...versions[idx], ...patch, id: versions[idx].id }
    versions.splice(idx, 1, next)
    docs[key] = versions
    saveAll(docs)
    return next
  },
  publishVersion(projectId, versionId, patch) {
    return this.updateVersion(projectId, versionId, {
      ...patch,
      status: 'published',
      publishedAt: nowString()
    })
  }
}
