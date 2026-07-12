<template>
  <teleport to="body">
    <div v-if="active" class="review-overlay" @click="handleOverlayClick">
      <!-- 顶部工具栏 -->
      <div
        class="review-toolbar"
        :class="{ 'is-dragging': isDraggingToolbar }"
        :style="toolbarStyle"
        @click.stop
        @mousedown="onToolbarMouseDown"
      >
        <div class="toolbar-left">
          <span class="toolbar-title" title="按住此处可拖动">页面评审模式</span>
          <el-radio-group v-model="mode" size="small">
            <el-radio-button label="element">选择元素</el-radio-button>
            <el-radio-button label="viewport">框定视图</el-radio-button>
          </el-radio-group>
        </div>
        <div class="toolbar-right">
          <el-badge :value="pageReviews.length" class="review-badge">
            <el-button size="small" @click="listVisible = true">评审列表</el-button>
          </el-badge>
          <el-dropdown size="small" split-button type="primary" @click="exportToMarkdown">
            导出
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="exportToMarkdown">导出为 Markdown</el-dropdown-item>
                <el-dropdown-item @click="exportToJSON">导出为 JSON</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button size="small" type="danger" @click="close">退出评审</el-button>
        </div>
      </div>

      <!-- 元素高亮框 -->
      <div
        v-if="hoveredRect && mode === 'element' && !formVisible"
        class="highlight-box hover-box"
        :style="highlightStyle(hoveredRect)"
      >
        <span class="highlight-label">{{ hoveredTag }}</span>
      </div>

      <!-- 已选元素确认框 -->
      <div
        v-if="selectedElement && mode === 'element' && !formVisible"
        class="highlight-box selected-box"
        :style="highlightStyle(selectedElement.rect)"
      >
        <span class="highlight-label">已选：{{ selectedElement.tag }}</span>
      </div>

      <!-- 框选矩形 -->
      <div
        v-if="dragRect"
        class="drag-rect"
        :style="dragRectStyle"
      />

      <!-- 评审意见表单弹窗 -->
      <el-dialog
        v-model="formVisible"
        title="添加评审意见"
        width="520px"
        :close-on-click-modal="false"
        @closed="resetForm"
      >
        <el-form :model="form" label-width="80px">
          <el-form-item label="评审位置">
            <div class="review-target-info">
              <el-tag size="small">{{ form.type === 'element' ? '元素' : '视图范围' }}</el-tag>
              <span v-if="form.type === 'element'" class="target-desc">{{ form.elementText || form.selector }}</span>
              <span v-else class="target-desc">
                框选区域 x={{ form.viewportRect?.x }}, y={{ form.viewportRect?.y }}, w={{ form.viewportRect?.width }}, h={{ form.viewportRect?.height }}
              </span>
            </div>
          </el-form-item>
          <el-form-item label="窗口尺寸">
            <span class="text-muted">{{ form.viewport?.width }} × {{ form.viewport?.height }}</span>
          </el-form-item>
          <el-form-item label="滚动位置">
            <span class="text-muted">x={{ form.scroll?.x }}, y={{ form.scroll?.y }}</span>
          </el-form-item>
          <el-form-item label="标题" required>
            <el-input v-model="form.title" placeholder="例如：按钮样式不统一" />
          </el-form-item>
          <el-form-item label="严重等级" required>
            <el-radio-group v-model="form.severity">
              <el-radio label="low">低</el-radio>
              <el-radio label="medium">中</el-radio>
              <el-radio label="high">高</el-radio>
              <el-radio label="critical">严重</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="评审建议" required>
            <el-input
              v-model="form.suggestion"
              type="textarea"
              :rows="4"
              placeholder="描述问题现象、影响和改进建议"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="formVisible = false">取消</el-button>
          <el-button type="primary" :disabled="!canSubmit" @click="submitReview">保存评审</el-button>
        </template>
      </el-dialog>

      <!-- 评审列表抽屉 -->
      <el-drawer
        v-model="listVisible"
        title="当前页面评审意见"
        size="480px"
        :with-header="true"
      >
        <div class="review-list-actions">
          <el-button size="small" type="primary" @click="exportToMarkdown">导出 Markdown</el-button>
          <el-button size="small" @click="exportToJSON">导出 JSON</el-button>
          <el-button size="small" type="danger" text @click="clearPage">清空本页</el-button>
        </div>
        <el-empty v-if="pageReviews.length === 0" description="暂无评审意见" />
        <div v-else class="review-list">
          <el-card v-for="item in pageReviews" :key="item.id" class="review-item" shadow="never">
            <div class="review-item-header">
              <span class="review-item-title">{{ item.title }}</span>
              <div class="review-item-tags">
                <el-tag size="small" :type="severityType(item.severity)">{{ severityText(item.severity) }}</el-tag>
                <el-tag size="small" type="info">{{ item.type === 'element' ? '元素' : '视图' }}</el-tag>
              </div>
            </div>
            <p class="review-item-target">
              {{ item.type === 'element' ? (item.elementText || item.selector) : `框选 x=${item.viewportRect.x}, y=${item.viewportRect.y}` }}
            </p>
            <p class="review-item-suggestion">{{ item.suggestion }}</p>
            <div class="review-item-meta">
              <span class="text-muted">{{ new Date(item.createdAt).toLocaleString() }}</span>
              <div class="review-item-actions">
                <el-button v-if="item.status !== 'resolved'" link type="primary" size="small" @click="resolve(item.id)">标记解决</el-button>
                <el-button link type="danger" size="small" @click="remove(item.id)">删除</el-button>
              </div>
            </div>
          </el-card>
        </div>
      </el-drawer>
    </div>
  </teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { ElMessageBox } from 'element-plus'
