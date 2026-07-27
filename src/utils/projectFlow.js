// @ts-nocheck — TS 渐进迁移基线：解冻本文件时删除本行并修复类型（见 AGENTS.md 技术栈）
// 项目流程与角色操作辅助函数
// 供 ProjectDetail、ProjectTrack 等页面统一使用，避免重复逻辑

import {
  FLOW_NODES,
  getFlowNodeKeys,
  isInquiryFamily
} from '../views/ProjectList.jsx'

// 项目状态 → 流程节点 key 映射（用于 Timeline 高亮当前阶段）
// 2026-07-17 口径：无报名/缴费节点（registering 公告期归入 bid 节点），无合同归档节点（成交确认后流程结束）
export const STATUS_TO_NODE_KEY = {
  draft: 'requirement',
  pending: 'requirement',
  // 立项已通过、待发布采购（2026-07-27 口径）：立项环节完成，定位到公告节点前
  approved: 'notice',
  tendering: 'notice',
  registering: 'bid',
  pending_open: 'opening',
  evaluating: 'evaluation',
  '评审完成': 'award',
  'evaluation-done': 'award',
  '已确认中选人': 'award',
  'winner-confirmed': 'award',
  '通知书已发': 'award',
  'notice-sent': 'award',
  done: 'award'
}

// 询比族项目：待开启状态定位到比价节点（hall-purchase-method-mapping-20260721）；
// 其余状态与默认映射一致（registering→bid、evaluating→evaluation）
export const INQUIRY_FAMILY_STATUS_TO_NODE_KEY = {
  pending_open: 'comparison'
}

export function getProjectStatusNodeKey(project) {
  const status = project?.status
  if (isInquiryFamily(project)) {
    return INQUIRY_FAMILY_STATUS_TO_NODE_KEY[status] || STATUS_TO_NODE_KEY[status] || 'requirement'
  }
  return STATUS_TO_NODE_KEY[status] || 'requirement'
}

// 按采购方式过滤流程节点，并按当前状态高亮
export function getProjectFlowNodes(project) {
  const nodeKeys = getFlowNodeKeys(project)
  const currentKey = getProjectStatusNodeKey(project)
  const currentIndex = nodeKeys.indexOf(currentKey)
  return FLOW_NODES
    .filter((node) => nodeKeys.includes(node.key))
    .map((node) => {
      const nodeIndex = nodeKeys.indexOf(node.key)
      let color = 'gray'
      let time = '待进行'
      if (nodeIndex < currentIndex) {
        color = 'green'
        time = '已完成'
      } else if (node.key === currentKey) {
        color = 'blue'
        time = '进行中'
      }
      return { ...node, color, time }
    })
}

