<template>
  <div class="bid-register">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>项目报名</span>
          <el-tag type="primary">项目：XX市轨道交通设备采购项目</el-tag>
        </div>
      </template>
      <el-alert
        title="请确认贵司符合招标公告中的资格要求，提交后将进入招标方审核。"
        type="info"
        show-icon
        :closable="false"
        style="margin-bottom: 20px"
      />
      <el-form :model="form" label-width="140px" class="register-form">
        <el-form-item label="报名标段" required>
          <el-checkbox-group v-model="form.packages">
            <el-checkbox label="B1">第一标段：主设备</el-checkbox>
            <el-checkbox label="B2">第二标段：辅材</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="联系人" required>
          <el-input v-model="form.contact" placeholder="请输入联系人姓名" />
        </el-form-item>
        <el-form-item label="联系电话" required>
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="电子邮箱" required>
          <el-input v-model="form.email" placeholder="请输入电子邮箱" />
        </el-form-item>
        <el-form-item label="资质文件" required>
          <el-upload action="#" :auto-upload="false" :file-list="fileList" multiple drag style="width: 100%">
            <el-icon :size="40"><Upload /></el-icon>
            <div class="el-upload__text">拖拽文件到此处或 <em>点击上传</em></div>
          </el-upload>
        </el-form-item>
        <el-form-item label="备注说明">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="其他需要说明的内容" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submit">提交报名</el-button>
          <el-button @click="$router.back()">返回</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Upload } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()

const form = reactive({
  packages: ['B1'],
  contact: '',
  phone: '',
  email: '',
  remark: ''
})

const fileList = ref([])

const submit = () => {
  ElMessage.success('报名申请已提交，等待招标方审核')
  router.push('/admin/bidder-projects')
}
</script>

<style scoped>
.bid-register {
  max-width: 900px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.register-form {
  margin-top: 10px;
}
</style>
