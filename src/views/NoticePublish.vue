<template>
  <div class="notice-publish">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>发布公告</span>
          <div>
            <el-button @click="saveDraft">保存草稿</el-button>
            <el-button type="primary" @click="publish">发布</el-button>
          </div>
        </div>
      </template>

      <el-form :model="form" label-width="100px" class="notice-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="公告类型" required>
              <el-select v-model="form.type" placeholder="请选择" style="width: 100%">
                <el-option label="招标公告" value="tender" />
                <el-option label="变更公告" value="change" />
                <el-option label="候选人公示" value="candidate" />
                <el-option label="中标公告" value="result" />
                <el-option label="流标公告" value="abort" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关联项目" required>
              <el-select v-model="form.projectId" placeholder="请选择关联项目" style="width: 100%">
                <el-option
                  v-for="p in projects"
                  :key="p.id"
                  :label="p.name"
                  :value="p.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="公告标题" required>
          <el-input v-model="form.title" placeholder="请输入公告标题" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发布时间">
              <el-date-picker v-model="form.publishTime" type="datetime" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="截止时间">
              <el-date-picker v-model="form.deadline" type="datetime" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="公告正文" required>
          <div class="editor-mock">
            <div class="editor-toolbar">
              <el-button size="small" text>正文</el-button>
              <el-button size="small" text>标题</el-button>
              <el-button size="small" text>加粗</el-button>
              <el-button size="small" text>插入链接</el-button>
              <el-button size="small" text>插入图片</el-button>
              <el-button size="small" text>插入表格</el-button>
            </div>
            <el-input
              v-model="form.content"
              type="textarea"
              :rows="16"
              placeholder="在此编辑公告正文..."
              class="notice-editor"
            />
          </div>
        </el-form-item>
        <el-form-item label="附件">
          <el-upload
            action="#"
            :auto-upload="false"
            :file-list="fileList"
            multiple
          >
            <el-button type="primary">上传附件</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="发布平台">
          <el-checkbox-group v-model="form.channels">
            <el-checkbox label="平台门户" />
            <el-checkbox label="电子招投标系统" />
            <el-checkbox label="短信通知已报名供应商" />
            <el-checkbox label="邮件通知" />
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="公告预览">
          <el-card class="preview-card" shadow="never">
            <h2>{{ form.title || '公告标题' }}</h2>
            <div class="preview-meta">
              <span>发布时间：{{ formatTime(form.publishTime) }}</span>
              <span>截止时间：{{ formatTime(form.deadline) }}</span>
            </div>
            <el-divider />
            <div class="preview-content" v-html="previewContent"></div>
          </el-card>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const projects = ref([
  { id: 1, name: 'XX市轨道交通设备采购项目' },
  { id: 2, name: '办公桌椅采购项目' },
])

const form = reactive({
  type: 'tender',
  projectId: 1,
  title: 'XX市轨道交通设备采购项目招标公告',
  publishTime: new Date(),
  deadline: '',
  content: '一、招标条件\n本项目已由相关部门批准，现进行公开招标。\n\n二、项目概况\n采购内容：轨道交通设备一批。\n\n三、投标人资格要求\n1. 具有独立法人资格；\n2. 具有相应供货能力；\n3. 本项目不接受联合体投标。\n\n四、获取招标文件\n时间：即日起至投标截止时间。\n\n五、联系方式\n招标人：XX市轨道交通集团有限公司',
  channels: ['平台门户', '电子招投标系统'],
})

const fileList = ref([
  { name: '招标文件.pdf', size: 2048000 },
])

const previewContent = computed(() => {
  return form.content.replace(/\n/g, '<br>')
})

const formatTime = (t) => {
  if (!t) return '-'
  return new Date(t).toLocaleString()
}

const saveDraft = () => {
  alert('公告草稿已保存')
}

const publish = () => {
  alert('公告已发布')
}
</script>

<style scoped>
.notice-publish {
  max-width: 1000px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.notice-form {
  margin-top: 10px;
}

.editor-mock {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.editor-toolbar {
  display: flex;
  gap: 4px;
  padding: 8px;
  background: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
}

.notice-editor :deep(textarea) {
  border: none;
  resize: vertical;
}

.preview-card {
  background: #fafafa;
  width: 100%;
}

.preview-card h2 {
  text-align: center;
  margin-bottom: 12px;
}

.preview-meta {
  display: flex;
  justify-content: center;
  gap: 24px;
  color: #666;
  font-size: 14px;
}

.preview-content {
  line-height: 1.8;
  color: #333;
}
</style>
