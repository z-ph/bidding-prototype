<template>
  <div class="bidder-projects">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>项目中心</span>
        </div>
      </template>
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="可参与项目" name="available">
          <el-table :data="availableProjects" style="width: 100%">
            <el-table-column prop="name" label="项目名称" min-width="260" />
            <el-table-column prop="code" label="项目编号" width="150" />
            <el-table-column prop="type" label="采购方式" width="120" />
            <el-table-column prop="deadline" label="报名截止" width="150" />
            <el-table-column label="操作" width="220" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="viewDetail(row)">详情</el-button>
                <el-button type="primary" size="small" @click="register(row)">报名</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="我参与的项目" name="joined">
          <el-table :data="joinedProjects" style="width: 100%">
            <el-table-column prop="name" label="项目名称" min-width="260" />
            <el-table-column prop="code" label="项目编号" width="150" />
            <el-table-column prop="status" label="当前状态" width="120">
              <template #default="{ row }">
                <el-tag :type="statusType(row.status)">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="nextAction" label="下一步操作" min-width="180" />
            <el-table-column label="操作" width="260" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="goAction(row, 'payment')">缴费</el-button>
                <el-button link type="primary" @click="goAction(row, 'download')">下载文件</el-button>
                <el-button link type="primary" @click="goAction(row, 'quote')">报价</el-button>
                <el-button link type="primary" @click="goAction(row, 'upload')">上传标书</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTab = ref('available')

const availableProjects = ref([
  { id: 1, name: 'XX市轨道交通设备采购项目', code: 'ZB20260701001', type: '公开招标', deadline: '2026-07-20 17:00' },
  { id: 2, name: '实验室设备采购项目', code: 'ZB20260705005', type: '公开招标', deadline: '2026-07-25 17:00' },
])

const joinedProjects = ref([
  { id: 1, name: 'XX市轨道交通设备采购项目', code: 'ZB20260701001', status: '待缴费', nextAction: '缴纳招标文件费' },
  { id: 3, name: '软件开发服务项目', code: 'ZB20260703003', type: '邀请招标', status: '待上传', nextAction: '上传投标文件并报价' },
])

const statusType = (s) => {
  const map = { '待缴费': 'warning', '待下载': 'primary', '待报价': 'danger', '待上传': 'info', '已投标': 'success' }
  return map[s] || ''
}

const viewDetail = (row) => {
  alert(`查看项目详情：${row.name}`)
}

const register = (row) => {
  router.push(`/admin/bid-register?projectId=${row.id}`)
}

const goAction = (row, action) => {
  const map = {
    payment: '/admin/bid-payment',
    download: '/admin/bid-download',
    quote: '/admin/bid-quote',
    upload: '/admin/bid-upload'
  }
  router.push(`${map[action]}?projectId=${row.id}`)
}
</script>

<style scoped>
.bidder-projects {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  font-weight: bold;
}
</style>
