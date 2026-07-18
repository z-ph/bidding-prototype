// 角色与页面权限配置
// 解决：URL 改角色、越权访问、页面按钮权限边界等问题

export const ROLE_NAMES = {
  tenderee: '招标人',
  agent: '招标代理',
  bidder: '投标人/供应商',
  expert: '评标专家',
  supervisor: '监督人员',
  admin: '平台管理员'
}

export const ROLE_COLORS = {
  tenderee: '#2563EB',
  agent: '#059669',
  bidder: '#D97706',
  expert: '#DB2777',
  supervisor: '#DC2626',
  admin: '#475569'
}

// 页面路径 => 允许访问的角色列表
export const PAGE_PERMISSIONS = {
  // 通用首页
  '/admin/dashboard': ['tenderee', 'agent', 'bidder', 'expert', 'supervisor', 'admin'],

  // 待办中心：全部角色
  '/admin/todo-center': ['tenderee', 'agent', 'bidder', 'expert', 'supervisor', 'admin'],

  // 采购数据分析（角色暂定，待甲方确认）
  '/admin/analytics': ['tenderee', 'agent', 'admin'],

  // 招标人/招标代理共用页面
  '/admin/projects': ['tenderee', 'agent'],
  '/admin/projects/create': ['tenderee'],
  '/admin/projects/track': ['tenderee', 'agent'],
  '/admin/projects/detail/:id': ['tenderee', 'agent', 'bidder'],
  '/admin/tender-doc': ['tenderee', 'agent'],
  '/admin/notice-publish': ['tenderee', 'agent'],
  '/admin/notice-list': ['tenderee', 'agent'],
  '/admin/supplier-authorization': ['tenderee', 'agent'],
  '/admin/approval-center': ['tenderee', 'agent'],
  '/admin/approval-flow-config': ['tenderee', 'admin'],
  '/admin/procurement-requirements': ['tenderee'],
  '/admin/procurement-requirements/edit': ['tenderee'],
  '/admin/fee-manage': ['tenderee', 'agent'],
  '/admin/expert-extraction': ['tenderee', 'agent', 'admin'],
  '/admin/award-confirm': ['tenderee', 'agent'],
  '/admin/award-notice': ['tenderee', 'agent', 'bidder'],

  // 开标大厅：仅招标人/招标代理/投标人可进入，但操作权限不同
  '/admin/opening-hall': ['tenderee', 'agent', 'bidder', 'supervisor'],

  // 评标大厅：招标人/招标代理/评标专家/监督人员
  '/admin/evaluation-hall': ['tenderee', 'agent', 'expert', 'supervisor'],

  // 投标人页面
  '/admin/bidder-projects': ['bidder'],
  '/admin/bid-download': ['bidder'],
  '/admin/bid-quote': ['bidder'],
  '/admin/bid-upload': ['bidder'],

  // 专家页面
  '/admin/expert-project': ['expert'],
  '/admin/expert-tasks': ['expert'],

  // 监督页面
  '/admin/supervisor-hall': ['supervisor'],
  '/admin/supervisor-logs': ['supervisor'],

  // 开发阶段台账：不进任何业务角色主导航；公开合并页 /dev-ledger（无权限拦截），
  // 以下两个 /admin 旧路径已重定向到合并页（已登录全角色可经 redirect 通过布局校验）
  '/admin/review-change-list': ['tenderee', 'agent', 'bidder', 'expert', 'supervisor', 'admin'],
  '/admin/changelog': ['tenderee', 'agent', 'bidder', 'expert', 'supervisor', 'admin'],

  // 管理员页面
  '/admin/admin-users': ['admin'],
  '/admin/admin-dictionary': ['admin'],
  '/admin/admin-supplier-audit': ['admin'],
  '/admin/admin-logs': ['admin'],
  '/admin/admin-news': ['admin'],
  '/admin/organization': ['admin'],
  '/admin/sub-accounts': ['admin'],
  '/admin/notification-manage': ['admin'],
  '/admin/template-manage': ['admin'],
  '/admin/system-settings': ['admin'],

  // 供应商档案
  '/admin/supplier-profile': ['bidder'],

  // 专家信息
  '/admin/expert-profile': ['expert'],

  // 消息中心
  '/admin/message-center': ['tenderee', 'agent', 'bidder', 'expert', 'supervisor', 'admin'],

  // 监督异常登记
  '/admin/supervisor-abnormal': ['supervisor']
}

