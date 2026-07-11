<template>
  <div class="contract-archive">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>合同归档</span>
          <el-tag type="primary">项目：XX市轨道交通设备采购项目</el-tag>
        </div>
      </template>
      <el-steps :active="5" finish-status="success" simple style="margin-bottom: 24px">
        <el-step title="评标结束" />
        <el-step title="候选人公示" />
        <el-step title="确认中标人" />
        <el-step title="发送通知书" />
        <el-step title="合同归档" />
      </el-steps>
      <el-alert
        title="上传签订后的中标合同，填写合同信息，完成项目全流程归档。归档后项目状态变更为“已完成”。"
        type="success"
        show-icon
        :closable="false"
        style="margin-bottom: 20px"
      />
      <el-form :model="form" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="合同编号" required>
              <el-input v-model="form.code" placeholder="请输入合同编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="合同金额" required>
              <el-input v-model="form.amount" placeholder="请输入合同金额">
                <template #append>万元</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="签订日期" required>
              <el-date-picker v-model="form.signDate" type="date" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="履约截止日期" required>
              <el-date-picker v-model="form.endDate" type="date" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="合同文件" required>
          <el-upload action="#" :auto-upload="false" :file-list="fileList" multiple drag style="width: 100%">
            <el-icon :size="40"><Upload /></el-icon>
            <div class="el-upload__text">拖拽合同文件到此处或 <em>点击上传</em></div>
          </el-upload>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="其他需要归档说明的内容" />
        </el-form-item>
      </el-form>
      <div class="actions">
        <el-button type="primary" size="large" @click="archive">完成归档</el-button>
        <el-button size="large" @click="$router.push('/admin/projects')">返回项目列表</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Upload } from '@element-plus/icons-vue'

const router = useRouter()

const form = reactive({
  code: '',
  amount: '',
  signDate: '',
  endDate: '',
  remark: ''
})

const fileList = ref([])

const archive = () => {
  alert('合同归档完成，项目已结束')
  router.push('/admin/projects')
}
</script>

<style scoped>
.contract-archive {
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
