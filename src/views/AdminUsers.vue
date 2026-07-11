<template>
  <div class="admin-users">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户与权限</span>
          <el-button type="primary" @click="dialogVisible = true">新增用户</el-button>
        </div>
      </template>
      <el-alert
        title="配置系统用户、角色和菜单权限，不同角色进入系统后看到不同的工作台和菜单。"
        type="info"
        show-icon
        :closable="false"
        style="margin-bottom: 20px"
      />
      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="6">
          <el-input v-model="search.name" placeholder="用户名/账号" clearable />
        </el-col>
        <el-col :span="4">
          <el-select v-model="search.role" placeholder="角色" clearable style="width: 100%">
            <el-option label="招标人" value="tenderee" />
            <el-option label="招标代理" value="agent" />
            <el-option label="投标人" value="bidder" />
            <el-option label="评标专家" value="expert" />
            <el-option label="监督人员" value="supervisor" />
            <el-option label="平台管理员" value="admin" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="load">查询</el-button>
        </el-col>
      </el-row>
      <el-table :data="users" style="width: 100%">
        <el-table-column prop="account" label="账号" width="150" />
        <el-table-column prop="name" label="姓名/企业" min-width="200" />
        <el-table-column prop="role" label="角色" width="120" />
        <el-table-column prop="org" label="所属组织" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '启用' ? 'success' : 'info'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button link type="primary" @click="edit(row)">编辑</el-button>
            <el-button link type="primary" @click="setPermission(row)">权限</el-button>
            <el-button link type="danger" @click="toggleStatus(row)">{{ row.status === '启用' ? '禁用' : '启用' }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="新增用户" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="账号"><el-input v-model="form.account" /></el-form-item>
        <el-form-item label="姓名"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.role" style="width: 100%">
            <el-option label="招标人" value="tenderee" />
            <el-option label="招标代理" value="agent" />
            <el-option label="投标人" value="bidder" />
            <el-option label="评标专家" value="expert" />
            <el-option label="监督人员" value="supervisor" />
            <el-option label="平台管理员" value="admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属组织"><el-input v-model="form.org" /></el-form-item>
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

const search = reactive({ name: '', role: '' })
const users = ref([
  { account: 'admin', name: '平台管理员', role: '平台管理员', org: '平台运营部', status: '启用' },
  { account: 'tenderee01', name: '张三', role: '招标人', org: 'XX市轨道交通集团', status: '启用' },
  { account: 'agent01', name: '李四', role: '招标代理', org: 'XX招标代理有限公司', status: '启用' },
  { account: 'bidder01', name: 'A科技有限公司', role: '投标人', org: 'A科技有限公司', status: '启用' },
  { account: 'expert01', name: '专家甲', role: '评标专家', org: '个人', status: '启用' },
])

const dialogVisible = ref(false)
const form = reactive({ account: '', name: '', role: '', org: '' })

const load = () => ElMessage.success('查询用户')
const edit = (row) => ElMessage.success(`编辑：${row.name}`)
const setPermission = (row) => ElMessage.success(`配置 ${row.name} 的菜单权限`)
const toggleStatus = (row) => {
  row.status = row.status === '启用' ? '禁用' : '启用'
}
const save = () => {
  ElMessage.success('用户已保存')
  dialogVisible.value = false
}
</script>

<style scoped>
.admin-users {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}
</style>
