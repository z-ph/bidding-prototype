// 招标文件默认目录模板
// 供 TenderDoc 与 tenderDocStore 共享，避免多处维护
//
// 清单 36（2026-07-17 需求确认）：评标条款与投标文件的关联由「系统识别」完成，
// 且未完成关联允许提交投标文件。目录/条款节点统一预留 autoMatchedFile 字段，
// 用于存放系统识别出的投标文件名；当前均为 null，正式版由系统自动识别写入。
// 该预留不影响投标文件页（BidUpload）现有的手工挂接逻辑。

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
    key: '招标公告',
    title: '招标公告',
    children: [
      { key: '项目概况', title: '项目概况', content: '' },
      { key: '投标人资格要求', title: '投标人资格要求', content: '' }
    ]
  },
  { key: '投标人须知', title: '投标人须知', content: '' },
  { key: '评标办法', title: '评标办法', content: '' },
  { key: '合同条款', title: '合同条款', content: '' },
  {
    key: '采购需求',
    title: '采购需求',
    children: [
      { key: '技术规格', title: '技术规格', content: '' },
      { key: '商务要求', title: '商务要求', content: '' }
    ]
  },
  { key: '投标文件格式', title: '投标文件格式', content: '' }
]

// 默认目录：导出前统一打上条款系统识别预留字段（autoMatchedFile）
export const defaultCatalog = withAutoMatchField(baseCatalog)

const baseTemplates = [
  {
    name: '货物类公开招标',
    catalog: [
      {
        key: '招标公告',
        title: '招标公告',
        children: [
          { key: '项目概况', title: '项目概况', content: '货物类项目概况...' },
          { key: '投标人资格要求', title: '投标人资格要求', content: '' }
        ]
      },
      { key: '投标人须知', title: '投标人须知', content: '投标人须知正文...' },
      { key: '评标办法', title: '评标办法', content: '综合评分法...' },
      { key: '合同条款', title: '合同条款', content: '' },
      {
        key: '采购需求',
        title: '采购需求',
        children: [
          { key: '技术规格', title: '技术规格', content: '' },
          { key: '商务要求', title: '商务要求', content: '' }
        ]
      },
      { key: '投标文件格式', title: '投标文件格式', content: '' }
    ]
  },
  {
    name: '服务类公开招标',
    catalog: [
      {
        key: '招标公告',
        title: '招标公告',
        children: [
          { key: '项目概况', title: '项目概况', content: '服务类项目概况...' },
          { key: '投标人资格要求', title: '投标人资格要求', content: '' }
        ]
      },
      { key: '投标人须知', title: '投标人须知', content: '' },
      { key: '评标办法', title: '评标办法', content: '性价比法...' },
      { key: '合同条款', title: '合同条款', content: '' },
      {
        key: '采购需求',
        title: '采购需求',
        children: [
          { key: '服务要求', title: '服务要求', content: '' },
          { key: '人员要求', title: '人员要求', content: '' }
        ]
      },
      { key: '投标文件格式', title: '投标文件格式', content: '' }
    ]
  }
]

// 模板目录同样打上条款系统识别预留字段
export const tenderDocTemplates = baseTemplates.map((tpl) => ({
  ...tpl,
  catalog: withAutoMatchField(tpl.catalog)
}))
