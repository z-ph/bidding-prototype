<template>
  <div class="dashboard">
    <div class="role-banner">
      <div>
        <h2>{{ roleTitle }}</h2>
        <p>{{ roleSubtitle }}</p>
      </div>
      <el-button type="primary" plain :icon="QuestionFilled" @click="startTour">工作台引导</el-button>
    </div>

    <!-- 招标人/代理工作台 -->
    <template v-if="role === 'tenderee' || role === 'agent'">
      <el-row :gutter="20" class="stat-row">
        <el-col :span="6" v-for="stat in stats" :key="stat.title">
          <el-card shadow="hover" :body-style="{ padding: '20px' }">
            <div class="stat-card">
              <div class="stat-icon" :style="{ background: stat.bg }">
                <el-icon :size="28" color="#fff"><component :is="stat.icon" /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-title">{{ stat.title }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="module-row">
        <el-col :span="16">
          <el-card title="待办事项" class="todo-card">
            <template #header>
              <div id="dashboard-todos" class="card-header">
                <span>待办事项</span>
                <el-tag type="danger">{{ todos.length }} 项待处理</el-tag>
              </div>
            </template>
            <el-timeline>
              <el-timeline-item v-for="todo in todos" :key="todo.id" :type="todo.type" :timestamp="todo.time">
                <div class="todo-item">
                  <span>{{ todo.content }}</span>
                  <el-button type="primary" size="small" @click="handleTodo(todo)">处理</el-button>
                </div>
              </el-timeline-item>
            </el-timeline>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="quick-card">
            <template #header>
              <div id="dashboard-quick" class="card-header"><span>快捷入口</span></div>
            </template>
            <div class="quick-grid">
              <div v-for="item in quickEntries" :key="item.title" class="quick-entry" @click="$router.push(item.path)">
                <el-icon :size="24" :color="item.color"><component :is="item.icon" /></el-icon>
                <span>{{ item.title }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <el-card class="project-card">
        <template #header>
          <div class="card-header">
            <span>最近项目</span>
            <el-button text @click="$router.push('/admin/projects')">查看全部</el-button>
          </div>
        </template>
        <el-table :data="recentProjects" style="width: 100%">
          <el-table-column prop="name" label="项目名称" min-width="250" />
          <el-table-column prop="code" label="项目编号" width="160" />
          <el-table-column prop="type" label="采购方式" width="120" />
          <el-table-column prop="stage" label="当前阶段" width="140">
            <template #default="{ row }">
              <StatusTag :label="row.stage" :status="row.stage" />
            </template>
          </el-table-column>
          <el-table-column prop="deadline" label="截止时间" width="150" />
          <el-table-column label="操作" width="180">
            <template #default="{ row }">
              <el-button link type="primary" @click="viewProject(row)">详情</el-button>
              <el-button link type="primary" @click="continueProject(row)">继续</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </template>

    <!-- 投标人工作台 -->
    <template v-if="role === 'bidder'">
      <el-row :gutter="20" class="stat-row">
        <el-col :span="6" v-for="stat in bidderStats" :key="stat.title">
          <el-card shadow="hover" :body-style="{ padding: '20px' }">
            <div class="stat-card">
              <div class="stat-icon" :style="{ background: stat.bg }">
                <el-icon :size="28" color="#fff"><component :is="stat.icon" /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-title">{{ stat.title }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <el-card>
        <template #header>
          <div class="card-header">
            <span>我的投标待办</span>
            <el-button text @click="$router.push('/admin/bidder-projects')">查看全部项目</el-button>
          </div>
        </template>
        <el-timeline>
          <el-timeline-item v-for="todo in bidderTodos" :key="todo.id" :type="todo.type" :timestamp="todo.time">
            <div class="todo-item">
              <span>{{ todo.content }}</span>
              <el-button type="primary" size="small" @click="$router.push(todo.path)">去处理</el-button>
            </div>
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </template>

    <!-- 评标专家工作台 -->
    <template v-if="role === 'expert'">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>我的评标任务</span>
            <el-button text @click="$router.push('/admin/expert-project')">进入评标大厅</el-button>
          </div>
        </template>
        <el-table :data="expertTasks" style="width: 100%">
          <el-table-column prop="project" label="项目名称" min-width="260" />
          <el-table-column prop="stage" label="当前阶段" width="140" />
          <el-table-column prop="deadline" label="截止时间" width="180" />
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="$router.push('/admin/expert-project')">开始评标</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </template>

    <!-- 监督人员工作台 -->
    <template v-if="role === 'supervisor'">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>监督概览</span>
            <el-button text @click="$router.push('/admin/supervisor-hall')">进入监督大厅</el-button>
          </div>
        </template>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="今日开标">3 场</el-descriptions-item>
          <el-descriptions-item label="今日评标">2 场</el-descriptions-item>
          <el-descriptions-item label="异常预警">0 条</el-descriptions-item>
        </el-descriptions>
      </el-card>
    </template>

    <!-- 管理员入口 -->
    <template v-if="role === 'admin'">
      <el-result icon="info" title="管理员工作台" sub-title="管理员请使用左侧“管理控制台”菜单进入后台功能">
        <template #extra>
          <el-button type="primary" @click="$router.push('/admin/admin-dashboard')">进入管理控制台</el-button>
        </template>
      </el-result>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { ElMessage } from 'element-plus'
import {
  Folder, Document, VideoPlay, Star,
  Plus, Upload, Bell, Timer,
  Wallet, Collection, Search, DocumentChecked,
  QuestionFilled
} from '@element-plus/icons-vue'
import { useRole } from '../composables/useRole.js'
import StatusTag from '../components/StatusTag.vue'

const router = useRouter()
const { role } = useRole()

const roleMap = {
  tenderee: '招标人工作台',
  agent: '招标代理工作台',
  bidder: '投标人工作台',
  expert: '评标专家工作台',
  supervisor: '监督工作台',
  admin: '平台管理控制台'
}
const roleTitle = computed(() => roleMap[role.value] || '工作台')
const roleSubtitle = computed(() => {
  const map = {
    tenderee: '发起采购需求、管理项目、确认评标和定标结果',
    agent: '受委托执行招标流程，编制文件、发公告、组织开评标',
    bidder: '报名、缴费、下载文件、上传投标文件、报价',
    expert: '参与评标、独立评分、签署评标报告',
    supervisor: '查看并监督开标、评标、定标全过程',
    admin: '维护系统基础数据、用户权限、日志审计'
  }
  return map[role.value] || ''
})

const stats = ref([
  { title: '进行中项目', value: 12, icon: Folder, bg: '#409EFF' },
  { title: '待开标项目', value: 3, icon: VideoPlay, bg: '#67C23A' },
  { title: '待评标项目', value: 2, icon: Star, bg: '#E6A23C' },
  { title: '今日截止', value: 1, icon: Timer, bg: '#F56C6C' },
])

const bidderStats = ref([
  { title: '可参与项目', value: 5, icon: Search, bg: '#409EFF' },
  { title: '已报名项目', value: 3, icon: DocumentChecked, bg: '#67C23A' },
  { title: '待缴费', value: 1, icon: Wallet, bg: '#E6A23C' },
  { title: '待上传标书', value: 2, icon: Upload, bg: '#F56C6C' },
])

const tendereeTodos = [
  { id: 1, content: 'XX市轨道交通设备采购项目即将开标，请确认开标安排', type: 'warning', time: '2026-07-08 10:00', path: '/admin/opening-hall' },
  { id: 2, content: '办公桌椅采购项目有 2 家供应商报名，请审核资质', type: 'primary', time: '2026-07-08 09:30', path: '/admin/projects' },
  { id: 3, content: '软件开发服务项目评标报告待审批', type: 'danger', time: '2026-07-07 16:00', path: '/admin/award-confirm' },
  { id: 4, content: '物业服务采购项目中标公告待发布', type: 'success', time: '2026-07-07 11:20', path: '/admin/notice-publish' }
]

const agentTodos = [
  { id: 1, content: 'XX市轨道交通设备采购项目即将开标，请完成开标前准备', type: 'warning', time: '2026-07-08 10:00', path: '/admin/opening-hall' },
  { id: 2, content: '办公桌椅采购项目招标文件需复核后发布', type: 'primary', time: '2026-07-08 09:30', path: '/admin/tender-doc' },
  { id: 3, content: '软件开发服务项目评标报告待汇总提交', type: 'danger', time: '2026-07-07 16:00', path: '/admin/evaluation-hall' },
  { id: 4, content: '物业服务采购项目中标通知书待发送', type: 'success', time: '2026-07-07 11:20', path: '/admin/award-notice' }
]

const todos = computed(() => role.value === 'agent' ? agentTodos : tendereeTodos)

const bidderTodos = ref([
  { id: 1, content: 'XX市轨道交通设备采购项目已报名通过，请缴纳招标文件费', type: 'warning', time: '2026-07-08', path: '/admin/bid-payment' },
  { id: 2, content: '软件开发服务项目待上传投标文件并报价', type: 'danger', time: '2026-07-07', path: '/admin/bid-upload' }
])

const expertTasks = ref([
  { project: 'XX市轨道交通设备采购项目', stage: '评标中', deadline: '2026-07-10 17:00' }
])

const tendereeQuickEntries = [
  { title: '创建项目', icon: Plus, color: '#409EFF', path: '/admin/projects/create' },
  { title: '审批文件', icon: Document, color: '#909399', path: '/admin/tender-doc' },
  { title: '确认中标', icon: Bell, color: '#E6A23C', path: '/admin/award-confirm' },
  { title: '合同归档', icon: DocumentChecked, color: '#67C23A', path: '/admin/contract-archive' }
]

const agentQuickEntries = [
  { title: '创建项目', icon: Plus, color: '#409EFF', path: '/admin/projects/create' },
  { title: '发布公告', icon: Bell, color: '#E6A23C', path: '/admin/notice-publish' },
  { title: '开标大厅', icon: VideoPlay, color: '#67C23A', path: '/admin/opening-hall' },
  { title: '评标大厅', icon: Star, color: '#F56C6C', path: '/admin/evaluation-hall' }
]

const quickEntries = computed(() => role.value === 'agent' ? agentQuickEntries : tendereeQuickEntries)

const recentProjects = ref([
  { id: 1, name: 'XX市轨道交通设备采购项目', code: 'ZB20260701001', type: '公开招标', stage: '报名中', deadline: '2026-07-20 17:00' },
  { id: 2, name: '办公桌椅采购项目', code: 'ZB20260702002', type: '公开询比价', stage: '待开标', deadline: '2026-07-18 14:00' },
  { id: 3, name: '软件开发服务项目', code: 'ZB20260703003', type: '邀请招标', stage: '评标中', deadline: '2026-07-15 09:00' },
  { id: 4, name: '实验室设备采购项目', code: 'ZB20260705005', type: '公开招标', stage: '招标中', deadline: '2026-07-25 17:00' }
])

const handleTodo = (todo) => router.push(todo.path)
const viewProject = (row) => ElMessage.success(`查看项目详情：${row.name}`)
const continueProject = (row) => {
  const map = {
    '招标中': '/admin/tender-doc',
    '报名中': '/admin/projects',
    '待开标': '/admin/opening-hall',
    '评标中': '/admin/evaluation-hall',
  }
  router.push(map[row.stage] || '/admin/projects')
}

const startTour = () => {
  const commonSteps = [
    {
      element: '.role-banner',
      popover: {
        title: roleTitle.value,
        description: roleSubtitle.value,
        side: 'bottom',
        align: 'center'
      }
    }
  ]

  const roleSteps = {
    tenderee: [
      {
        element: '.stat-row',
        popover: {
          title: '数据概览',
          description: '快速了解进行中项目、待开标、待评标和今日截止等核心数据。',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#dashboard-todos',
        popover: {
          title: '待办事项',
          description: '这里列出需要您处理的最新待办，点击“处理”可直达对应页面。',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: '#dashboard-quick',
        popover: {
          title: '快捷入口',
          description: '创建项目、发布公告、上传文件、编辑招标文件，一键进入常用功能。',
          side: 'left',
          align: 'start'
        }
      }
    ],
    agent: [
      {
        element: '.stat-row',
        popover: {
          title: '数据概览',
          description: '快速了解进行中项目、待开标、待评标和今日截止等核心数据。',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#dashboard-todos',
        popover: {
          title: '待办事项',
          description: '报名审核、评标报告、公告发布等需要您处理的待办。',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: '#dashboard-quick',
        popover: {
          title: '快捷入口',
          description: '创建项目、发布公告、上传文件、编辑招标文件，一键进入常用功能。',
          side: 'left',
          align: 'start'
        }
      }
    ],
    bidder: [
      {
        element: '.stat-row',
        popover: {
          title: '我的投标看板',
          description: '可参与项目、已报名项目、待缴费、待上传标书一目了然。',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.todo-card',
        popover: {
          title: '投标待办',
          description: '系统会按项目进度提醒您接下来该做什么，点击“去处理”即可继续。',
          side: 'right',
          align: 'start'
        }
      }
    ],
    expert: [
      {
        element: '.el-card',
        popover: {
          title: '评标任务',
          description: '这里显示分配给您评标的项目，点击“开始评标”进入评标大厅。',
          side: 'bottom',
          align: 'start'
        }
      }
    ],
    supervisor: [
      {
        element: '.el-card',
        popover: {
          title: '监督概览',
          description: '查看今日开标、评标场次和异常预警，进入监督大厅可查看详细过程。',
          side: 'bottom',
          align: 'start'
        }
      }
    ],
    admin: [
      {
        element: '.stat-row',
        popover: {
          title: '平台运营数据',
          description: '注册供应商、待审核供应商、平台项目、异常预警等核心指标。',
          side: 'bottom',
          align: 'start'
        }
      }
    ]
  }

  const driverObj = driver({
    showProgress: true,
    allowClose: true,
    overlayColor: 'rgba(0, 21, 41, 0.75)',
    steps: [...commonSteps, ...(roleSteps[role.value] || [])]
  })
  driverObj.drive()
}
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.role-banner {
  background: linear-gradient(90deg, #001529 0%, #003366 100%);
  color: #fff;
  padding: 24px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.role-banner h2 {
  margin: 0 0 8px;
}

.role-banner p {
  margin: 0;
  opacity: 0.85;
}

.stat-row {
  margin-bottom: 0 !important;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #001529;
}

.stat-title {
  color: #666;
  font-size: 14px;
}

.module-row {
  margin-top: 0 !important;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.todo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.quick-entry {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
  background: #f5f7fa;
}

.quick-entry:hover {
  background: #e6f2ff;
}

.quick-entry span {
  font-size: 14px;
  color: #333;
}

.project-card {
  margin-top: 0;
}
</style>
