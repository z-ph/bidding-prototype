<template>
  <div class="fee-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>费用管理</span>
        </div>
      </template>
      <el-alert
        title="管理招标文件费、保证金、平台使用费的缴纳、审核、退还记录。线上支付自动到账，线下转账需人工审核。"
        type="info"
        show-icon
        :closable="false"
        style="margin-bottom: 20px"
      />
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="待审核" name="pending">
          <el-table :data="pendingFees" style="width: 100%">
            <el-table-column prop="project" label="关联项目" min-width="240" />
            <el-table-column prop="bidder" label="缴纳人" width="180" />
            <el-table-column prop="type" label="费用类型" width="140" />
            <el-table-column prop="amount" label="金额" width="120" />
            <el-table-column prop="payMode" label="缴纳方式" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag type="warning">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button link type="success" @click="approve(row)">通过</el-button>
                <el-button link type="danger" @click="reject(row)">驳回</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="已缴纳" name="paid">
          <el-table :data="paidFees" style="width: 100%">
            <el-table-column prop="project" label="关联项目" min-width="240" />
            <el-table-column prop="bidder" label="缴纳人" width="180" />
            <el-table-column prop="type" label="费用类型" width="140" />
            <el-table-column prop="amount" label="金额" width="120" />
            <el-table-column prop="payTime" label="到账时间" width="180" />
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button link type="primary" @click="refund(row)">退还</el-button>
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
import { ElMessage } from 'element-plus'

const activeTab = ref('pending')

const pendingFees = ref([
  { project: 'XX市轨道交通设备采购项目', bidder: 'A科技有限公司', type: '投标保证金', amount: '50,000', payMode: '线下转账', status: '待审核' },
  { project: '办公桌椅采购项目', bidder: 'B实业有限公司', type: '招标文件费', amount: '300', payMode: '线下转账', status: '待审核' },
])

const paidFees = ref([
  { project: 'XX市轨道交通设备采购项目', bidder: 'A科技有限公司', type: '招标文件费', amount: '500', payTime: '2026-07-05 10:00' },
])

const approve = (row) => {
  row.status = '已通过'
  ElMessage.success('审核通过')
}
const reject = (row) => {
  row.status = '已驳回'
  ElMessage.success('已驳回')
}
const refund = (row) => {
  ElMessage.success(`退还 ${row.bidder} 的 ${row.type}`)
}
</script>

<style scoped>
.fee-manage {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  font-weight: bold;
}
</style>
