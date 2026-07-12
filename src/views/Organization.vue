<template>
  <div class="organization">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>组织机构</span>
          <el-button type="primary" @click="addDepartment">新增部门</el-button>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-tree
            :data="treeData"
            :props="{ label: 'name', children: 'children' }"
            default-expand-all
            highlight-current
            @node-click="selectDept"
          />
        </el-col>
        <el-col :span="16">
          <el-descriptions v-if="selectedDept" :column="2" border title="部门信息">
            <el-descriptions-item label="部门名称">{{ selectedDept.name }}</el-descriptions-item>
            <el-descriptions-item label="部门编码">{{ selectedDept.code }}</el-descriptions-item>
            <el-descriptions-item label="负责人">{{ selectedDept.leader }}</el-descriptions-item>
            <el-descriptions-item label="成员数">{{ selectedDept.members }} 人</el-descriptions-item>
          </el-descriptions>
          <EmptyState v-else description="请选择左侧部门查看详情" icon="OfficeBuilding" />
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import EmptyState from '../components/EmptyState.vue'

const treeData = ref([
  {
    name: 'XX集团',
    code: 'ROOT',
    leader: '张总',
    members: 120,
    children: [
      { name: '采购部', code: 'CG', leader: '张三', members: 8 },
      { name: '招标代理部', code: 'ZB', leader: '李四', members: 12 },
      { name: '法务部', code: 'FW', leader: '王五', members: 5 }
    ]
  }
])

const selectedDept = ref(null)

const selectDept = (data) => {
  selectedDept.value = data
}

const addDepartment = () => {
  ElMessage.success('打开新增部门弹窗（演示）')
}
</script>

<style scoped>
.organization {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}
</style>