import { usePageReview } from './useReview.js'

const props = defineProps({
  active: { type: Boolean, default: false },
  pagePath: { type: String, default: '' },
  pageName: { type: String, default: '' },
  storageKey: { type: String, default: 'page-reviews' }
})

const emit = defineEmits(['update:active', 'add', 'update', 'delete', 'clear', 'export'])

const resolvedPagePath = computed(() => {
  return props.pagePath || (typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/')
})

const { reviews, getPageReviews, addReview, updateReview, deleteReview, clearPageReviews, exportToJSON, exportToMarkdown } = usePageReview({
  storageKey: props.storageKey,
  defaultPagePath: () => resolvedPagePath.value
})

const pageReviews = computed(() => getPageReviews(resolvedPagePath.value))

const mode = ref('element')
const formVisible = ref(false)
const listVisible = ref(false)

const hoveredRect = ref(null)
const hoveredTag = ref('')
const selectedElement = ref(null)

const dragRect = ref(null)
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })

const toolbarPos = ref({ x: 0, y: 0 })
const isDraggingToolbar = ref(false)
const toolbarDragStart = ref({ x: 0, y: 0 })

const form = ref({
  type: 'element',
  title: '',
  severity: 'medium',
  suggestion: '',
  selector: '',
  elementText: '',
  elementRect: null,
  viewportRect: null,
  viewport: { width: 0, height: 0 },
  scroll: { x: 0, y: 0 },
  pagePath: '',
  pageUrl: '',
  pageName: ''
})

const canSubmit = computed(() => form.value.title.trim() && form.value.suggestion.trim())

const dragRectStyle = computed(() => {
  if (!dragRect.value) return {}
  const r = dragRect.value
  return {
    left: r.x + 'px',
    top: r.y + 'px',
    width: r.width + 'px',
    height: r.height + 'px'
  }
})

const toolbarStyle = computed(() => {
  const { x, y } = toolbarPos.value
  return {
    transform: `translate(calc(-50% + ${x}px), ${y}px)`
  }
})

function highlightStyle(rect) {
  if (!rect) return {}
  return {
    left: rect.x + 'px',
    top: rect.y + 'px',
    width: rect.width + 'px',
    height: rect.height + 'px'
  }
}

function severityType(s) {
  const map = { low: 'info', medium: 'warning', high: 'danger', critical: 'danger' }
  return map[s] || 'info'
}

function severityText(s) {
  const map = { low: '低', medium: '中', high: '高', critical: '严重' }
  return map[s] || s
}

function captureEnv() {
  return {
    viewport: { width: window.innerWidth, height: window.innerHeight },
    scroll: { x: window.scrollX, y: window.scrollY },
    pagePath: resolvedPagePath.value,
    pageUrl: window.location.href,
    pageName: props.pageName || resolvedPagePath.value
  }
}

function getElementSelector(el) {
  if (el.id) return '#' + el.id
  if (el.className) {
    const classes = String(el.className).split(/\s+/).filter(c => c && !c.startsWith('el-')).slice(0, 2)
    if (classes.length) return el.tagName.toLowerCase() + '.' + classes.join('.')
  }
  let path = []
  let node = el
  while (node && node !== document.body) {
    let name = node.tagName.toLowerCase()
    if (node.id) {
      name += '#' + node.id
      path.unshift(name)
      break
    }
    const siblings = Array.from(node.parentNode?.children || [])
    const same = siblings.filter(s => s.tagName === node.tagName)
    if (same.length > 1) {
      const idx = same.indexOf(node) + 1
      name += `:nth-of-type(${idx})`
    }
    path.unshift(name)
    node = node.parentNode
  }
  return path.join(' > ')
}

