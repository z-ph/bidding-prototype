<template>
  <el-tag :type="tagType" :size="size" effect="light">
    {{ label }}
  </el-tag>
</template>

<script setup>
import { computed } from 'vue'
import { STATUS_COLORS } from '../config/permissions.js'

const props = defineProps({
  status: { type: String, default: '' },
  label: { type: String, default: '' },
  size: { type: String, default: 'default' }
})

const tagType = computed(() => {
  const key = String(props.status || props.label || '')
  return STATUS_COLORS[key] || 'info'
})
</script>
