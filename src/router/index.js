import { createRouter, createWebHistory } from 'vue-router'
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
import Layout from '../components/Layout.vue'

const routes = [
  { path: '/', name: 'Portal', component: Portal },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  {
    path: '/admin',
    component: Layout,
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: 'dashboard', name: 'Dashboard', component: Dashboard },
      { path: 'projects', name: 'ProjectList', component: ProjectList },
      { path: 'projects/create', name: 'ProjectCreate', component: ProjectCreate },
      { path: 'projects/track', name: 'ProjectTrack', component: ProjectTrack },
      { path: 'tender-doc', name: 'TenderDoc', component: TenderDoc },
      { path: 'bid-upload', name: 'BidUpload', component: BidUpload },
      { path: 'opening-hall', name: 'OpeningHall', component: OpeningHall },
      { path: 'evaluation-hall', name: 'EvaluationHall', component: EvaluationHall },
      { path: 'notice-publish', name: 'NoticePublish', component: NoticePublish },
      { path: 'bidder-projects', name: 'BidderProjects', component: BidderProjects },
      { path: 'bid-register', name: 'BidRegister', component: BidRegister },
      { path: 'bid-payment', name: 'BidPayment', component: BidPayment },
      { path: 'bid-download', name: 'BidDownload', component: BidDownload },
      { path: 'bid-quote', name: 'BidQuote', component: BidQuote },
      { path: 'bidder-invoices', name: 'BidderInvoices', component: BidderInvoices },
      { path: 'expert-project', name: 'ExpertProject', component: ExpertProject },
      { path: 'supervisor-hall', name: 'SupervisorHall', component: SupervisorHall },
      { path: 'supervisor-logs', name: 'SupervisorLogs', component: SupervisorLogs },
      { path: 'admin-dashboard', name: 'AdminDashboard', component: AdminDashboard },
      { path: 'admin-users', name: 'AdminUsers', component: AdminUsers },
      { path: 'admin-dictionary', name: 'AdminDictionary', component: AdminDictionary },
      { path: 'admin-supplier-audit', name: 'AdminSupplierAudit', component: AdminSupplierAudit },
      { path: 'admin-logs', name: 'AdminLogs', component: AdminLogs },
      { path: 'award-confirm', name: 'AwardConfirm', component: AwardConfirm },
      { path: 'award-notice', name: 'AwardNotice', component: AwardNotice },
      { path: 'contract-archive', name: 'ContractArchive', component: ContractArchive },
      { path: 'fee-manage', name: 'FeeManage', component: FeeManage },
      { path: 'objection-manage', name: 'ObjectionManage', component: ObjectionManage },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
