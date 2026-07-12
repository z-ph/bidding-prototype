<template>
  <div class="supplier-profile">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>企业档案与资质</span>
          <el-button type="primary" @click="saveProfile">保存</el-button>
        </div>
      </template>
      <el-form :model="form" label-width="140px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="企业名称">
              <el-input v-model="form.name" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="统一社会信用代码">
              <el-input v-model="form.creditCode" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="注册资本（万元）">
              <el-input v-model="form.capital" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="成立日期">
              <el-date-picker v-model="form.foundDate" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="经营范围">
          <el-input v-model="form.businessScope" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="资质证书">
          <el-upload action="#" :auto-upload="false" :file-list="fileList" multiple>
            <el-button type="primary">上传资质</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

const form = reactive({
  name: 'A科技有限公司',
  creditCode: '91440300MA5GXXXXXX',
  capital: '5000',
  foundDate: '2018-05-20',
  businessScope: '计算机软硬件、电子设备的研发、销售及技术服务；系统集成；网络工程等。'
})

const fileList = ref([
  { name: '营业执照.pdf' },
  { name: 'ISO9001证书.pdf' }
])

const saveProfile = () => {
  ElMessage.success('企业档案已保存')
}
</script>

<style scoped>
.supplier-profile {
  max-width: 1000px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}
</style>
