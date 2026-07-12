import { createRouter, createWebHashHistory } from 'vue-router'
import Portal from '../views/Portal.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Dashboard from '../views/Dashboard.vue'
import ProjectList from '../views/ProjectList.vue'
import ProjectCreate from '../views/ProjectCreate.vue'
import TenderDoc from '../views/TenderDoc.vue'
import BidUpload from '../views/BidUpload.vue'
import OpeningHall from '../views/OpeningHall.vue'
import EvaluationHall from '../views/EvaluationHall.vue'
import NoticePublish from '../views/NoticePublish.vue'
import BidderProjects from '../views/BidderProjects.vue'
import BidRegister from '../views/BidRegister.vue'
import BidPayment from '../views/BidPayment.vue'
import BidDownload from '../views/BidDownload.vue'
import BidQuote from '../views/BidQuote.vue'
import BidderInvoices from '../views/BidderInvoices.vue'
import ExpertProject from '../views/ExpertProject.vue'
import SupervisorHall from '../views/SupervisorHall.vue'
import SupervisorLogs from '../views/SupervisorLogs.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import AdminUsers from '../views/AdminUsers.vue'
import AdminDictionary from '../views/AdminDictionary.vue'
import AdminSupplierAudit from '../views/AdminSupplierAudit.vue'
import AdminLogs from '../views/AdminLogs.vue'
import AwardConfirm from '../views/AwardConfirm.vue'
import AwardNotice from '../views/AwardNotice.vue'
import ContractArchive from '../views/ContractArchive.vue'
import FeeManage from '../views/FeeManage.vue'
import ObjectionManage from '../views/ObjectionManage.vue'
import ProjectTrack from '../views/ProjectTrack.vue'
import Organization from '../views/Organization.vue'
import SupplierProfile from '../views/SupplierProfile.vue'
import ExpertProfile from '../views/ExpertProfile.vue'
import MessageCenter from '../views/MessageCenter.vue'
import SupervisorAbnormal from '../views/SupervisorAbnormal.vue'
import Forbidden from '../components/Forbidden.vue'
import Layout from '../components/Layout.vue'
import { canAccess, getBreadcrumbName } from '../config/permissions.js'

const routes = [
  { path: '/', name: 'Portal', component: Portal },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  {
    path: '/admin',
    component: Layout,
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: 'dashboard', name: 'Dashboard', component: Dashboard, meta: { title: '工作台' } },
      { path: 'projects', name: 'ProjectList', component: ProjectList, meta: { title: '项目列表' } },
      { path: 'projects/create', name: 'ProjectCreate', component: ProjectCreate, meta: { title: '创建项目' } },
      { path: 'projects/track', name: 'ProjectTrack', component: ProjectTrack, meta: { title: '项目跟踪' } },
      { path: 'tender-doc', name: 'TenderDoc', component: TenderDoc, meta: { title: '招标文件' } },
      { path: 'bid-upload', name: 'BidUpload', component: BidUpload, meta: { title: '上传投标文件' } },
      { path: 'opening-hall', name: 'OpeningHall', component: OpeningHall, meta: { title: '开标大厅' } },
      { path: 'evaluation-hall', name: 'EvaluationHall', component: EvaluationHall, meta: { title: '评标大厅' } },
      { path: 'notice-publish', name: 'NoticePublish', component: NoticePublish, meta: { title: '发布公告' } },
      { path: 'bidder-projects', name: 'BidderProjects', component: BidderProjects, meta: { title: '我参与的项目' } },
      { path: 'bid-register', name: 'BidRegister', component: BidRegister, meta: { title: '项目报名' } },
      { path: 'bid-payment', name: 'BidPayment', component: BidPayment, meta: { title: '缴纳费用' } },
      { path: 'bid-download', name: 'BidDownload', component: BidDownload, meta: { title: '下载文件' } },
      { path: 'bid-quote', name: 'BidQuote', component: BidQuote, meta: { title: '在线报价' } },
      { path: 'bidder-invoices', name: 'BidderInvoices', component: BidderInvoices, meta: { title: '发票申请' } },
      { path: 'expert-project', name: 'ExpertProject', component: ExpertProject, meta: { title: '评标任务' } },
      { path: 'supervisor-hall', name: 'SupervisorHall', component: SupervisorHall, meta: { title: '监督大厅' } },
      { path: 'supervisor-logs', name: 'SupervisorLogs', component: SupervisorLogs, meta: { title: '操作日志' } },
      { path: 'admin-dashboard', name: 'AdminDashboard', component: AdminDashboard, meta: { title: '管理控制台' } },
      { path: 'admin-users', name: 'AdminUsers', component: AdminUsers, meta: { title: '用户权限' } },
      { path: 'admin-dictionary', name: 'AdminDictionary', component: AdminDictionary, meta: { title: '参数字典' } },
      { path: 'admin-supplier-audit', name: 'AdminSupplierAudit', component: AdminSupplierAudit, meta: { title: '准入审核' } },
      { path: 'admin-logs', name: 'AdminLogs', component: AdminLogs, meta: { title: '日志审计' } },
      { path: 'award-confirm', name: 'AwardConfirm', component: AwardConfirm, meta: { title: '确认中标人' } },
      { path: 'award-notice', name: 'AwardNotice', component: AwardNotice, meta: { title: '中标通知书' } },
      { path: 'contract-archive', name: 'ContractArchive', component: ContractArchive, meta: { title: '合同归档' } },
      { path: 'fee-manage', name: 'FeeManage', component: FeeManage, meta: { title: '费用管理' } },
      { path: 'objection-manage', name: 'ObjectionManage', component: ObjectionManage, meta: { title: '异议管理' } },
      { path: 'organization', name: 'Organization', component: Organization, meta: { title: '组织机构' } },
      { path: 'supplier-profile', name: 'SupplierProfile', component: SupplierProfile, meta: { title: '企业档案' } },
      { path: 'expert-profile', name: 'ExpertProfile', component: ExpertProfile, meta: { title: '专家信息' } },
      { path: 'message-center', name: 'MessageCenter', component: MessageCenter, meta: { title: '消息中心' } },
      { path: 'supervisor-abnormal', name: 'SupervisorAbnormal', component: SupervisorAbnormal, meta: { title: '异常登记' } },
      { path: 'forbidden', name: 'Forbidden', component: Forbidden, meta: { title: '无权限' } }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫：阻止越权访问
router.beforeEach((to, from, next) => {
  const publicPaths = ['/', '/login', '/register']
  if (publicPaths.includes(to.path)) {
    next()
    return
  }

  if (to.path.startsWith('/admin/')) {
    const role = localStorage.getItem('bidding-role') || 'tenderee'
    if (!canAccess(to.path, role)) {
      next('/admin/forbidden')
      return
    }
  }

  next()
})

export { getBreadcrumbName }
export default router
