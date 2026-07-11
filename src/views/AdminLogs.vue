<template>
  <div class="admin-logs">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>系统日志审计</span>
          <el-button type="primary" @click="exportLogs">导出日志</el-button>
        </div>
      </template>
      <el-alert
        title="记录系统操作、短信/邮件发送、关键业务操作日志，满足合规审计要求。"
        type="info"
        show-icon
        :closable="false"
        style="margin-bottom: 20px"
      />
      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="6"><el-input v-model="search.operator" placeholder="操作人" clearable /></el-col>
        <el-col :span="6">
          <el-select v-model="search.type" placeholder="日志类型" clearable style="width: 100%">
            <el-option label="系统操作" value="system" />
            <el-option label="短信发送" value="sms" />
            <el-option label="邮件发送" value="email" />
            <el-option label="关键业务" value="business" />
          </el-select>
        </el-col>
        <el-col :span="6"><el-button type="primary" @click="load">查询</el-button></el-col>
      </el-row>
      <el-table :data="logs" style="width: 100%">
        <el-table-column prop="time" label="时间" width="180" />
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column prop="operator" label="操作人" width="150" />
        <el-table-column prop="action" label="操作内容" min-width="300" />
        <el-table-column prop="ip" label="IP" width="140" />
        <el-table-column prop="result" label="结果" width="100">
          <template #default="{ row }">
            <el-tag :type="row.result === '成功' ? 'success' : 'danger'">{{ row.result }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const search = reactive({ operator: '', type: '' })
const logs = ref([
  { time: '2026-07-08 10:00:00', type: '系统操作', operator: 'admin', action: '登录系统', ip: '192.168.1.1', result: '成功' },
  { time: '2026-07-08 10:05:22', type: '关键业务', operator: '张三', action: '创建采购需求', ip: '192.168.1.10', result: '成功' },
  { time: '2026-07-08 10:30:11', type: '短信发送', operator: '系统', action: '向专家甲发送评标通知短信', ip: '-', result: '成功' },
  { time: '2026-07-08 11:00:45', type: '关键业务', operator: '李四', action: '发布招标公告', ip: '192.168.1.11', result: '成功' },
])

const load = () => alert('查询日志')
const exportLogs = () => alert('导出系统日志')
</script>

<style scoped>
.admin-logs {
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
