<template>
  <div class="portal">
    <!-- 顶部导航 -->
    <el-header class="portal-header">
      <div class="logo">
        <el-icon><Collection /></el-icon>
        <span>招投标采购平台</span>
      </div>
      <div class="nav">
        <el-button link>首页</el-button>
        <el-button link>交易信息</el-button>
        <el-button link>新闻公告</el-button>
        <el-button link>帮助中心</el-button>
        <el-button link>下载中心</el-button>
      </div>
      <div class="actions">
        <el-button link :icon="QuestionFilled" @click="startTour">新手指引</el-button>
        <el-button link @click="$router.push('/register')">注册</el-button>
        <el-button id="portal-login-btn" type="primary" @click="$router.push('/login')">登录</el-button>
      </div>
    </el-header>

    <!-- Banner -->
    <div class="banner">
      <h1>全流程电子化招投标采购平台</h1>
      <p>公开、公平、公正、高效、安全</p>
      <div class="stats">
        <div class="stat-item">
          <div class="stat-num">1,256</div>
          <div class="stat-label">累计项目</div>
        </div>
        <div class="stat-item">
          <div class="stat-num">3,890</div>
          <div class="stat-label">注册供应商</div>
        </div>
        <div class="stat-item">
          <div class="stat-num">528</div>
          <div class="stat-label">本月开标</div>
        </div>
      </div>
    </div>

    <!-- 交易信息 -->
    <div id="portal-notice-section" class="section">
      <div class="section-title">
        <h2>交易信息</h2>
        <el-radio-group v-model="noticeType" size="small">
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button label="tender">招标公告</el-radio-button>
          <el-radio-button label="change">变更公告</el-radio-button>
          <el-radio-button label="candidate">候选人公示</el-radio-button>
          <el-radio-button label="result">中标公告</el-radio-button>
        </el-radio-group>
      </div>
      <el-table id="portal-notice-table" :data="filteredNotices" style="width: 100%" @row-click="handleRowClick">
        <el-table-column prop="title" label="公告标题" min-width="300">
          <template #default="{ row }">
            <el-link type="primary">{{ row.title }}</el-link>
            <el-tag size="small" :type="row.tagType" style="margin-left: 8px">{{ row.typeName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="purchaseMode" label="采购方式" width="120" />
        <el-table-column prop="publishTime" label="发布时间" width="150" />
        <el-table-column prop="deadline" label="截止时间" width="150" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button v-if="row.canRegister" type="primary" size="small" @click.stop="register(row)">报名</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination background layout="prev, pager, next" :total="50" />
      </div>
    </div>

    <!-- 快速入口 -->
    <div id="portal-quick-links" class="section quick-links">
      <el-card v-for="link in quickLinks" :key="link.title" class="quick-card" shadow="hover" @click="$router.push(link.path)">
        <el-icon :size="40" :color="link.color"><component :is="link.icon" /></el-icon>
        <h3>{{ link.title }}</h3>
        <p>{{ link.desc }}</p>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { Collection, Document, Download, Help, User, OfficeBuilding, QuestionFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const noticeType = ref('all')

const startTour = () => {
  const driverObj = driver({
    showProgress: true,
    allowClose: true,
    overlayColor: 'rgba(0, 21, 41, 0.75)',
    steps: [
      {
        element: '.logo',
        popover: {
          title: '欢迎来到招投标采购平台',
          description: '这里是平台门户，您可以浏览公告、注册账号或登录系统。',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '#portal-notice-section',
        popover: {
          title: '交易信息',
          description: '这里展示所有招标公告、变更公告、候选人公示和中标公告，您可以按类型筛选。',
          side: 'top',
          align: 'start'
        }
      },
      {
        element: '#portal-notice-table .el-button',
        popover: {
          title: '报名参加项目',
          description: '看到合适的项目后，点击“报名”按钮即可进入投标流程。',
          side: 'left',
          align: 'center'
        }
      },
      {
        element: '#portal-quick-links',
        popover: {
          title: '快速入口',
          description: '供应商注册、下载中心、帮助中心、招标人入口，一键直达。',
          side: 'top',
          align: 'start'
        }
      },
      {
        element: '#portal-login-btn',
        popover: {
          title: '开始体验',
          description: '点击登录，选择您的角色，进入对应的工作台。',
          side: 'bottom',
          align: 'center'
        }
      }
    ]
  })
  driverObj.drive()
}

const notices = ref([
  { id: 1, title: 'XX市轨道交通设备采购项目招标公告', typeName: '招标公告', tagType: 'primary', purchaseMode: '公开招标', publishTime: '2026-07-01', deadline: '2026-07-20', canRegister: true },
  { id: 2, title: '办公桌椅采购项目变更公告', typeName: '变更公告', tagType: 'warning', purchaseMode: '公开招标', publishTime: '2026-07-02', deadline: '2026-07-18', canRegister: false },
  { id: 3, title: '软件开发服务项目中标候选人公示', typeName: '候选人公示', tagType: 'success', purchaseMode: '邀请招标', publishTime: '2026-07-03', deadline: '-', canRegister: false },
  { id: 4, title: '物业服务采购项目中标公告', typeName: '中标公告', tagType: 'info', purchaseMode: '公开询比价', publishTime: '2026-07-04', deadline: '-', canRegister: false },
  { id: 5, title: '实验室设备采购项目招标公告', typeName: '招标公告', tagType: 'primary', purchaseMode: '公开招标', publishTime: '2026-07-05', deadline: '2026-07-25', canRegister: true },
])

const typeMap = {
  all: null,
  tender: '招标公告',
  change: '变更公告',
  candidate: '候选人公示',
  result: '中标公告'
}

const filteredNotices = computed(() => {
  if (noticeType.value === 'all') return notices.value
  return notices.value.filter(n => n.typeName === typeMap[noticeType.value])
})

const quickLinks = [
  { title: '供应商注册', desc: '成为平台认证供应商', icon: User, color: '#409EFF', path: '/login' },
  { title: '下载中心', desc: 'CA驱动、投标工具', icon: Download, color: '#67C23A', path: '/login' },
  { title: '帮助中心', desc: '操作教程与常见问题', icon: Help, color: '#E6A23C', path: '/login' },
  { title: '招标人入口', desc: '发布需求、管理项目', icon: OfficeBuilding, color: '#F56C6C', path: '/login' },
]

const handleRowClick = (row) => {
  ElMessage.success(`查看公告详情：${row.title}`)
}

const register = (row) => {
  ElMessage.success(`报名参加：${row.title}\n请先登录系统`)
}
</script>

<style scoped>
.portal {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.portal-header {
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  color: #001529;
}

.logo .el-icon {
  margin-right: 10px;
  font-size: 28px;
}

.nav {
  display: flex;
  gap: 10px;
}

.banner {
  background: linear-gradient(135deg, #001529 0%, #003366 100%);
  color: #fff;
  padding: 60px 20px;
  text-align: center;
}

.banner h1 {
  font-size: 36px;
  margin-bottom: 16px;
}

.banner p {
  font-size: 18px;
  opacity: 0.9;
  margin-bottom: 40px;
}

.stats {
  display: flex;
  justify-content: center;
  gap: 80px;
}

.stat-item {
  text-align: center;
}

.stat-num {
  font-size: 36px;
  font-weight: bold;
  color: #409EFF;
}

.stat-label {
  font-size: 14px;
  opacity: 0.8;
}

.section {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.quick-links {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.quick-card {
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s;
}

.quick-card:hover {
  transform: translateY(-5px);
}

.quick-card h3 {
  margin: 12px 0 8px;
  color: #001529;
}

.quick-card p {
  color: #666;
  font-size: 14px;
}
</style>