function getSafeTarget(e) {
  const target = document.elementFromPoint(e.clientX, e.clientY)
  if (!target) return null
  if (target.closest('.review-overlay')) return null
  return target
}

function onMouseMove(e) {
  if (isDraggingToolbar.value) return
  if (mode.value !== 'element' || formVisible.value || isDragging.value) return
  const target = getSafeTarget(e)
  if (!target) {
    hoveredRect.value = null
    return
  }
  const rect = target.getBoundingClientRect()
  hoveredRect.value = {
    x: rect.left + window.scrollX,
    y: rect.top + window.scrollY,
    width: rect.width,
    height: rect.height
  }
  hoveredTag.value = target.tagName.toLowerCase()
}

function onMouseOut() {
  hoveredRect.value = null
}

function onElementClick(e) {
  if (mode.value !== 'element' || formVisible.value || isDragging.value) return
  const target = getSafeTarget(e)
  if (!target) return
  e.preventDefault()
  e.stopPropagation()
  const rect = target.getBoundingClientRect()
  selectedElement.value = {
    el: target,
    selector: getElementSelector(target),
    tag: target.tagName.toLowerCase(),
    text: target.innerText?.slice(0, 40) || '',
    rect: {
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY,
      width: rect.width,
      height: rect.height
    }
  }
  openForm('element')
}

function onMouseDown(e) {
  if (isDraggingToolbar.value) return
  if (mode.value !== 'viewport' || formVisible.value) return
  isDragging.value = true
  dragStart.value = { x: e.clientX + window.scrollX, y: e.clientY + window.scrollY }
  dragRect.value = { x: dragStart.value.x, y: dragStart.value.y, width: 0, height: 0 }
}

function onMouseMoveDrag(e) {
  if (isDraggingToolbar.value) return
  if (!isDragging.value) return
  const x = e.clientX + window.scrollX
  const y = e.clientY + window.scrollY
  dragRect.value = {
    x: Math.min(dragStart.value.x, x),
    y: Math.min(dragStart.value.y, y),
    width: Math.abs(x - dragStart.value.x),
    height: Math.abs(y - dragStart.value.y)
  }
}

function onMouseUp(e) {
  if (isDraggingToolbar.value) {
    isDraggingToolbar.value = false
    return
  }
  if (!isDragging.value) return
  isDragging.value = false
  if (dragRect.value && dragRect.value.width > 10 && dragRect.value.height > 10) {
    openForm('viewport', { ...dragRect.value })
  }
  dragRect.value = null
}

function onToolbarMouseDown(e) {
  const isDragHandle = e.target.classList?.contains('toolbar-title') || e.target.classList?.contains('review-toolbar')
  if (!isDragHandle) return
  isDraggingToolbar.value = true
  toolbarDragStart.value = {
    x: e.clientX - toolbarPos.value.x,
    y: e.clientY - toolbarPos.value.y
  }
}

function onToolbarMouseMove(e) {
  if (!isDraggingToolbar.value) return
  toolbarPos.value = {
    x: e.clientX - toolbarDragStart.value.x,
    y: e.clientY - toolbarDragStart.value.y
  }
}

function onKeyDown(e) {
  if (e.key === 'Escape') {
    if (formVisible.value) formVisible.value = false
    else close()
  }
}

function handleOverlayClick() {}

function openForm(type, viewportRect = null) {
  const env = captureEnv()
  form.value = {
    type,
    title: '',
    severity: 'medium',
    suggestion: '',
    selector: selectedElement.value?.selector || '',
    elementText: selectedElement.value?.text || '',
    elementRect: selectedElement.value?.rect || null,
    viewportRect,
    viewport: env.viewport,
    scroll: env.scroll,
    pagePath: env.pagePath,
    pageUrl: env.pageUrl,
    pageName: env.pageName
  }
  formVisible.value = true
}

function resetForm() {
  selectedElement.value = null
  dragRect.value = null
  form.value = {
    type: 'element',
    title: '',
    severity: 'medium',
    suggestion: '',
    selector: '',
    elementText: '',
    elementRect: null,
    viewportRect: null,
    viewport: { width: 0, height: 0 },
    scroll: { x: 0, y: 0 },
    pagePath: '',
    pageUrl: '',
    pageName: ''
  }
}

