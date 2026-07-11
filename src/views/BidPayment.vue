<template>
  <div class="bid-payment">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>费用缴纳</span>
          <el-tag type="warning">项目：XX市轨道交通设备采购项目</el-tag>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="16">
          <el-form :model="form" label-width="120px">
            <el-form-item label="缴纳项目">
              <el-radio-group v-model="form.feeType">
                <el-radio label="doc">招标文件费</el-radio>
                <el-radio label="deposit">投标保证金</el-radio>
                <el-radio label="platform">平台使用费</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="缴纳金额">
              <el-input v-model="form.amount" placeholder="请输入金额">
                <template #append>元</template>
              </el-input>
            </el-form-item>
            <el-form-item label="缴纳方式">
              <el-radio-group v-model="form.payMode">
                <el-radio label="online">在线支付</el-radio>
                <el-radio label="offline">线下转账</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="form.payMode === 'offline'" label="转账凭证">
              <el-upload action="#" :auto-upload="false" :file-list="fileList">
                <el-button type="primary">上传凭证</el-button>
              </el-upload>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submit">提交缴纳</el-button>
              <el-button @click="$router.push('/admin/bidder-invoices')">申请发票</el-button>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="8">
          <el-card shadow="never" class="fee-summary">
            <h4>费用明细</h4>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="招标文件费">500 元</el-descriptions-item>
              <el-descriptions-item label="投标保证金">50,000 元</el-descriptions-item>
              <el-descriptions-item label="平台使用费">0 元</el-descriptions-item>
              <el-descriptions-item label="已缴纳">0 元</el-descriptions-item>
              <el-descriptions-item label="待缴纳">50,500 元</el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = reactive({
  feeType: 'doc',
  amount: '',
  payMode: 'online'
})

const fileList = ref([])

const submit = () => {
  alert('缴纳申请已提交，等待代理机构审核')
  router.push('/admin/bidder-projects')
}
</script>

<style scoped>
.bid-payment {
  max-width: 1100px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.fee-summary h4 {
  margin-bottom: 16px;
}
</style>
