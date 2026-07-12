<template>
  <div class="empty-state">
    <el-empty :description="description">
      <template #image>
        <el-icon :size="64" :color="iconColor">
          <component :is="icon" />
        </el-icon>
      </template>
      <template v-if="$slots.default">
        <slot />
      </template>
      <template v-else-if="actionText">
        <el-button :type="actionType" @click="$emit('action')">{{ actionText }}</el-button>
      </template>
    </el-empty>
  </div>
</template>

<script setup>
import { computed } from 'vue'

defineProps({
  description: { type: String, default: '暂无数据' },
  icon: { type: String, default: 'Document' },
  iconColor: { type: String, default: '#C0C4CC' },
  actionText: { type: String, default: '' },
  actionType: { type: String, default: 'primary' }
})

defineEmits(['action'])
</script>

<style scoped>
.empty-state {
  padding: 40px 0;
}
</style>
