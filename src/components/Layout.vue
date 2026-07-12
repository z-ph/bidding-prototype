<template>
  <el-container class="layout-container">
    <el-aside width="240px" class="sidebar">
      <div class="logo">
        <el-icon><Collection /></el-icon>
        <span>招投标平台</span>
      </div>
      <el-menu
        :default-active="$route.path"
        router
        background-color="#001529"
        text-color="#fff"
        active-text-color="#409EFF"
      >
        <template v-for="item in menuItems" :key="item.index">
          <el-sub-menu v-if="item.children" :index="item.index">
            <template #title>
              <el-icon><component :is="item.icon" /></el-icon>
              <span>{{ item.title }}</span>
            </template>
            <el-menu-item v-for="child in item.children" :key="child.index" :index="child.index">
              {{ child.title }}
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item v-else :index="item.index">
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.title }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="breadcrumb">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/admin/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ pageTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="user-info">
          <el-tag size="small" type="info" effect="dark">{{ roleName }}</el-tag>
          <el-avatar :size="32" :icon="UserFilled" />
          <span>{{ userName }}</span>
          <el-button link @click="logout">退出</el-button>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>

  <!-- 页面评审入口 -->
  <el-button
    v-if="showReviewFab"
    class="review-fab"
    type="primary"
    circle
    size="large"
    :icon="EditPen"
    title="页面评审"
    @click="reviewActive = true"
  />
  <ReviewTool v-model:active="reviewActive" />
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  UserFilled, Collection, Odometer, Folder, Document, Bell, Upload, VideoPlay, Star,
  User, SetUp, List, DocumentChecked, Money, Warning, Trophy, Wallet, Tickets,
  OfficeBuilding, Message, EditPen
} from '@element-plus/icons-vue'
import { useRole } from '../composables/useRole.js'
import ReviewTool from '../components/ReviewTool.vue'

const router = useRouter()
const route = useRoute()
const { role, roleName, userName, clearRole } = useRole()

const reviewActive = ref(false)
const showReviewFab = computed(() => {
  // 在后台管理页面内显示评审入口，登录/注册/门户页不显示
  return route.path.startsWith('/admin')
})

const pageTitle = computed(() => {
  return route.meta?.title || route.name
})

const menuItems = computed(() => {
  const common = [{ index: '/admin/dashboard', title: '控制面板', icon: Odometer }]

  // 招标人：突出需求、审批、定标、合同
  const tendereeMenus = [
    {
      index: '/admin/projects',
      title: '项目管理',
      icon: Folder,
      children: [
        { index: '/admin/projects', title: '项目列表' },
        { index: '/admin/projects/create', title: '创建项目' },
        { index: '/admin/projects/track', title: '项目跟踪' }
      ]
    },
    { index: '/admin/tender-doc', title: '招标文件', icon: Document },
    { index: '/admin/notice-publish', title: '发布公告', icon: Bell },
    { index: '/admin/opening-hall', title: '开标大厅', icon: VideoPlay },
    { index: '/admin/fee-manage', title: '费用管理', icon: Wallet },
    { index: '/admin/objection-manage', title: '异议管理', icon: Warning },
    { index: '/admin/award-confirm', title: '确认中标人', icon: Trophy },
    { index: '/admin/award-notice', title: '中标通知书', icon: Tickets },
    { index: '/admin/contract-archive', title: '合同归档', icon: DocumentChecked },
    { index: '/admin/message-center', title: '消息中心', icon: Message }
  ]

  // 招标代理：突出委托项目、文件编制、公告、开评标准备和通知书
  const agentMenus = [
    {
      index: '/admin/projects',
      title: '委托项目',
      icon: Folder,
      children: [
        { index: '/admin/projects', title: '项目列表' },
        { index: '/admin/projects/create', title: '创建项目' },
        { index: '/admin/projects/track', title: '项目跟踪' }
      ]
    },
    { index: '/admin/tender-doc', title: '招标文件编制', icon: Document },
    { index: '/admin/notice-publish', title: '公告发布', icon: Bell },
    { index: '/admin/opening-hall', title: '开标大厅', icon: VideoPlay },
    { index: '/admin/evaluation-hall', title: '评标大厅', icon: Star },
    { index: '/admin/fee-manage', title: '费用管理', icon: Wallet },
    { index: '/admin/objection-manage', title: '异议处理', icon: Warning },
    { index: '/admin/award-notice', title: '中标通知书', icon: Tickets },
    { index: '/admin/message-center', title: '消息中心', icon: Message }
  ]

  const bidderMenus = [
    { index: '/admin/bidder-projects', title: '项目中心', icon: Folder },
    { index: '/admin/bid-register', title: '项目报名', icon: DocumentChecked },
    { index: '/admin/bid-payment', title: '缴纳费用', icon: Money },
    { index: '/admin/bid-download', title: '下载文件', icon: Document },
    { index: '/admin/bid-quote', title: '在线报价', icon: Wallet },
    { index: '/admin/bid-upload', title: '上传投标文件', icon: Upload },
    { index: '/admin/supplier-profile', title: '企业档案', icon: OfficeBuilding },
    { index: '/admin/bidder-invoices', title: '发票申请', icon: Tickets },
    { index: '/admin/message-center', title: '消息中心', icon: Message }
  ]

  const expertMenus = [
    { index: '/admin/expert-project', title: '评标任务', icon: Star },
    { index: '/admin/bid-download', title: '查阅资料', icon: Document },
    { index: '/admin/expert-profile', title: '专家信息', icon: User },
    { index: '/admin/message-center', title: '消息中心', icon: Message }
  ]

  const supervisorMenus = [
    { index: '/admin/supervisor-hall', title: '监督大厅', icon: VideoPlay },
    { index: '/admin/supervisor-abnormal', title: '异常登记', icon: Warning },
    { index: '/admin/supervisor-logs', title: '操作日志', icon: List },
    { index: '/admin/message-center', title: '消息中心', icon: Message }
  ]

  const adminMenus = [
    { index: '/admin/admin-dashboard', title: '管理控制台', icon: Odometer },
    { index: '/admin/admin-users', title: '用户权限', icon: User },
    { index: '/admin/admin-dictionary', title: '参数字典', icon: SetUp },
    { index: '/admin/admin-supplier-audit', title: '准入审核', icon: DocumentChecked },
    { index: '/admin/organization', title: '组织机构', icon: OfficeBuilding },
    { index: '/admin/admin-logs', title: '日志审计', icon: List },
    { index: '/admin/message-center', title: '消息中心', icon: Message }
  ]

  const roleMenus = {
    tenderee: [...common, ...tendereeMenus],
    agent: [...common, ...agentMenus],
    bidder: [...common, ...bidderMenus],
    expert: [...common, ...expertMenus],
    supervisor: [...common, ...supervisorMenus],
    admin: [...adminMenus]
  }

  return roleMenus[role.value] || common
})

const logout = () => {
  clearRole()
  router.push('/login')
}
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
}

.sidebar {
  background-color: #001529;
  color: #fff;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.logo .el-icon {
  margin-right: 10px;
  font-size: 24px;
}

.header {
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.main-content {
  padding: 20px;
  background-color: #f5f7fa;
}

.review-fab {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
</style>
