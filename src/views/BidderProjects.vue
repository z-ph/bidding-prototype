<template>
  <div class="bidder-projects">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>项目中心</span>
          <el-button type="primary" plain :icon="QuestionFilled" @click="startTour">投标引导</el-button>
        </div>
      </template>
      <el-tabs id="bidder-tabs" v-model="activeTab" type="border-card">
        <el-tab-pane label="可参与项目" name="available">
          <el-table :data="availableProjects" style="width: 100%" border>
            <el-table-column prop="name" label="项目名称" min-width="240" />
            <el-table-column prop="code" label="项目编号" width="150" />
            <el-table-column prop="type" label="采购方式" width="120" />
            <el-table-column prop="deadline" label="报名截止" width="150" />
            <el-table-column prop="status" label="报名状态" width="120">
              <template #default="{ row }">
                <StatusTag :label="row.status" :status="row.status === '可报名' ? 'pending' : 'info'" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="220" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="viewDetail(row)">详情</el-button>
                <el-button v-if="row.status === '可报名'" type="primary" size="small" @click="register(row)">报名</el-button>
                <el-button v-else disabled size="small">{{ row.blockReason }}</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="我参与的项目" name="joined">
          <el-row :gutter="20">
            <el-col v-for="project in joinedProjects" :key="project.id" :span="12" style="margin-bottom: 20px">
              <el-card shadow="hover" class="project-progress-card">
                <template #header>
                  <div class="progress-header">
                    <span>{{ project.name }}</span>
                    <StatusTag :label="project.status" :status="project.status" />
                  </div>
                </template>
                <div class="progress-body">
                  <p class="project-code">项目编号：{{ project.code }}</p>
                  <p class="deadline">截止时间：{{ project.deadline }} · 剩余 {{ project.leftDays }} 天</p>
                  <el-steps :active="project.stepIndex" finish-status="success" simple>
                    <el-step title="报名" />
                    <el-step title="缴费" />
                    <el-step title="下载" />
                    <el-step title="报价" />
                    <el-step title="上传" />
                    <el-step title="开标" />
                  </el-steps>
                  <el-alert
                    v-if="project.blockReason"
                    :title="project.blockReason"
                    type="warning"
                    show-icon
                    :closable="false"
                    style="margin-top: 12px"
                  />
                </div>
                <div class="progress-footer">
                  <el-button type="primary" @click="goNextAction(project)">
                    {{ project.nextAction }}
                  </el-button>
                  <el-button link type="primary" @click="viewDetail(project)">查看详情</el-button>
                </div>
              </el-card>
            </el-col>
          </el-row>
          <EmptyState v-if="joinedProjects.length === 0" description="您还没有参与任何项目" icon="Folder" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { QuestionFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import StatusTag from '../components/StatusTag.vue'
import EmptyState from '../components/EmptyState.vue'

const router = useRouter()
const activeTab = ref('available')

const availableProjects = ref([
  { id: 1, name: 'XX市轨道交通设备采购项目', code: 'ZB20260701001', type: '公开招标', deadline: '2026-07-20 17:00', status: '可报名', blockReason: '' },
  { id: 2, name: '实验室设备采购项目', code: 'ZB20260705005', type: '公开招标', deadline: '2026-07-25 17:00', status: '未准入', blockReason: '资质待审核' },
  { id: 3, name: '办公桌椅采购项目', code: 'ZB20260702002', type: '公开询比价', deadline: '已截止', status: '已截止', blockReason: '报名已截止' }
])

const joinedProjects = ref([
  {
    id: 1,
    name: 'XX市轨道交通设备采购项目',
    code: 'ZB20260701001',
    status: '待缴费',
    deadline: '2026-07-20 17:00',
    leftDays: 8,
    stepIndex: 1,
    nextAction: '去缴纳招标文件费',
    nextPath: '/admin/bid-payment',
    blockReason: ''
  },
  {
    id: 3,
    name: '软件开发服务项目',
    code: 'ZB20260703003',
    status: '待上传',
    deadline: '2026-07-15 09:00',
    leftDays: 3,
    stepIndex: 4,
    nextAction: '上传投标文件',
    nextPath: '/admin/bid-upload',
    blockReason: '请确保所有文件已加密后再上传'
  }
])

const viewDetail = (row) => {
  ElMessage.success(`查看项目详情：${row.name}`)
}

const register = (row) => {
  router.push(`/admin/bid-register?projectId=${row.id}`)
}

const goNextAction = (project) => {
  router.push(`${project.nextPath}?projectId=${project.id}`)
}

const startTour = () => {
  const driverObj = driver({
    showProgress: true,
    allowClose: true,
    overlayColor: 'rgba(0, 21, 41, 0.75)',
    steps: [
      {
        element: '#bidder-tabs',
        popover: {
          title: '项目中心',
          description: '左侧是您可以参与的项目，右侧是您已报名项目的进度跟踪。',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '.el-table__row:first-child .el-button--small',
        popover: {
          title: '报名参加',
          description: '找到合适项目后，点击“报名”填写信息并上传资质。不可报名时按钮会说明具体原因。',
          side: 'left',
          align: 'center'
        }
      },
      {
        element: '#tab-joined',
        popover: {
          title: '跟踪进度',
          description: '在“我参与的项目”中以卡片形式查看每个项目的完整进度、剩余时间和下一步操作。',
          side: 'top',
          align: 'center'
        }
      }
    ]
  })
  driverObj.drive()
}
</script>

<style scoped>
.bidder-projects {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.project-progress-card {
  height: 100%;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.progress-body {
  margin-bottom: 16px;
}

.project-code,
.deadline {
  color: #666;
  font-size: 13px;
  margin: 4px 0;
}

.progress-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
