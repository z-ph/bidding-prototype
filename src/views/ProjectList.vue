<template>
  <div class="project-list">
    <el-card>
      <template #header>
        <div class="header-actions">
          <div class="filter-bar">
            <el-input
              v-model="search.name"
              placeholder="项目名称/编号"
              style="width: 220px"
              clearable
            />
            <el-select v-model="search.status" placeholder="项目状态" clearable style="width: 140px">
              <el-option label="全部" value="" />
              <el-option label="草稿" value="draft" />
              <el-option label="招标中" value="tendering" />
              <el-option label="报名中" value="registering" />
              <el-option label="待开标" value="pending_open" />
              <el-option label="评标中" value="evaluating" />
              <el-option label="已完成" value="done" />
            </el-select>
            <el-select v-model="search.type" placeholder="采购方式" clearable style="width: 140px">
              <el-option label="公开招标" value="open" />
              <el-option label="邀请招标" value="invitation" />
              <el-option label="公开询比价" value="inquiry" />
              <el-option label="单一来源" value="single" />
            </el-select>
            <el-button type="primary" @click="loadProjects">查询</el-button>
            <el-button @click="reset">重置</el-button>
          </div>
          <el-button type="primary" @click="$router.push('/admin/projects/create')">
            <el-icon><Plus /></el-icon> 创建项目
          </el-button>
        </div>
      </template>

      <el-table :data="projects" style="width: 100%" v-loading="loading">
        <el-table-column type="index" width="50" />
        <el-table-column prop="name" label="项目名称" min-width="240">
          <template #default="{ row }">
            <el-link type="primary" @click="viewDetail(row)">{{ row.name }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="code" label="项目编号" width="150" />
        <el-table-column prop="type" label="采购方式" width="110" />
        <el-table-column prop="budget" label="预算金额" width="130">
          <template #default="{ row }">
            {{ row.budget }} 万元
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publishTime" label="发布时间" width="120" />
        <el-table-column prop="deadline" label="截止时间" width="120" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="viewDetail(row)">详情</el-button>
            <el-button link type="primary" @click="edit(row)">编辑</el-button>
            <el-button link type="primary" @click="nextStep(row)">{{ nextLabel(row.status) }}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :total="total"
          :page-size="search.pageSize"
          v-model:current-page="search.page"
          @current-change="loadProjects"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const total = ref(50)

const search = reactive({
  name: '',
  status: '',
  type: '',
  page: 1,
  pageSize: 10
})

const projects = ref([
  { id: 1, name: 'XX市轨道交通设备采购项目', code: 'ZB20260701001', type: '公开招标', budget: 850, status: 'registering', publishTime: '2026-07-01', deadline: '2026-07-20' },
  { id: 2, name: '办公桌椅采购项目', code: 'ZB20260702002', type: '公开询比价', budget: 45, status: 'pending_open', publishTime: '2026-07-02', deadline: '2026-07-18' },
  { id: 3, name: '软件开发服务项目', code: 'ZB20260703003', type: '邀请招标', budget: 120, status: 'evaluating', publishTime: '2026-07-03', deadline: '2026-07-15' },
  { id: 4, name: '物业服务采购项目', code: 'ZB20260704004', type: '公开招标', budget: 60, status: 'done', publishTime: '2026-06-20', deadline: '2026-07-05' },
  { id: 5, name: '实验室设备采购项目', code: 'ZB20260705005', type: '公开招标', budget: 230, status: 'tendering', publishTime: '2026-07-05', deadline: '2026-07-25' },
])

const statusMap = {
  draft: { text: '草稿', type: 'info' },
  tendering: { text: '招标中', type: 'success' },
  registering: { text: '报名中', type: 'primary' },
  pending_open: { text: '待开标', type: 'warning' },
  evaluating: { text: '评标中', type: 'danger' },
  done: { text: '已完成', type: 'info' },
}

const statusText = (s) => statusMap[s]?.text || s
const statusType = (s) => statusMap[s]?.type || ''

const nextLabel = (status) => {
  const map = {
    draft: '发布招标',
    tendering: '查看报名',
    registering: '进入开标',
    pending_open: '开标大厅',
    evaluating: '评标大厅',
    done: '归档',
  }
  return map[status] || '详情'
}

const loadProjects = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 300)
}

const reset = () => {
  search.name = ''
  search.status = ''
  search.type = ''
  search.page = 1
  loadProjects()
}

const viewDetail = (row) => {
  ElMessage.success(`查看项目详情：${row.name}`)
}

const edit = (row) => {
  ElMessage.success(`编辑项目：${row.name}`)
}

const nextStep = (row) => {
  const map = {
    draft: '/admin/notice-publish',
    registering: '/admin/opening-hall',
    pending_open: '/admin/opening-hall',
    evaluating: '/admin/evaluation-hall',
  }
  router.push(map[row.status] || '/admin/projects')
}
</script>

<style scoped>
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-bar {
  display: flex;
  gap: 12px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
