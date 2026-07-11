<template>
  <div class="objection-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>异议管理</span>
          <el-button type="primary" @click="dialogVisible = true">提出异议</el-button>
        </div>
      </template>
      <el-alert
        title="供应商可对招标文件、开标、评标、定标结果提出异议，招标方/代理应在规定时间内答复。答复可触发澄清或异常处理。"
        type="info"
        show-icon
        :closable="false"
        style="margin-bottom: 20px"
      />
      <el-table :data="objections" style="width: 100%">
        <el-table-column prop="project" label="关联项目" min-width="220" />
        <el-table-column prop="type" label="异议类型" width="140" />
        <el-table-column prop="bidder" label="提出人" width="180" />
        <el-table-column prop="content" label="异议内容" min-width="250" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === '待答复'" link type="primary" @click="reply(row)">答复</el-button>
            <el-button link type="primary" @click="view(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="提出异议" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="关联项目">
          <el-select v-model="form.project" style="width: 100%">
            <el-option label="XX市轨道交通设备采购项目" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="异议类型">
          <el-radio-group v-model="form.type">
            <el-radio label="招标文件">招标文件</el-radio>
            <el-radio label="开标">开标</el-radio>
            <el-radio label="评标">评标</el-radio>
            <el-radio label="中标结果">中标结果</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="异议内容">
          <el-input v-model="form.content" type="textarea" :rows="5" placeholder="请详细描述异议内容..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const dialogVisible = ref(false)
const objections = ref([
  { project: 'XX市轨道交通设备采购项目', type: '招标文件', bidder: 'B实业有限公司', content: '技术参数中某指标设置过高，建议澄清。', status: '已答复' },
  { project: '软件开发服务项目', type: '评标', bidder: 'A科技有限公司', content: '对评分结果有异议，申请复核。', status: '待答复' },
])

const form = reactive({ project: '', type: '招标文件', content: '' })

const statusType = (s) => {
  const map = { '待答复': 'warning', '已答复': 'success', '已驳回': 'danger' }
  return map[s] || ''
}

const reply = (row) => {
  row.status = '已答复'
  ElMessage.success('异议已答复')
}
const view = (row) => ElMessage.success(`查看异议：${row.content}`)
const submit = () => {
  ElMessage.success('异议已提交')
  dialogVisible.value = false
}
</script>

<style scoped>
.objection-manage {
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
