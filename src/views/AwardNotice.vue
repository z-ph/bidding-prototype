<template>
  <div class="award-notice">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>发送中标通知书</span>
          <el-tag type="success">中标人：C股份有限公司</el-tag>
        </div>
      </template>
      <el-steps :active="4" finish-status="success" simple style="margin-bottom: 24px">
        <el-step title="评标结束" />
        <el-step title="候选人公示" />
        <el-step title="确认中标人" />
        <el-step title="结果公示" />
        <el-step title="发送通知书" />
      </el-steps>
      <el-alert
        title="根据模板生成中标通知书，支持在线编辑、签章后发送给中标人。发送后中标人可在工作台查看。"
        type="info"
        show-icon
        :closable="false"
        style="margin-bottom: 20px"
      />
      <el-form :model="form" label-width="120px">
        <el-form-item label="通知书标题" required>
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="中标人" required>
          <el-input v-model="form.bidder" disabled />
        </el-form-item>
        <el-form-item label="中标金额" required>
          <el-input v-model="form.amount" />
        </el-form-item>
        <el-form-item label="通知书正文" required>
          <el-input v-model="form.content" type="textarea" :rows="10" />
        </el-form-item>
        <el-form-item label="电子签章">
          <el-button type="primary" plain @click="sign">点击进行电子签章</el-button>
          <span v-if="form.signed" style="color: #67C23A; margin-left: 12px"><el-icon><Select /></el-icon> 已签章</span>
        </el-form-item>
      </el-form>
      <div class="actions">
        <el-button type="primary" size="large" @click="send">发送中标通知书</el-button>
        <el-button size="large" @click="preview">预览</el-button>
        <el-button size="large" @click="$router.push('/admin/contract-archive')">下一步：合同归档</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Select } from '@element-plus/icons-vue'

const router = useRouter()

const form = reactive({
  title: 'XX市轨道交通设备采购项目中标通知书',
  bidder: 'C股份有限公司',
  amount: '798 万元',
  content: '贵司参与的 XX市轨道交通设备采购项目 经评标委员会评审、招标人确认，被确定为中标人。请于收到通知书后 30 日内与招标人签订合同。',
  signed: false
})

const sign = () => {
  alert('电子签章成功')
  form.signed = true
}

const preview = () => {
  alert('打开中标通知书预览')
}

const send = () => {
  alert('中标通知书已发送给中标人')
  router.push('/admin/contract-archive')
}
</script>

<style scoped>
.award-notice {
  max-width: 1000px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
}
</style>
