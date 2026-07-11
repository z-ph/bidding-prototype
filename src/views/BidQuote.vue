<template>
  <div class="bid-quote">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>在线报价</span>
          <el-tag type="danger">距投标截止：2 天 5 小时</el-tag>
        </div>
      </template>
      <el-steps :active="3" finish-status="success" simple style="margin-bottom: 24px">
        <el-step title="报名通过" />
        <el-step title="下载文件" />
        <el-step title="编制标书" />
        <el-step title="填写报价" />
        <el-step title="上传并加密" />
      </el-steps>
      <el-alert
        title="请按招标文件要求填写开标一览表和分项报价，提交后投标截止前可修改。"
        type="warning"
        show-icon
        :closable="false"
        style="margin-bottom: 20px"
      />
      <h3>开标一览表</h3>
      <el-form :model="quote" label-width="140px" class="quote-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="投标报价（万元）" required>
              <el-input v-model="quote.totalPrice" placeholder="请输入总报价" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="交货期" required>
              <el-input v-model="quote.delivery" placeholder="例如：60天" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="质保期" required>
              <el-input v-model="quote.quality" placeholder="例如：3年" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="付款方式" required>
              <el-input v-model="quote.payment" placeholder="例如：3-6-1" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <h3>分项报价</h3>
      <el-table :data="items" style="width: 100%; margin-bottom: 20px">
        <el-table-column prop="name" label="分项名称" />
        <el-table-column prop="spec" label="规格" />
        <el-table-column prop="quantity" label="数量" width="120" />
        <el-table-column prop="unit" label="单位" width="100" />
        <el-table-column label="单价（元）" width="180">
          <template #default="{ row }">
            <el-input v-model="row.price" placeholder="单价" />
          </template>
        </el-table-column>
        <el-table-column label="小计（元）" width="150">
          <template #default="{ row }">
            {{ row.quantity * (Number(row.price) || 0) }}
          </template>
        </el-table-column>
      </el-table>
      <div class="quote-tips">
        <p><el-icon><InfoFilled /></el-icon> 报价将用于开标唱标，请确保与上传的报价文件一致。</p>
      </div>
      <div class="actions">
        <el-button type="primary" size="large" @click="saveQuote">保存报价</el-button>
        <el-button size="large" @click="$router.push('/admin/bid-upload')">下一步：上传投标文件</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { InfoFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const quote = reactive({
  totalPrice: '',
  delivery: '',
  quality: '',
  payment: ''
})

const items = ref([
  { name: '主设备 A 型', spec: '详见技术参数', quantity: 10, unit: '台', price: '' },
  { name: '辅材 B 型', spec: '详见技术参数', quantity: 50, unit: '套', price: '' },
])

const saveQuote = () => {
  ElMessage.success('报价已保存，请继续上传投标文件')
}
</script>

<style scoped>
.bid-quote {
  max-width: 1100px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.quote-form {
  margin: 20px 0;
}

.quote-tips {
  color: #E6A23C;
  margin-bottom: 20px;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}
</style>
