<template>
  <div class="expert-profile">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>专家库 / 个人信息</span>
          <el-button type="primary" @click="saveProfile">保存</el-button>
        </div>
      </template>
      <el-form :model="form" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="专家姓名">
              <el-input v-model="form.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="身份证号">
              <el-input v-model="form.idCard" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="专业领域">
              <el-select v-model="form.field" style="width: 100%">
                <el-option label="电子信息" value="电子信息" />
                <el-option label="机械设备" value="机械设备" />
                <el-option label="工程造价" value="工程造价" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="职称">
              <el-input v-model="form.title" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="工作单位">
          <el-input v-model="form.company" />
        </el-form-item>
        <el-form-item label="回避单位">
          <el-select v-model="form.avoidCompanies" multiple style="width: 100%">
            <el-option label="A科技有限公司" value="A科技有限公司" />
            <el-option label="B实业有限公司" value="B实业有限公司" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'

const form = reactive({
  name: '专家甲',
  idCard: '11010119800101XXXX',
  field: '电子信息',
  title: '高级工程师',
  company: 'XX研究院',
  avoidCompanies: []
})

const saveProfile = () => {
  ElMessage.success('专家信息已保存')
}
</script>

<style scoped>
.expert-profile {
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