// 账号默认角色映射（演示环境用）
export const ACCOUNT_ROLE_MAP = {
  tenderee: 'tenderee',
  agent: 'agent',
  bidder: 'bidder',
  expert: 'expert',
  supervisor: 'supervisor',
  admin: 'admin',
  zhangsan: 'tenderee',
  lisi: 'agent',
  gongying: 'bidder',
  zhuanjia: 'expert',
  jiandu: 'supervisor'
}

// 面包屑中文映射
export const BREADCRUMB_NAMES = {
  Dashboard: '工作台',
  ProjectList: '项目列表',
  ProjectCreate: '创建项目',
  ProjectTrack: '项目跟踪',
  TenderDoc: '招标文件',
  BidUpload: '上传投标文件',
  OpeningHall: '开标大厅',
  EvaluationHall: '评标大厅',
  NoticePublish: '发布公告',
  NoticeList: '公告列表',
  ProcurementRequirementList: '采购需求',
  ProcurementRequirementEdit: '编辑采购需求',
  BidderProjects: '我参与的项目',
  BidDownload: '下载文件',
  BidQuote: '在线报价',
  ExpertProject: '评标任务',
  ExpertExtraction: '专家抽取',
  ExpertTasks: '我的任务',
  SupervisorHall: '监督大厅',
  SupervisorLogs: '操作日志',
  AdminDashboard: '管理控制台',
  AdminUsers: '用户权限',
  AdminDictionary: '参数字典',
  AdminSupplierAudit: '准入审核',
  AdminLogs: '日志审计',
  AwardConfirm: '确认中标人',
  AwardNotice: '中标通知书',
  FeeManage: '费用台账',
  Organization: '组织机构',
  SupplierProfile: '企业档案',
  ExpertProfile: '专家信息',
  MessageCenter: '消息中心',
  SupervisorAbnormal: '异常登记',
  AdminNews: '新闻公告维护',
  NoticeDetail: '公告详情',
  Contact: '联系我们',
  ProjectDetail: '项目详情',
  SubAccounts: '子账号管理',
  SupplierAuthorization: '供应商授权',
  TodoCenter: '待办中心',
  NotificationManage: '通知管理',
  TemplateManage: '模板管理',
  SystemSettings: '系统设置',
  ProcurementAnalytics: '采购数据分析',
  ApprovalCenter: '审批中心',
  ApprovalFlowConfig: '审批流配置'
}

// 统一业务状态颜色
export const STATUS_COLORS = {
  // 通用流程状态
  draft: 'info',        // 草稿：灰色
  pending: 'warning',   // 待处理：橙色
  processing: 'primary', // 进行中：蓝色
  completed: 'success', // 完成：绿色
  rejected: 'danger',   // 驳回/失败：红色
  exception: 'danger',  // 异常：红色

  // 业务语义映射
  草稿: 'info',
  待提交: 'info',
  待审核: 'warning',
  审核中: 'warning',
  待开标: 'warning',
  开标中: 'primary',
  评标中: 'primary',
  待定标: 'warning',
  已完成: 'success',
  已中标: 'success',
  已发布: 'success',
  已归档: 'success',
  已驳回: 'danger',
  已废标: 'danger',
  已流标: 'danger',
  异常: 'danger'
}

export function getAllowedRoles(path) {
  if (PAGE_PERMISSIONS[path]) {
    return PAGE_PERMISSIONS[path]
  }
  for (const [pattern, roles] of Object.entries(PAGE_PERMISSIONS)) {
    if (pattern.includes('/:')) {
      const regex = new RegExp('^' + pattern.replace(/:[^/]+/g, '[^/]+') + '$')
      if (regex.test(path)) {
        return roles
      }
    }
  }
  return []
}

export function canAccess(path, role) {
  const allowed = getAllowedRoles(path)
  return allowed.length === 0 || allowed.includes(role)
}

export function getRoleName(role) {
  return ROLE_NAMES[role] || '未知角色'
}

export function getBreadcrumbName(routeName) {
  return BREADCRUMB_NAMES[routeName] || routeName
}

export function resolveRoleFromAccount(account) {
  const key = String(account).toLowerCase().trim()
  return ACCOUNT_ROLE_MAP[key] || 'tenderee'
}