// 采购单位视角：当前阶段可操作卡片
export function getTendereeActions(project) {
  const projectId = project?.id
  const orgMode = project?.orgMode
  const isAgent = orgMode === 'agent'
  const status = project?.status

  const go = (target, search = {}) => ({
    type: 'navigate',
    target,
    search: { ...search, projectId }
  })

  const commonView = (target) => go(target, { projectId })

  // 大厅族分流（hall-purchase-method-mapping-20260721）：采购族→开启大厅，询比族→比价大厅
  const inquiryFamily = isInquiryFamily(project)
  const hallTarget = inquiryFamily ? '/admin/comparison-hall' : '/admin/opening-hall'

  switch (status) {
    case 'draft':
      return [
        {
          title: '继续编辑项目',
          desc: '完善项目基本信息、采购包和供应商要求后提交审核',
          buttonText: '编辑项目',
          action: go('/admin/projects/create', { editId: projectId })
        },
        {
          title: '直接发布采购',
          desc: '草稿状态可直接发布，进入采购中状态',
          buttonText: '发布采购',
          action: { type: 'publish' }
        }
      ]
    case 'pending':
      return [
        {
          title: '查看审核进度',
          desc: '项目已提交审核，等待采购管理部处理',
          buttonText: '查看审批',
          action: go('/admin/approval-center')
        }
      ]
    case 'approved':
      return [
        {
          title: '发布采购',
          desc: '立项审批已通过，发布采购后项目进入采购中状态',
          buttonText: '发布采购',
          action: { type: 'publish' }
        }
      ]
    case 'tendering':
      if (isAgent) {
        return [
          {
            title: '查看采购文件',
            desc: '本项目为委托代理，采购文件由代理机构编制，采购单位可查看与确认',
            buttonText: '查看采购文件',
            action: commonView('/admin/tender-doc')
          }
        ]
      }
      return [
        {
          title: '编制采购文件',
          desc: '完善采购公告、响应单位须知、评审办法等章节',
          buttonText: '采购文件',
          action: commonView('/admin/tender-doc')
        },
        {
          title: '发布公告',
          desc: '将采购公告发布至门户，供应商可查看并响应',
          buttonText: '发布公告',
          action: commonView('/admin/notice-publish')
        }
      ]
    case 'registering':
      return [
        {
          title: '查看响应情况',
          desc: '查看供应商响应文件与报价的响应进展',
          buttonText: '项目跟踪',
          action: commonView('/admin/projects/track')
        },
        inquiryFamily
          ? {
              title: '准备比价',
              desc: '报价截止后进入比价大厅比较各供应商报价',
              buttonText: '进入比价大厅',
              action: commonView(hallTarget)
            }
          : {
              title: '准备开启',
              desc: '采购截止后进入开启大厅完成签到、解密、唱价',
              buttonText: '进入开启大厅',
              action: commonView(hallTarget)
            }
      ]
    case 'pending_open':
      return [
        inquiryFamily
          ? {
              title: '进入比价大厅',
              desc: '比较各供应商报价，生成比价结果',
              buttonText: '比价大厅',
              action: commonView(hallTarget)
            }
          : {
              title: '进入开启大厅',
              desc: '组织响应单位完成签到、解密、唱价',
              buttonText: '开启大厅',
              action: commonView(hallTarget)
            }
      ]
    case 'evaluating':
      return [
        {
          title: '进入评审大厅',
          desc: '查看专家评分进度与评审报告',
          buttonText: '评审大厅',
          action: commonView('/admin/evaluation-hall')
        }
      ]
    case '评审完成':
    case 'evaluation-done':
      return [
        {
          title: '确认中选人',
          desc: '根据评审委员会推荐，确定中选候选人',
          buttonText: '确认中选人',
          action: commonView('/admin/award-confirm')
        }
      ]
    case '已确认中选人':
    case 'winner-confirmed':
      return [
        {
          title: '发送中选通知书',
          desc: '向中选人发送中选通知书并公示结果',
          buttonText: '中选通知书',
          action: commonView('/admin/award-notice')
        }
      ]
    case '通知书已发':
    case 'notice-sent':
    case 'done':
      return [
        {
          title: '项目已完成',
          desc: '中选通知书已发出，项目成交流程结束',
          buttonText: '返回项目列表',
          action: go('/admin/projects')
        }
      ]
    default:
      return []
  }
}

