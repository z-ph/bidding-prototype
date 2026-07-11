<template>
  <div class="admin-supplier-audit">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>供应商/专家准入审核</span>
        </div>
      </template>
      <el-alert
        title="审核通过后的供应商/专家方可参与平台业务；驳回时可填写原因，申请人可修改后重新提交。"
        type="info"
        show-icon
        :closable="false"
        style="margin-bottom: 20px"
      />
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="供应商审核" name="supplier">
          <el-table :data="suppliers" style="width: 100%">
            <el-table-column prop="companyName" label="企业名称" min-width="220" />
            <el-table-column prop="creditCode" label="统一社会信用代码" width="200" />
            <el-table-column prop="contactName" label="联系人" width="120" />
            <el-table-column prop="phone" label="手机号" width="140" />
            <el-table-column prop="applyTime" label="申请时间" width="160" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="statusType(row.status)">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="view(row)">查看</el-button>
                <el-button v-if="row.status === '待审核'" link type="success" @click="approve(row)">通过</el-button>
                <el-button v-if="row.status === '待审核'" link type="danger" @click="reject(row)">驳回</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="专家审核" name="expert">
          <el-table :data="experts" style="width: 100%">
            <el-table-column prop="name" label="姓名" width="120" />
            <el-table-column prop="idCard" label="身份证号" width="180" />
            <el-table-column prop="field" label="专业领域" width="150" />
            <el-table-column prop="phone" label="手机号" width="140" />
            <el-table-column prop="applyTime" label="申请时间" width="160" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="statusType(row.status)">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="view(row)">查看</el-button>
                <el-button v-if="row.status === '待审核'" link type="success" @click="approve(row)">通过</el-button>
                <el-button v-if="row.status === '待审核'" link type="danger" @click="reject(row)">驳回</el-button>
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

const activeTab = ref('supplier')

const suppliers = ref([
  { companyName: 'D科技有限公司', creditCode: '91440300XXXXXXXX', contactName: '王五', phone: '13800138000', applyTime: '2026-07-08 09:00', status: '待审核' },
  { companyName: 'E实业有限公司', creditCode: '91440300YYYYYYYY', contactName: '赵六', phone: '13900139000', applyTime: '2026-07-07 16:00', status: '已通过' },
])

const experts = ref([
  { name: '专家丁', idCard: '110101XXXXXXXX0011', field: '土木工程', phone: '13700137000', applyTime: '2026-07-08 10:00', status: '待审核' },
])

const statusType = (s) => {
  const map = { '待审核': 'warning', '已通过': 'success', '已驳回': 'danger' }
  return map[s] || ''
}

const view = (row) => alert(`查看详情：${row.companyName || row.name}`)
const approve = (row) => {
  row.status = '已通过'
  alert('审核已通过')
}
const reject = (row) => {
  row.status = '已驳回'
  alert('已驳回，原因：资质材料不完整')
}
</script>

<style scoped>
.admin-supplier-audit {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  font-weight: bold;
}
</style>
