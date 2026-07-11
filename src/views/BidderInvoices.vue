<template>
  <div class="bidder-invoices">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>发票申请</span>
          <el-button type="primary" @click="dialogVisible = true">申请发票</el-button>
        </div>
      </template>
      <el-alert
        title="仅对已缴纳且审核通过的费用申请发票，开票后可在列表下载电子发票。"
        type="info"
        show-icon
        :closable="false"
        style="margin-bottom: 20px"
      />
      <el-table :data="invoices" style="width: 100%">
        <el-table-column prop="project" label="关联项目" min-width="260" />
        <el-table-column prop="feeType" label="费用类型" width="140" />
        <el-table-column prop="amount" label="开票金额" width="120" />
        <el-table-column prop="type" label="发票类型" width="120" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button v-if="row.status === '已开票'" link type="primary" @click="download(row)">下载</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="申请发票" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="关联费用">
          <el-select v-model="form.feeId" placeholder="请选择已缴纳费用" style="width: 100%">
            <el-option label="XX市轨道交通设备采购项目-招标文件费 500元" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="发票类型">
          <el-radio-group v-model="form.type">
            <el-radio label="增值税普通发票">增值税普通发票</el-radio>
            <el-radio label="增值税专用发票">增值税专用发票</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="开票抬头">
          <el-input v-model="form.title" placeholder="请输入发票抬头" />
        </el-form-item>
        <el-form-item label="纳税人识别号">
          <el-input v-model="form.taxNo" placeholder="请输入税号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">提交申请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const dialogVisible = ref(false)
const invoices = ref([
  { project: 'XX市轨道交通设备采购项目', feeType: '招标文件费', amount: 500, type: '增值税普通发票', status: '已开票' },
  { project: '办公桌椅采购项目', feeType: '招标文件费', amount: 300, type: '增值税普通发票', status: '审核中' },
])

const form = reactive({
  feeId: '',
  type: '增值税普通发票',
  title: '',
  taxNo: ''
})

const statusType = (s) => {
  const map = { '审核中': 'warning', '已开票': 'success', '已驳回': 'danger' }
  return map[s] || ''
}

const download = (row) => {
  ElMessage.success(`下载电子发票：${row.project}`)
}

const submit = () => {
  ElMessage.success('发票申请已提交')
  dialogVisible.value = false
}
</script>

<style scoped>
.bidder-invoices {
  max-width: 1100px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}
</style>
