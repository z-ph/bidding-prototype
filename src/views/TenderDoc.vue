<template>
  <div class="tender-doc">
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
              <span>{{ currentNode.label }}</span>
              <div>
                <el-button type="primary" @click="saveDoc">保存</el-button>
                <el-button @click="previewDoc">预览</el-button>
                <el-button type="success" @click="publishDoc">生成招标文件</el-button>
              </div>
            </div>
          </template>

          <el-form :model="currentNode" label-width="100px" class="doc-form">
            <el-form-item label="章节标题">
              <el-input v-model="currentNode.label" />
            </el-form-item>
          </el-form>

          <div class="editor-toolbar">
            <el-button size="small">加粗</el-button>
            <el-button size="small">标题</el-button>
            <el-button size="small">插入表格</el-button>
            <el-button size="small">插入评分项</el-button>
            <el-button size="small">插入签章位置</el-button>
          </div>

          <el-input
            v-model="currentNode.content"
            type="textarea"
            :rows="18"
            placeholder="在此编辑招标文件内容..."
            class="doc-editor"
          />

          <div class="attach-section">
            <h4>附件清单</h4>
            <el-upload
              action="#"
              :auto-upload="false"
              :file-list="fileList"
              multiple
              drag
              style="width: 100%"
            >
              <el-icon :size="40"><Upload /></el-icon>
              <div class="el-upload__text">拖拽文件到此处或 <em>点击上传</em></div>
            </el-upload>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Upload } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const catalog = ref([
  {
    label: '招标公告',
    children: [
      { label: '项目概况', content: '' },
      { label: '投标人资格要求', content: '' },
    ]
  },
  { label: '投标人须知', content: '' },
  { label: '评标办法', content: '' },
  { label: '合同条款', content: '' },
  {
    label: '采购需求',
    children: [
      { label: '技术规格', content: '' },
      { label: '商务要求', content: '' },
    ]
  },
  { label: '投标文件格式', content: '' },
])

const currentNode = reactive({
  label: '招标公告',
  content: '【招标公告正文】\n\n一、招标条件\n本项目已由相关部门批准建设，招标人为 XX单位，资金来源为自筹。\n\n二、项目概况与招标范围\n...'
})

const fileList = ref([
  { name: '图纸.zip', size: 1024000 },
  { name: '技术参数表.xlsx', size: 256000 },
])

const selectNode = (data) => {
  currentNode.label = data.label
  currentNode.content = data.content || `${data.label} 内容待编辑...`
}

const saveDoc = () => {
  ElMessage.success('招标文件已保存')
}

const previewDoc = () => {
  ElMessage.success('打开招标文件预览')
}

const publishDoc = () => {
  ElMessage.success('招标文件已生成，可关联项目发布')
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
</style>
