<template>
  <div class="tender-doc">
    <el-alert
      v-if="docStatus === 'published'"
      title="当前招标文件已发布，如需修改请先创建新版本。"
      type="warning"
      show-icon
      :closable="false"
      style="margin-bottom: 16px"
    />

    <el-row :gutter="20" class="doc-layout">
      <el-col :span="5">
        <el-card class="catalog-card">
          <template #header>
            <div class="card-header"><span>招标文件目录</span></div>
          </template>
          <el-tree
            :data="catalog"
            :props="{ label: 'label', children: 'children' }"
            default-expand-all
            highlight-current
            @node-click="selectNode"
          />
        </el-card>
      </el-col>
      <el-col :span="19">
        <el-card class="editor-card">
          <template #header>
            <div class="editor-header">
              <div class="header-left">
                <span>{{ currentNode.label }}</span>
                <el-tag :type="statusType" size="small">{{ statusLabel }}</el-tag>
                <span class="version-tag">版本 {{ version }}</span>
              </div>
              <div>
                <el-button :disabled="docStatus === 'published'" @click="saveDoc">保存</el-button>
                <el-button @click="previewDoc">预览</el-button>
                <el-button type="success" :disabled="docStatus === 'published' || !canPublish" @click="publishDoc">生成招标文件</el-button>
              </div>
            </div>
          </template>

          <el-descriptions :column="3" border size="small" style="margin-bottom: 16px">
            <el-descriptions-item label="编制人">李四</el-descriptions-item>
            <el-descriptions-item label="复核人">{{ docStatus === 'published' ? '张三' : '待复核' }}</el-descriptions-item>
            <el-descriptions-item label="最近更新">{{ lastUpdate }}</el-descriptions-item>
          </el-descriptions>

          <el-form :model="currentNode" label-width="100px" class="doc-form">
            <el-form-item label="章节标题">
              <el-input v-model="currentNode.label" :disabled="docStatus === 'published'" />
            </el-form-item>
          </el-form>

          <div class="editor-toolbar">
            <el-button size="small" :disabled="docStatus === 'published'">加粗</el-button>
            <el-button size="small" :disabled="docStatus === 'published'">标题</el-button>
            <el-button size="small" :disabled="docStatus === 'published'">插入表格</el-button>
            <el-button size="small" :disabled="docStatus === 'published'">插入评分项</el-button>
            <el-button size="small" :disabled="docStatus === 'published'">插入签章位置</el-button>
          </div>

          <el-input
            v-model="currentNode.content"
            type="textarea"
            :rows="18"
            placeholder="在此编辑招标文件内容..."
            class="doc-editor"
            :disabled="docStatus === 'published'"
          />

          <div class="attach-section">
            <h4>附件清单</h4>
            <el-upload
              action="#"
              :auto-upload="false"
              :file-list="fileList"
              :disabled="docStatus === 'published'"
              multiple
              drag
              style="width: 100%"
            >
              <el-icon :size="40"><Upload /></el-icon>
              <div class="el-upload__text">拖拽文件到此处或 <em>点击上传</em></div>
            </el-upload>
          </div>

          <el-divider />

          <div class="history-section">
            <h4>修改记录</h4>
            <el-timeline>
              <el-timeline-item
                v-for="item in history"
                :key="item.id"
                :type="item.type"
                :timestamp="item.time"
              >
                {{ item.content }}
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Upload } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const docStatus = ref('editing') // editing, reviewed, published
const version = ref('V1.0')
const lastUpdate = ref(new Date().toLocaleString())

const catalog = ref([
  {
    label: '招标公告',
    children: [
      { label: '项目概况', content: '' },
      { label: '投标人资格要求', content: '' }
    ]
  },
  { label: '投标人须知', content: '' },
  { label: '评标办法', content: '' },
  { label: '合同条款', content: '' },
  {
    label: '采购需求',
    children: [
      { label: '技术规格', content: '' },
      { label: '商务要求', content: '' }
    ]
  },
  { label: '投标文件格式', content: '' }
])

const currentNode = reactive({
  label: '招标公告',
  content: '【招标公告正文】\n\n一、招标条件\n本项目已由相关部门批准建设，招标人为 XX单位，资金来源为自筹。\n\n二、项目概况与招标范围\n...'
})

const fileList = ref([
  { name: '图纸.zip', size: 1024000 },
  { name: '技术参数表.xlsx', size: 256000 }
])

const history = ref([
  { id: 1, content: '李四 创建了招标文件 V1.0', time: '2026-07-08 09:00', type: 'primary' },
  { id: 2, content: '李四 编辑了“招标公告”章节', time: '2026-07-08 10:30', type: 'info' }
])

const statusLabel = computed(() => {
  const map = { editing: '编辑中', reviewed: '已复核', published: '已发布' }
  return map[docStatus.value]
})

const statusType = computed(() => {
  const map = { editing: 'info', reviewed: 'warning', published: 'success' }
  return map[docStatus.value]
})

const canPublish = computed(() => {
  return currentNode.content.length > 50 && fileList.value.length > 0
})

const selectNode = (data) => {
  currentNode.label = data.label
  currentNode.content = data.content || `${data.label} 内容待编辑...`
}

const saveDoc = () => {
  lastUpdate.value = new Date().toLocaleString()
  history.value.unshift({
    id: Date.now(),
    content: `李四 编辑了“${currentNode.label}”章节`,
    time: lastUpdate.value,
    type: 'info'
  })
  ElMessage.success('招标文件已保存')
}

const previewDoc = () => {
  ElMessage.success('打开招标文件预览')
}

const publishDoc = () => {
  ElMessageBox.confirm('发布后将不可直接修改，是否继续？', '发布确认', {
    confirmButtonText: '确认发布',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    docStatus.value = 'published'
    lastUpdate.value = new Date().toLocaleString()
    history.value.unshift({
      id: Date.now(),
      content: '张三 复核并发布了招标文件',
      time: lastUpdate.value,
      type: 'success'
    })
    ElMessage.success('招标文件已生成，可关联项目发布')
  })
}
</script>

<style scoped>
.tender-doc {
  min-height: calc(100vh - 120px);
}

.doc-layout {
  height: 100%;
}

.catalog-card {
  height: 100%;
}

.card-header {
  font-weight: bold;
}

.editor-card {
  min-height: 100%;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.version-tag {
  font-size: 12px;
  color: #909399;
  font-weight: normal;
}

.doc-form {
  margin-bottom: 16px;
}

.editor-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.doc-editor :deep(textarea) {
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 14px;
  line-height: 1.8;
}

.attach-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.attach-section h4 {
  margin-bottom: 12px;
}

.history-section h4 {
  margin-bottom: 12px;
}
</style>
