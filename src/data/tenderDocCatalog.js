// 招标文件默认目录模板
// 供 TenderDoc 与 tenderDocStore 共享，避免多处维护

export const defaultCatalog = [
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

export const tenderDocTemplates = [
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