function submitReview() {
  if (!canSubmit.value) return
  const record = addReview({
    type: form.value.type,
    title: form.value.title.trim(),
    severity: form.value.severity,
    suggestion: form.value.suggestion.trim(),
    selector: form.value.selector,
    elementText: form.value.elementText,
    elementRect: form.value.elementRect,
    viewportRect: form.value.viewportRect,
    viewport: form.value.viewport,
    scroll: form.value.scroll,
    pagePath: form.value.pagePath,
    pageUrl: form.value.pageUrl,
    pageName: form.value.pageName,
    status: 'open'
  })
  formVisible.value = false
  emit('add', record)
}

function resolve(id) {
  updateReview(id, { status: 'resolved' })
  emit('update', { id, status: 'resolved' })
}

function remove(id) {
  ElMessageBox.confirm('确定删除这条评审意见吗？', '删除确认', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteReview(id)
    emit('delete', { id })
  })
}

function clearPage() {
  if (pageReviews.value.length === 0) return
  ElMessageBox.confirm('确定清空当前页面的所有评审意见吗？', '清空确认', {
    confirmButtonText: '清空',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    clearPageReviews(resolvedPagePath.value)
    emit('clear', { pagePath: resolvedPagePath.value })
  })
}

function close() {
  emit('update:active', false)
}

function bindEvents() {
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseout', onMouseOut)
  document.addEventListener('click', onElementClick, true)
  document.addEventListener('mousedown', onMouseDown)
  document.addEventListener('mousemove', onMouseMoveDrag)
  document.addEventListener('mousemove', onToolbarMouseMove)
  document.addEventListener('mouseup', onMouseUp)
  document.addEventListener('keydown', onKeyDown)
}

function unbindEvents() {
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseout', onMouseOut)
  document.removeEventListener('click', onElementClick, true)
  document.removeEventListener('mousedown', onMouseDown)
  document.removeEventListener('mousemove', onMouseMoveDrag)
  document.removeEventListener('mousemove', onToolbarMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
  document.removeEventListener('keydown', onKeyDown)
}

onMounted(() => {
  if (props.active) bindEvents()
})

onUnmounted(() => {
  unbindEvents()
})

let watcher = null
nextTick(() => {
  watcher = watch(() => props.active, (val) => {
    if (val) {
      bindEvents()
      mode.value = 'element'
    } else {
      unbindEvents()
      resetForm()
      hoveredRect.value = null
      listVisible.value = false
    }
  })
})

onUnmounted(() => {
  if (watcher) watcher()
})

defineExpose({
  reviews,
  pageReviews,
  addReview,
  updateReview,
  deleteReview,
  clearPageReviews,
  exportToJSON,
  exportToMarkdown
})
</script>

<style scoped>
.review-overlay {
  position: fixed;
  inset: 0;
  z-index: 9998;
  pointer-events: none;
}

.review-overlay > *:not(.highlight-box):not(.drag-rect) {
  pointer-events: auto;
}

.review-toolbar {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  user-select: none;
}

.review-toolbar.is-dragging {
  cursor: grabbing;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.toolbar-title {
  font-weight: bold;
  color: #001529;
  cursor: grab;
}

.toolbar-title:active {
  cursor: grabbing;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.highlight-box {
  position: absolute;
  border: 2px solid #409EFF;
  background: rgba(64, 158, 255, 0.15);
  z-index: 9999;
  pointer-events: none;
}

.hover-box {
  border-color: #409EFF;
  background: rgba(64, 158, 255, 0.12);
}

.selected-box {
  border-color: #F56C6C;
  background: rgba(245, 108, 108, 0.12);
}

.highlight-label {
  position: absolute;
  top: -22px;
  left: 0;
  padding: 2px 8px;
  background: #409EFF;
  color: #fff;
  font-size: 12px;
  border-radius: 4px;
  white-space: nowrap;
}

.selected-box .highlight-label {
  background: #F56C6C;
}

.drag-rect {
  position: absolute;
  border: 2px dashed #67C23A;
  background: rgba(103, 194, 58, 0.15);
  z-index: 9999;
  pointer-events: none;
}

.review-target-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.target-desc {
  color: #606266;
  font-size: 13px;
  max-width: 360px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-muted {
  color: #909399;
  font-size: 13px;
}

.review-list-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.review-item {
  border: 1px solid #e4e7ed;
}

.review-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.review-item-title {
  font-weight: bold;
  color: #303133;
}

.review-item-tags {
  display: flex;
  gap: 6px;
}

.review-item-target {
  color: #606266;
  font-size: 12px;
  margin-bottom: 8px;
  word-break: break-all;
}

.review-item-suggestion {
  color: #303133;
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 12px;
}

.review-item-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.review-item-actions {
  display: flex;
  gap: 8px;
}
</style>
