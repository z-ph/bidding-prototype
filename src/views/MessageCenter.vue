<template>
  <div class="message-center">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>消息中心</span>
          <el-button type="primary" @click="markAllRead">全部已读</el-button>
        </div>
      </template>
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="全部消息" name="all">
          <el-empty v-if="messages.length === 0" description="暂无消息" />
          <el-timeline v-else>
            <el-timeline-item
              v-for="msg in messages"
              :key="msg.id"
              :type="msg.type"
              :timestamp="msg.time"
            >
              <div :class="{ unread: !msg.read }">
                <strong>{{ msg.title }}</strong>
                <p>{{ msg.content }}</p>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-tab-pane>
        <el-tab-pane label="未读" name="unread">
          <el-empty v-if="unreadMessages.length === 0" description="暂无未读消息" />
          <el-timeline v-else>
            <el-timeline-item
              v-for="msg in unreadMessages"
              :key="msg.id"
              :type="msg.type"
              :timestamp="msg.time"
            >
              <strong>{{ msg.title }}</strong>
              <p>{{ msg.content }}</p>
            </el-timeline-item>
          </el-timeline>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('all')

const messages = ref([
  { id: 1, title: '报名审核通过', content: '您在 XX市轨道交通设备采购项目 的报名已通过审核。', time: '2026-07-08 10:00', type: 'success', read: false },
  { id: 2, title: '开标提醒', content: 'XX市轨道交通设备采购项目 将于 2026-07-08 15:00 开标。', time: '2026-07-08 09:00', type: 'warning', read: false },
  { id: 3, title: '系统通知', content: '平台将于今晚 22:00 进行例行维护。', time: '2026-07-07 18:00', type: 'info', read: true }
])

const unreadMessages = computed(() => messages.value.filter(m => !m.read))

const markAllRead = () => {
  messages.value.forEach(m => { m.read = true })
  ElMessage.success('已全部标记为已读')
}
</script>

<style scoped>
.message-center {
  max-width: 1000px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.unread {
  font-weight: bold;
  color: #001529;
}

.unread p {
  font-weight: normal;
  color: #606266;
}
</style>
