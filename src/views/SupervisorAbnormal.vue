<template>
  <div class="supervisor-abnormal">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>监督异常登记与处理</span>
          <el-button type="primary" @click="openDialog">登记异常</el-button>
        </div>
      </template>
      <el-table :data="records" style="width: 100%" border>
        <el-table-column prop="id" label="编号" width="120" />
        <el-table-column prop="project" label="涉及项目" min-width="220" />
        <el-table-column prop="type" label="异常类型" width="140" />
        <el-table-column prop="desc" label="异常描述" min-width="260" />
        <el-table-column prop="status" label="处理状态" width="120">
          <template #default="{ row }">
            <StatusTag :label="row.status" :status="row.status === '已处理' ? 'completed' : 'pending'" />
          </template>
        </el-table-column>
        <el-table-column prop="time" label="登记时间" width="160" />
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="登记异常" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="涉及项目">
          <el-input v-model="form.project" />
        </el-form-item>
        <el-form-item label="异常类型">
          <el-select v-model="form.type" style="width: 100%">
            <el-option label="开标异常" value="开标异常" />
            <el-option label="评标异常" value="评标异常" />
            <el-option label="专家违规" value="专家违规" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="异常描述">
          <el-input v-model="form.desc" type="textarea" :rows="4" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitRecord">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import StatusTag from '../components/StatusTag.vue'

const records = ref([
  { id: 'YC20260708001', project: 'XX市轨道交通设备采购项目', type: '开标异常', desc: '投标人 A 公司 CA 证书检测失败，已要求重新插拔。', status: '已处理', time: '2026-07-08 15:10' }
])

const dialogVisible = ref(false)
const form = reactive({
  project: '',
  type: '开标异常',
  desc: ''
})

const openDialog = () => {
  dialogVisible.value = true
}

const submitRecord = () => {
  if (!form.project || !form.desc) {
    ElMessage.warning('请填写完整异常信息')
    return
  }
  records.value.unshift({
    id: 'YC' + Date.now(),
    project: form.project,
    type: form.type,
    desc: form.desc,
    status: '待处理',
    time: new Date().toLocaleString()
  })
  dialogVisible.value = false
  form.project = ''
  form.desc = ''
  ElMessage.success('异常记录已登记')
}
</script>

<style scoped>
.supervisor-abnormal {
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
