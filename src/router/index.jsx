import { createHashRouter, Navigate, useLocation, Outlet } from 'react-router-dom'
import { canAccess, getBreadcrumbName } from '../config/permissions.js'

import Portal from '../views/Portal.jsx'
import Login from '../views/Login.jsx'
import Register from '../views/Register.jsx'
import Dashboard from '../views/Dashboard.jsx'
import ProjectList from '../views/ProjectList.jsx'
import ProjectCreate from '../views/ProjectCreate.jsx'
import ProjectTrack from '../views/ProjectTrack.jsx'
import TenderDoc from '../views/TenderDoc.jsx'
import BidUpload from '../views/BidUpload.vue'
import OpeningHall from '../views/OpeningHall.vue'
import EvaluationHall from '../views/EvaluationHall.vue'
import NoticePublish from '../views/NoticePublish.jsx'
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
import Organization from '../views/Organization.vue'
import SupplierProfile from '../views/SupplierProfile.vue'
import ExpertProfile from '../views/ExpertProfile.vue'
import MessageCenter from '../views/MessageCenter.vue'
import SupervisorAbnormal from '../views/SupervisorAbnormal.vue'

import Layout from '../components/Layout.jsx'
import Forbidden from '../components/Forbidden.jsx'

function RequireAuth() {
  const location = useLocation()
  const publicPaths = ['/', '/login', '/register']

  if (publicPaths.includes(location.pathname)) {
    return <Outlet />
  }

  if (location.pathname.startsWith('/admin/')) {
    const role = localStorage.getItem('bidding-role') || 'tenderee'
    if (!canAccess(location.pathname, role)) {
      return <Navigate to="/admin/forbidden" replace state={{ from: location }} />
    }
  }

  return <Outlet />
}

const routes = [
  { path: '/', element: <Portal /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  {
    path: '/admin',
    element: <RequireAuth />,
    children: [
      {
        element: <Layout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <Dashboard />, handle: { title: '工作台' } },
          { path: 'projects', element: <ProjectList />, handle: { title: '项目列表' } },
          { path: 'projects/create', element: <ProjectCreate />, handle: { title: '创建项目' } },
          { path: 'projects/track', element: <ProjectTrack />, handle: { title: '项目跟踪' } },
          { path: 'tender-doc', element: <TenderDoc />, handle: { title: '招标文件' } },
          { path: 'bid-upload', element: <BidUpload />, handle: { title: '上传投标文件' } },
          { path: 'opening-hall', element: <OpeningHall />, handle: { title: '开标大厅' } },
          { path: 'evaluation-hall', element: <EvaluationHall />, handle: { title: '评标大厅' } },
          { path: 'notice-publish', element: <NoticePublish />, handle: { title: '发布公告' } },
          { path: 'bidder-projects', element: <BidderProjects />, handle: { title: '我参与的项目' } },
          { path: 'bid-register', element: <BidRegister />, handle: { title: '项目报名' } },
          { path: 'bid-payment', element: <BidPayment />, handle: { title: '缴纳费用' } },
          { path: 'bid-download', element: <BidDownload />, handle: { title: '下载文件' } },
          { path: 'bid-quote', element: <BidQuote />, handle: { title: '在线报价' } },
          { path: 'bidder-invoices', element: <BidderInvoices />, handle: { title: '发票申请' } },
          { path: 'expert-project', element: <ExpertProject />, handle: { title: '评标任务' } },
          { path: 'supervisor-hall', element: <SupervisorHall />, handle: { title: '监督大厅' } },
          { path: 'supervisor-logs', element: <SupervisorLogs />, handle: { title: '操作日志' } },
          { path: 'admin-dashboard', element: <AdminDashboard />, handle: { title: '管理控制台' } },
          { path: 'admin-users', element: <AdminUsers />, handle: { title: '用户权限' } },
          { path: 'admin-dictionary', element: <AdminDictionary />, handle: { title: '参数字典' } },
          { path: 'admin-supplier-audit', element: <AdminSupplierAudit />, handle: { title: '准入审核' } },
          { path: 'admin-logs', element: <AdminLogs />, handle: { title: '日志审计' } },
          { path: 'award-confirm', element: <AwardConfirm />, handle: { title: '确认中标人' } },
          { path: 'award-notice', element: <AwardNotice />, handle: { title: '中标通知书' } },
          { path: 'contract-archive', element: <ContractArchive />, handle: { title: '合同归档' } },
          { path: 'fee-manage', element: <FeeManage />, handle: { title: '费用管理' } },
          { path: 'objection-manage', element: <ObjectionManage />, handle: { title: '异议管理' } },
          { path: 'organization', element: <Organization />, handle: { title: '组织机构' } },
          { path: 'supplier-profile', element: <SupplierProfile />, handle: { title: '企业档案' } },
          { path: 'expert-profile', element: <ExpertProfile />, handle: { title: '专家信息' } },
          { path: 'message-center', element: <MessageCenter />, handle: { title: '消息中心' } },
          { path: 'supervisor-abnormal', element: <SupervisorAbnormal />, handle: { title: '异常登记' } },
          { path: 'forbidden', element: <Forbidden />, handle: { title: '无权限' } }
        ]
      }
    ]
  }
]

const router = createHashRouter(routes)

export { getBreadcrumbName }
export default router
