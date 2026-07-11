<template>
  <div class="bid-upload">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>投标文件上传</span>
          <el-tag type="warning">距截止时间：2 天 5 小时</el-tag>
        </div>
      </template>

      <el-alert
        title="请使用 CA 证书对投标文件进行加密上传，确保开标前文件内容不可被提前查看。"
        type="info"
        show-icon
        :closable="false"
        style="margin-bottom: 20px"
      />

      <el-form :model="form" label-width="120px" class="upload-form">
        <el-form-item label="选择项目">
          <el-select v-model="form.projectId" placeholder="请选择投标项目" style="width: 100%">
            <el-option
              v-for="p in projects"
              :key="p.id"
              :label="p.name"
              :value="p.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="投标标段">
          <el-checkbox-group v-model="form.packages">
            <el-checkbox v-for="pkg in packages" :key="pkg.id" :label="pkg.id">{{ pkg.name }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="加密方式">
          <el-radio-group v-model="form.encryptMode">
            <el-radio label="ca">CA 证书加密（推荐）</el-radio>
            <el-radio label="password">密码加密</el-radio>
            <el-radio label="none">不加密（仅测试）</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.encryptMode === 'ca'" label="CA 状态">
          <div class="ca-status">
            <el-icon :size="24" color="#67C23A"><SuccessFilled /></el-icon>
            <span>已检测到 CA 证书：深圳市电子商务安全证书管理有限公司</span>
            <el-button link type="primary">重新检测</el-button>
          </div>
        </el-form-item>
      </el-form>

      <el-divider />

      <div class="file-section">
        <h4>投标文件组成</h4>
        <el-upload
          action="#"
          :auto-upload="false"
          :file-list="fileList"
          multiple
          drag
        >
          <el-icon :size="48" color="#409EFF"><UploadFilled /></el-icon>
          <div class="el-upload__text">将投标文件拖拽到此处，或 <em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">支持 PDF、ZIP、DOCX 格式，单个文件不超过 500MB</div>
          </template>
        </el-upload>

        <el-table :data="fileList" style="width: 100%; margin-top: 16px" empty-text="暂无文件">
          <el-table-column prop="name" label="文件名" />
          <el-table-column prop="type" label="文件类型" width="130" />
          <el-table-column prop="size" label="大小" width="120" />
          <el-table-column label="加密状态" width="120">
            <template #default="{ row }">
              <el-tag :type="row.encrypted ? 'success' : 'info'">{{ row.encrypted ? '已加密' : '未加密' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button link type="danger" @click="removeFile(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="actions">
        <el-button type="primary" size="large" @click="encryptAndUpload">加密并上传</el-button>
        <el-button size="large" @click="saveDraft">保存草稿</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { UploadFilled, SuccessFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const projects = ref([
  { id: 1, name: 'XX市轨道交通设备采购项目' },
  { id: 2, name: '办公桌椅采购项目' },
])

const packages = ref([
  { id: 'B1', name: '第一标段：主设备' },
  { id: 'B2', name: '第二标段：辅材' },
])

const form = reactive({
  projectId: 1,
  packages: ['B1'],
  encryptMode: 'ca',
})

const fileList = ref([
  { name: '投标函.pdf', type: '商务标', size: '1.2 MB', encrypted: true },
  { name: '技术方案.docx', type: '技术标', size: '3.5 MB', encrypted: true },
  { name: '报价单.xlsx', type: '报价标', size: '0.8 MB', encrypted: false },
])

const removeFile = (row) => {
  const idx = fileList.value.indexOf(row)
  if (idx > -1) fileList.value.splice(idx, 1)
}

const encryptAndUpload = () => {
  ElMessage.success('正在使用 CA 公钥加密投标文件并上传...\n上传成功！')
}

const saveDraft = () => {
  ElMessage.success('投标文件草稿已保存')
}
</script>

<style scoped>
.bid-upload {
  max-width: 1000px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.upload-form {
  margin-top: 10px;
}

.ca-status {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #67C23A;
}

.file-section h4 {
  margin-bottom: 16px;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 30px;
}
</style>
