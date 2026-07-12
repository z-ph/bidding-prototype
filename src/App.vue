<template>
  <router-view />

  <!-- 全局页面评审入口 -->
  <el-button
    v-if="showReviewFab"
    class="review-fab"
    type="primary"
    circle
    size="large"
    :icon="EditPen"
    title="页面评审"
    @click="reviewActive = true"
  />
  <ReviewTool v-model:active="reviewActive" />
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { EditPen } from '@element-plus/icons-vue'
import ReviewTool from './components/ReviewTool.vue'

const route = useRoute()
const reviewActive = ref(false)

const showReviewFab = computed(() => {
  // 登录/注册页不显示评审入口，其他页面均可评审
  return !['/login', '/register'].includes(route.path)
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f5f7fa;
}

.review-fab {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
</style>
