<template>
  <div class="admin-dictionary">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>参数字典</span>
          <el-button type="primary" @click="dialogVisible = true">新增字典项</el-button>
        </div>
      </template>
      <el-alert
        title="维护项目类型、采购方式、资质类别、标段分类等系统选项，供业务表单统一引用。"
        type="info"
        show-icon
        :closable="false"
        style="margin-bottom: 20px"
      />
      <el-table :data="dicts" style="width: 100%" row-key="id" default-expand-all>
        <el-table-column prop="name" label="字典名称" min-width="200" />
        <el-table-column prop="code" label="字典编码" width="180" />
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '启用' ? 'success' : 'info'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button link type="primary" @click="edit(row)">编辑</el-button>
            <el-button link type="primary" @click="addChild(row)">新增子项</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="新增字典项" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="字典名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="字典编码"><el-input v-model="form.code" /></el-form-item>
        <el-form-item label="所属分类">
          <el-select v-model="form.parent" style="width: 100%">
            <el-option label="顶层分类" value="" />
            <el-option label="采购方式" value="purchase" />
            <el-option label="项目类型" value="project" />
            <el-option label="资质类别" value="qualification" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const dicts = ref([
  {
    id: 1, name: '采购方式', code: 'purchase_mode', type: '分类', status: '启用',
    children: [
      { id: 11, name: '公开招标', code: 'open', type: '选项', status: '启用' },
      { id: 12, name: '邀请招标', code: 'invitation', type: '选项', status: '启用' },
      { id: 13, name: '公开询比价', code: 'inquiry', type: '选项', status: '启用' },
      { id: 14, name: '单一来源', code: 'single', type: '选项', status: '启用' },
    ]
  },
  {
    id: 2, name: '项目类型', code: 'project_type', type: '分类', status: '启用',
    children: [
      { id: 21, name: '工程', code: 'engineering', type: '选项', status: '启用' },
      { id: 22, name: '货物', code: 'goods', type: '选项', status: '启用' },
      { id: 23, name: '服务', code: 'service', type: '选项', status: '启用' },
    ]
  },
])

const dialogVisible = ref(false)
const form = reactive({ name: '', code: '', parent: '' })

const edit = (row) => ElMessage.success(`编辑字典：${row.name}`)
const addChild = (row) => {
  form.parent = row.code
  dialogVisible.value = true
}
const save = () => {
  ElMessage.success('字典项已保存')
  dialogVisible.value = false
}
</script>

<style scoped>
.admin-dictionary {
  max-width: 1100px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}
</style>
