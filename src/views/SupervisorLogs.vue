<template>
  <div class="supervisor-logs">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>操作日志</span>
          <el-button type="primary" @click="exportLogs">导出日志</el-button>
        </div>
      </template>
      <el-alert
        title="本页记录开标、评标过程中的关键操作，包括签到、解密、唱标、评分、签名等行为。"
        type="info"
        show-icon
        :closable="false"
        style="margin-bottom: 20px"
      />
      <el-table :data="logs" style="width: 100%">
        <el-table-column prop="time" label="操作时间" width="180" />
        <el-table-column prop="operator" label="操作人" width="150" />
        <el-table-column prop="role" label="角色" width="120" />
        <el-table-column prop="action" label="操作内容" min-width="250" />
        <el-table-column prop="ip" label="IP 地址" width="140" />
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
import { ref } from 'vue'

const logs = ref([
  { time: '2026-07-08 14:50:12', operator: '张三', role: '招标人', action: '进入开标大厅', ip: '192.168.1.10', result: '成功' },
  { time: '2026-07-08 14:55:33', operator: 'A科技有限公司', role: '投标人', action: '在线签到', ip: '192.168.1.21', result: '成功' },
  { time: '2026-07-08 15:02:18', operator: 'A科技有限公司', role: '投标人', action: 'CA 解密投标文件', ip: '192.168.1.21', result: '成功' },
  { time: '2026-07-08 15:10:05', operator: '李四', role: '招标代理', action: '执行唱标', ip: '192.168.1.11', result: '成功' },
  { time: '2026-07-08 15:30:22', operator: '专家甲', role: '评标专家', action: '提交评分', ip: '192.168.1.31', result: '成功' },
])

const exportLogs = () => {
  alert('操作日志导出中...')
}
</script>

<style scoped>
.supervisor-logs {
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
