<template>
  <div class="forbidden-page">
    <el-result icon="warning" title="无权限访问" :sub-title="subtitle">
      <template #extra>
        <el-button type="primary" @click="goHome">返回我的工作台</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRole } from '../composables/useRole.js'

const router = useRouter()
const { roleName } = useRole()

const subtitle = computed(() => `当前身份：${roleName.value}，您没有权限查看该页面。`)

function goHome() {
  const map = {
    tenderee: '/admin/dashboard',
    agent: '/admin/dashboard',
    bidder: '/admin/dashboard',
    expert: '/admin/dashboard',
    supervisor: '/admin/supervisor-hall',
    admin: '/admin/admin-dashboard'
  }
  const { role } = useRole()
  router.push(map[role.value] || '/admin/dashboard')
}
</script>

<style scoped>
.forbidden-page {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
