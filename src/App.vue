<template>
  <router-view />

  <!-- 全局页面评审入口 -->
  <el-button
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
import { ref } from 'vue'
import { EditPen } from '@element-plus/icons-vue'
import ReviewTool from './components/ReviewTool.vue'

const reviewActive = ref(false)
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