// 采购代理视角：当前阶段可操作卡片（refactor-agent-menu-workflow-20260718）
// 镜像 getTendereeActions 的状态分发结构与返回格式，动作按代理职责定义：
// 编制采购文件、发布公告、组织开评审、专家抽取、提交成交审批、发中选通知书
export function getAgentActions(project) {
  const projectId = project?.id
  const status = project?.status

  const go = (target, search = {}) => ({
    type: 'navigate',
    target,
    search: { ...search, projectId }
  })

  const commonView = (target) => go(target, { projectId })

  // 大厅族分流（hall-purchase-method-mapping-20260721）：采购族→开启大厅，询比族→比价大厅
  const inquiryFamily = isInquiryFamily(project)
  const hallTarget = inquiryFamily ? '/admin/comparison-hall' : '/admin/opening-hall'

  switch (status) {
    case 'draft':
      return [
        {
          title: '编制采购文件',
          desc: '接受委托后编制采购公告、响应单位须知、评审办法等章节',
          buttonText: '采购文件',
          action: commonView('/admin/tender-doc')
        }
      ]
    case 'pending':
      return [
        {
          title: '查看审批进度',
          desc: '项目已提交审核，等待采购管理部处理',
          buttonText: '查看审批',
          action: go('/admin/approval-center')
        }
      ]
    case 'approved':
      return [
        {
          title: '立项已通过',
          desc: '立项审批已通过，待采购单位发布采购',
          buttonText: '查看项目',
          action: go('/admin/projects')
        }
      ]
    case 'tendering':
      return [
        {
          title: '编制采购文件',
          desc: '完善采购公告、响应单位须知、评审办法等章节',
          buttonText: '采购文件',
          action: commonView('/admin/tender-doc')
        },
        {
          title: '发布公告',
          desc: '将采购公告发布至门户，供应商可查看并响应',
          buttonText: '发布公告',
          action: commonView('/admin/notice-publish')
        },
        {
          title: '供应商授权',
          desc: '向受邀供应商发放授权与邀请，控制可响应范围',
          buttonText: '供应商授权',
          action: commonView('/admin/supplier-authorization')
        }
      ]
    case 'registering':
      return [
        {
          title: '查看响应情况',
          desc: '查看供应商响应文件与报价的响应进展',
          buttonText: '项目跟踪',
          action: commonView('/admin/projects/track')
        },
        inquiryFamily
          ? {
              title: '准备比价',
              desc: '报价截止后进入比价大厅汇总并比较各供应商报价',
              buttonText: '进入比价大厅',
              action: commonView(hallTarget)
            }
          : {
              title: '准备开启',
              desc: '采购截止后进入开启大厅组织签到、解密、唱价',
              buttonText: '进入开启大厅',
              action: commonView(hallTarget)
            }
      ]
    case 'pending_open':
      return [
        inquiryFamily
          ? {
              title: '进入比价大厅',
              desc: '汇总并比较各供应商报价，生成比价结果',
              buttonText: '比价大厅',
              action: commonView(hallTarget)
            }
          : {
              title: '进入开启大厅',
              desc: '组织响应单位完成签到、解密、唱价',
              buttonText: '开启大厅',
              action: commonView(hallTarget)
            }
      ]
    case 'evaluating':
      return [
        {
          title: '专家抽取',
          desc: '按项目专业领域随机抽取评审专家并通知确认',
          buttonText: '专家抽取',
          action: commonView('/admin/expert-extraction')
        },
        {
          title: '进入评审大厅',
          desc: '查看专家评分进度与评审报告',
          buttonText: '评审大厅',
          action: commonView('/admin/evaluation-hall')
        }
      ]
    case '评审完成':
    case 'evaluation-done':
      return [
        {
          title: '提交成交审批',
          desc: '汇总评审报告，提交成交审批以确定中选人',
          buttonText: '成交审批',
          action: commonView('/admin/approval-center')
        }
      ]
    case '已确认中选人':
    case 'winner-confirmed':
      return [
        {
          title: '发送中选通知书',
          desc: '向中选人发送中选通知书并公示结果',
          buttonText: '中选通知书',
          action: commonView('/admin/award-notice')
        }
      ]
    case '通知书已发':
    case 'notice-sent':
    case 'done':
      return [
        {
          title: '项目已完成',
          desc: '中选通知书已发出，项目成交流程结束',
          buttonText: '返回项目列表',
          action: go('/admin/projects')
        }
      ]
    default:
      return []
  }
}

// 采购单位/代理视角：当前状态与下一步提示
export function getTendereeStatusSummary(project) {
  const actions = getTendereeActions(project)
  const first = actions[0]
  const statusTextMap = {
    draft: '草稿待完善',
    pending: '已提交审核',
    approved: '立项已通过，待发布采购',
    tendering: '采购中',
    registering: '公告中，等待供应商响应',
    pending_open: '采购截止，等待开启',
    evaluating: '评审中',
    '评审完成': '评审完成，待确认中选人',
    'evaluation-done': '评审完成，待确认中选人',
    '已确认中选人': '已确认中选人，待发送通知书',
    'winner-confirmed': '已确认中选人，待发送通知书',
    '通知书已发': '中选通知书已发送',
    'notice-sent': '中选通知书已发送',
    done: '项目已完成'
  }
  return {
    currentNode: first?.title || '项目进行中',
    currentStatus: statusTextMap[project?.status] || '项目进行中',
    nextStepLabel: first ? `下一步：${first.title}` : '暂无后续操作',
    firstAction: first
  }
}
