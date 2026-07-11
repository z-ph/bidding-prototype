<template>
  <div class="admin-dashboard">
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
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header"><span>待审核事项</span></div>
          </template>
          <el-timeline>
            <el-timeline-item v-for="todo in todos" :key="todo.id" :type="todo.type" :timestamp="todo.time">
              <div class="todo-item">
                <span>{{ todo.content }}</span>
                <el-button type="primary" size="small" @click="handleTodo(todo)">去处理</el-button>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header"><span>快捷管理入口</span></div>
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
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { User, DocumentChecked, Collection, Warning, UserFilled, SetUp, List, Tickets } from '@element-plus/icons-vue'

const router = useRouter()

const stats = ref([
  { title: '注册供应商', value: 389, icon: User, bg: '#409EFF' },
  { title: '待审核供应商', value: 12, icon: DocumentChecked, bg: '#67C23A' },
  { title: '平台项目', value: 1256, icon: Collection, bg: '#E6A23C' },
  { title: '异常预警', value: 3, icon: Warning, bg: '#F56C6C' },
])

const todos = ref([
  { id: 1, content: '12 家新注册供应商等待准入审核', type: 'warning', time: '2026-07-08', path: '/admin/admin-supplier-audit' },
  { id: 2, content: '5 位专家注册等待资质审核', type: 'primary', time: '2026-07-08', path: '/admin/admin-supplier-audit' },
  { id: 3, content: '系统检测到 3 条疑似串标预警', type: 'danger', time: '2026-07-07', path: '/admin/admin-logs' },
])

const quickEntries = [
  { title: '用户权限', icon: UserFilled, color: '#409EFF', path: '/admin/admin-users' },
  { title: '参数字典', icon: SetUp, color: '#67C23A', path: '/admin/admin-dictionary' },
  { title: '供应商审核', icon: DocumentChecked, color: '#E6A23C', path: '/admin/admin-supplier-audit' },
  { title: '日志审计', icon: List, color: '#909399', path: '/admin/admin-logs' },
]

const handleTodo = (todo) => {
  router.push(todo.path)
}
</script>

<style scoped>
.admin-dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
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
</style>
