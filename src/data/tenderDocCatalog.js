// @ts-nocheck — TS 渐进迁移基线：解冻本文件时删除本行并修复类型（见 AGENTS.md 技术栈）
// 采购文件默认目录模板
// 供 TenderDoc 与 tenderDocStore 共享，避免多处维护
//
// 清单 36（2026-07-17 需求确认）：评审条款与响应文件的关联由「系统识别」完成，
// 且未完成关联允许提交响应文件。目录/条款节点统一预留 autoMatchedFile 字段，
// 用于存放系统识别出的响应文件名；当前均为 null，正式版由系统自动识别写入。
// 该预留不影响响应文件页（BidUpload）现有的手工挂接逻辑。

// 条款系统识别预留说明文案，供 TenderDoc 页面展示
export const CLAUSE_AUTO_MATCH_NOTE = '正式版由系统自动识别关联'

function withAutoMatchField(nodes) {
  return nodes.map((node) => {
    const next = { autoMatchedFile: null, ...node }
    if (node.children) next.children = withAutoMatchField(node.children)
    return next
  })
}

const baseCatalog = [
  {
    key: '采购公告',
    title: '采购公告',
    children: [
      { key: '项目概况', title: '项目概况', content: '' },
      { key: '响应单位资格要求', title: '响应单位资格要求', content: '' }
    ]
  },
  { key: '响应单位须知', title: '响应单位须知', content: '' },
  { key: '评审办法', title: '评审办法', content: '' },
  { key: '合同条款', title: '合同条款', content: '' },
  {
    key: '采购需求',
    title: '采购需求',
    children: [
      { key: '技术规格', title: '技术规格', content: '' },
      { key: '商务要求', title: '商务要求', content: '' }
    ]
  },
  { key: '响应文件格式', title: '响应文件格式', content: '' }
]

// 默认目录：导出前统一打上条款系统识别预留字段（autoMatchedFile）
export const defaultCatalog = withAutoMatchField(baseCatalog)

const baseTemplates = [
  {
    name: '货物类阳光采购',
    catalog: [
      {
        key: '采购公告',
        title: '采购公告',
        children: [
          { key: '项目概况', title: '项目概况', content: '货物类项目概况...' },
          { key: '响应单位资格要求', title: '响应单位资格要求', content: '' }
        ]
      },
      { key: '响应单位须知', title: '响应单位须知', content: '响应单位须知正文...' },
      { key: '评审办法', title: '评审办法', content: '综合评分法...' },
      { key: '合同条款', title: '合同条款', content: '' },
      {
        key: '采购需求',
        title: '采购需求',
        children: [
          { key: '技术规格', title: '技术规格', content: '' },
          { key: '商务要求', title: '商务要求', content: '' }
        ]
      },
      { key: '响应文件格式', title: '响应文件格式', content: '' }
    ]
  },
  {
    name: '服务类阳光采购',
    catalog: [
      {
        key: '采购公告',
        title: '采购公告',
        children: [
          { key: '项目概况', title: '项目概况', content: '服务类项目概况...' },
          { key: '响应单位资格要求', title: '响应单位资格要求', content: '' }
        ]
      },
      { key: '响应单位须知', title: '响应单位须知', content: '' },
      { key: '评审办法', title: '评审办法', content: '性价比法...' },
      { key: '合同条款', title: '合同条款', content: '' },
      {
        key: '采购需求',
        title: '采购需求',
        children: [
          { key: '服务要求', title: '服务要求', content: '' },
          { key: '人员要求', title: '人员要求', content: '' }
        ]
      },
      { key: '响应文件格式', title: '响应文件格式', content: '' }
    ]
  }
]

// 模板目录同样打上条款系统识别预留字段
export const tenderDocTemplates = baseTemplates.map((tpl) => ({
  ...tpl,
  catalog: withAutoMatchField(tpl.catalog)
}))
