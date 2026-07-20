// 项目 mock 数据存储（纯内存静态种子，无任何持久化）
// 刷新即恢复初始演示数据；全部页面共享同一数据源，保证跳转后数据连贯。
//
// 演示主线（status 为唯一事实源，全部阶段页面读取本 store）：
//   2 草稿 → 8 待审核 → 1 招标中 → 6 公告中(邀请询比价) → 3 待开标(今日开标)
//   → 5 评标中 → 9 已确认中标人 → 4 通知书已发 → 7 已完成

export const SEED_PROJECTS = [
  {
    id: '1',
    name: 'XX市轨道交通设备采购项目',
    code: 'ZB20260701001',
    orgMode: 'self',
    budget: 850,
    status: 'tendering',
    publishTime: '2026-07-08',
    deadline: '2026-07-25',
    openTime: '2026-07-26 09:30',
    demandSource: '年度采购计划',
    demandCode: 'XQ-2026-001',
    linkedRequirementId: '',
    agentId: '',
    packages: [
      { name: '第一标段：主设备', code: 'B1', budget: 600, content: '主设备采购', purchaseMode: 'open', bidStart: '2026-07-10 09:00', bidEnd: '2026-07-25 17:00' },
      { name: '第二标段：辅材', code: 'B2', budget: 250, content: '辅助材料', purchaseMode: 'open', bidStart: '2026-07-10 09:00', bidEnd: '2026-07-25 17:00' }
    ],
    qualifications: ['营业执照', 'ISO9001认证'],
    intro: '本项目为轨道交通设备采购，包含主设备及辅材两个标段。',
    createTime: '2026-07-01 09:00'
  },
  {
    id: '2',
    name: '物业保洁服务采购项目',
    code: 'ZB20260712002',
    orgMode: 'agent',
    budget: 320,
    status: 'draft',
    publishTime: '',
    deadline: '',
    openTime: '',
    demandSource: '部门申报',
    demandCode: 'XQ-2026-014',
    linkedRequirementId: 'REQ20260714002',
    agentId: 'agent01',
    packages: [
      { name: '第一标段：保洁服务', code: 'B1', budget: 320, content: '办公区域物业保洁服务（一年期）', purchaseMode: 'open', bidStart: '', bidEnd: '' }
    ],
    qualifications: ['营业执照', '物业服务资质'],
    intro: '采购一年期物业保洁服务，含办公区、公共区域日常保洁。',
    createTime: '2026-07-12 10:00'
  },
  {
    id: '3',
    name: 'XX大学实验室设备采购项目',
    code: 'ZB20260705003',
    orgMode: 'self',
    budget: 560,
    status: 'pending_open',
    publishTime: '2026-07-05',
    deadline: '2026-07-20',
    openTime: '2026-07-20 15:00',
    demandSource: '专项采购计划',
    demandCode: 'XQ-2026-007',
    linkedRequirementId: 'REQ20260703001',
    agentId: '',
    packages: [
      { name: '第一标段：实验仪器', code: 'B1', budget: 380, content: '实验室精密仪器采购', purchaseMode: 'open', bidStart: '2026-07-06 09:00', bidEnd: '2026-07-20 10:00' },
      { name: '第二标段：实验耗材', code: 'B2', budget: 180, content: '实验室常用耗材', purchaseMode: 'open', bidStart: '2026-07-06 09:00', bidEnd: '2026-07-20 10:00' }
    ],
    qualifications: ['营业执照', '医疗器械经营许可'],
    intro: '大学实验室精密仪器与耗材采购，投标截止后当日下午开标。',
    createTime: '2026-07-03 09:00'
  },
  {
    id: '4',
    name: '物业服务采购项目',
    code: 'ZB20260628004',
    orgMode: 'self',
    budget: 480,
    status: '通知书已发',
    awardStage: 'notice-sent',
    publishTime: '2026-06-28',
    deadline: '2026-07-08',
    openTime: '2026-07-08 14:00',
    demandSource: '年度采购计划',
    demandCode: 'XQ-2026-005',
    linkedRequirementId: '',
    agentId: '',
    packages: [
      { name: '第一标段：物业服务', code: 'B1', budget: 480, content: '园区物业服务整体外包', purchaseMode: 'open', bidStart: '2026-06-29 09:00', bidEnd: '2026-07-08 10:00' }
    ],
    qualifications: ['营业执照', '物业服务资质'],
    intro: '园区物业服务整体外包项目，已完成评标定标并发出中标通知书。',
    winner: { name: 'A科技有限公司', total: 92.5, price: 462, opinion: '综合评分第一，价格合理，服务方案完整。', confirmedAt: '2026-07-11 16:00' },
    notice: { bidder: 'A科技有限公司', sentAt: '2026-07-12 10:00', content: '贵单位在物业服务采购项目中中标，请按通知书要求签订合同。' },
    createTime: '2026-06-25 09:00'
  },
  {
    id: '5',
    name: '轨道交通电缆材料采购项目',
    code: 'ZB20260706005',
    orgMode: 'self',
    budget: 1200,
    status: 'evaluating',
    publishTime: '2026-07-06',
    deadline: '2026-07-14',
    openTime: '2026-07-15 10:00',
    demandSource: '专项采购计划',
    demandCode: 'XQ-2026-009',
    linkedRequirementId: '',
    agentId: '',
    packages: [
      { name: '第一标段：电力电缆', code: 'B1', budget: 800, content: '轨道交通用电力电缆', purchaseMode: 'open', bidStart: '2026-07-07 09:00', bidEnd: '2026-07-14 17:00' },
      { name: '第二标段：控制电缆', code: 'B2', budget: 400, content: '控制与信号电缆', purchaseMode: 'open', bidStart: '2026-07-07 09:00', bidEnd: '2026-07-14 17:00' }
    ],
    qualifications: ['营业执照', 'CCC认证'],
    intro: '轨道交通电缆材料采购，评标委员会已提交评标结果，待确认中标人。',
    createTime: '2026-07-04 09:00'
  },
  {
    id: '6',
    name: '办公耗材框架协议采购项目',
    code: 'XJ20260715006',
    orgMode: 'self',
    budget: 90,
    status: 'registering',
    publishTime: '2026-07-15',
    deadline: '2026-07-24',
    openTime: '',
    demandSource: '部门申报',
    demandCode: 'XQ-2026-016',
    linkedRequirementId: '',
    agentId: '',
    packages: [
      { name: '第一标段：办公耗材', code: 'B1', budget: 90, content: '办公耗材年度框架协议', purchaseMode: 'invitation_inquiry', bidStart: '2026-07-16 09:00', bidEnd: '2026-07-24 17:00' }
    ],
    qualifications: ['营业执照'],
    intro: '邀请询比价项目：无开标/评标环节，报价截止后直接确认采购结果。',
    createTime: '2026-07-14 09:00'
  },
  {
    id: '7',
    name: '市政养护材料采购项目',
    code: 'ZB20260610007',
    orgMode: 'agent',
    budget: 650,
    status: 'done',
    awardStage: 'notice-sent',
    publishTime: '2026-06-10',
    deadline: '2026-06-24',
    openTime: '2026-06-24 14:00',
    demandSource: '年度采购计划',
    demandCode: 'XQ-2026-003',
    linkedRequirementId: '',
    agentId: 'agent01',
    packages: [
      { name: '第一标段：养护材料', code: 'B1', budget: 650, content: '市政道路养护材料采购', purchaseMode: 'open', bidStart: '2026-06-11 09:00', bidEnd: '2026-06-24 10:00' }
    ],
    qualifications: ['营业执照'],
    intro: '市政养护材料采购已完成全部流程并归档。',
    winner: { name: 'B实业有限公司', total: 88.2, price: 615, opinion: '评标委员会推荐第一候选人。', confirmedAt: '2026-06-30 15:00' },
    notice: { bidder: 'B实业有限公司', sentAt: '2026-07-01 09:30', content: '贵单位在市政养护材料采购项目中中标。' },
    createTime: '2026-06-08 09:00'
  },
  {
    id: '8',
    name: '信息化系统运维服务项目',
    code: 'ZB20260718008',
    orgMode: 'self',
    budget: 260,
    status: 'pending',
    publishTime: '',
    deadline: '',
    openTime: '',
    demandSource: '部门申报',
    demandCode: 'XQ-2026-018',
    linkedRequirementId: '',
    agentId: '',
    packages: [
      { name: '第一标段：系统运维', code: 'B1', budget: 260, content: '核心业务系统年度运维服务', purchaseMode: 'open', bidStart: '', bidEnd: '' }
    ],
    qualifications: ['营业执照', 'ISO27001认证'],
    intro: '已提交审核，等待管理员审核通过后发标。',
    createTime: '2026-07-18 11:00'
  },
  {
    id: '9',
    name: '智能安检系统采购项目',
    code: 'ZB20260620009',
    orgMode: 'self',
    budget: 720,
    status: '已确认中标人',
    awardStage: 'winner-confirmed',
    publishTime: '2026-06-20',
    deadline: '2026-07-02',
    openTime: '2026-07-02 15:00',
    demandSource: '专项采购计划',
    demandCode: 'XQ-2026-011',
    linkedRequirementId: '',
    agentId: '',
    packages: [
      { name: '第一标段：安检设备', code: 'B1', budget: 720, content: '智能安检设备与系统集成', purchaseMode: 'open', bidStart: '2026-06-21 09:00', bidEnd: '2026-07-02 10:00' }
    ],
    qualifications: ['营业执照', '安防工程资质'],
    intro: '已确认中标人，待发送中标通知书。',
    winner: { name: 'C股份有限公司', total: 90.6, price: 698, opinion: '综合评分第一。', confirmedAt: '2026-07-16 10:00' },
    createTime: '2026-06-18 09:00'
  }
]

export const projectStore = {
  getProjects() {
    return SEED_PROJECTS.map((p) => ({ ...p }))
  },
  saveProjects() {
    // 纯演示：不保存数据
    return null
  },
  getProjectById(id) {
    const found = SEED_PROJECTS.find((p) => String(p.id) === String(id))
    return found ? { ...found } : undefined
  },
  saveProject(project) {
    // 纯演示：不保存数据，原样返回入参以兼容调用方
    return project
  }
}
