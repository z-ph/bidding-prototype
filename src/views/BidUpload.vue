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
        title="正式提交必须使用 CA 证书加密投标文件，开标前文件内容不可被提前查看。"
        type="info"
        show-icon
        :closable="false"
        style="margin-bottom: 20px"
      />

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="upload-form"
      >
        <el-form-item label="选择项目" prop="projectId">
          <el-select v-model="form.projectId" placeholder="请选择投标项目" style="width: 100%">
            <el-option
              v-for="p in projects"
              :key="p.id"
              :label="p.name"
              :value="p.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="投标标段" prop="packages">
          <el-checkbox-group v-model="form.packages">
            <el-checkbox v-for="pkg in packages" :key="pkg.id" :label="pkg.id">{{ pkg.name }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="加密方式">
          <el-radio-group v-model="form.encryptMode">
            <el-radio label="ca">CA 证书加密（正式提交）</el-radio>
            <el-radio label="password">密码加密</el-radio>
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
          @change="handleFileChange"
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
              <StatusTag :label="row.encrypted ? '已加密' : '未加密'" :status="row.encrypted ? 'completed' : 'pending'" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button link type="danger" @click="removeFile(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-alert
          v-if="fileList.length > 0 && !allEncrypted"
          title="存在未加密文件，请先完成加密或删除后再正式提交"
          type="error"
          show-icon
          :closable="false"
          style="margin-top: 16px"
        />
      </div>

      <div class="actions">
        <el-button type="primary" size="large" :disabled="!canSubmit" @click="submitBid">
          {{ submitBtnText }}
        </el-button>
        <el-button size="large" @click="saveDraft">保存草稿</el-button>
      </div>
    </el-card>

    <el-dialog v-model="receiptVisible" title="投标回执" width="500px" :close-on-click-modal="false">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="项目名称">{{ projectName }}</el-descriptions-item>
        <el-descriptions-item label="投标标段">{{ packageNames }}</el-descriptions-item>
        <el-descriptions-item label="文件数量">{{ fileList.length }} 份</el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ submitTime }}</el-descriptions-item>
        <el-descriptions-item label="回执编号">{{ receiptNo }}</el-descriptions-item>
        <el-descriptions-item label="加密方式">{{ form.encryptMode === 'ca' ? 'CA 证书加密' : '密码加密' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button type="primary" @click="receiptVisible = false">我知道了</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { UploadFilled, SuccessFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import StatusTag from '../components/StatusTag.vue'

const formRef = ref(null)

const projects = ref([
  { id: 1, name: 'XX市轨道交通设备采购项目' },
  { id: 2, name: '办公桌椅采购项目' }
])

const packages = ref([
  { id: 'B1', name: '第一标段：主设备' },
  { id: 'B2', name: '第二标段：辅材' }
])

const form = reactive({
  projectId: null,
  packages: [],
  encryptMode: 'ca'
})

const rules = {
  projectId: [{ required: true, message: '请选择投标项目', trigger: 'change' }],
  packages: [{ required: true, message: '请至少选择一个标段', trigger: 'change', type: 'array' }]
}

const fileList = ref([
  { name: '投标函.pdf', type: '商务标', size: '1.2 MB', encrypted: true },
  { name: '技术方案.docx', type: '技术标', size: '3.5 MB', encrypted: true },
  { name: '报价单.xlsx', type: '报价标', size: '0.8 MB', encrypted: false }
])

const allEncrypted = computed(() => fileList.value.length > 0 && fileList.value.every(f => f.encrypted))
const projectName = computed(() => {
  const p = projects.value.find(item => item.id === form.projectId)
  return p ? p.name : '-'
})
const packageNames = computed(() => {
  return packages.value.filter(p => form.packages.includes(p.id)).map(p => p.name).join('、') || '-'
})

const canSubmit = computed(() => {
  return form.projectId && form.packages.length > 0 && fileList.value.length > 0 && allEncrypted.value
})

const submitBtnText = computed(() => {
  if (fileList.value.length === 0) return '请先上传文件'
  if (!allEncrypted.value) return '存在未加密文件'
  if (!form.projectId || form.packages.length === 0) return '请完善投标信息'
  return '正式提交投标文件'
})

const receiptVisible = ref(false)
const submitTime = ref('')
const receiptNo = ref('')

const handleFileChange = (uploadFile) => {
  // 演示：新上传文件默认未加密
  const raw = uploadFile.raw || uploadFile
  if (!fileList.value.find(f => f.name === raw.name)) {
    fileList.value.push({
      name: raw.name,
      type: '附件',
      size: `${(raw.size / 1024 / 1024).toFixed(2)} MB`,
      encrypted: false
    })
  }
}

const removeFile = (row) => {
  const idx = fileList.value.indexOf(row)
  if (idx > -1) fileList.value.splice(idx, 1)
}

const submitBid = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  if (fileList.value.length === 0) {
    ElMessage.warning('请上传投标文件')
    return
  }
  if (!allEncrypted.value) {
    ElMessage.warning('请完成所有文件加密')
    return
  }

  receiptNo.value = 'ZB' + Date.now()
  submitTime.value = new Date().toLocaleString()
  receiptVisible.value = true
  ElMessage.success('投标文件已加密并提交成功')
}

const saveDraft = async () => {
  await formRef.value.validate().catch(() => {})
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
