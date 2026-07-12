import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { usePageReview } from './useReview.js'

export default function ReviewTool({
  active = false,
  pagePath = '',
  pageName = '',
  storageKey = 'page-reviews',
  onActiveChange,
  onAdd,
  onUpdate,
  onDelete,
  onClear,
  onExport
}) {
  const resolvedPagePath = useMemo(() => {
    return pagePath || (typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/')
  }, [pagePath])

  const {
    reviews,
    getPageReviews,
    addReview,
    updateReview,
    deleteReview,
    clearPageReviews,
    exportToJSON,
    exportToMarkdown
  } = usePageReview({ storageKey, defaultPagePath: () => resolvedPagePath })

  const pageReviews = useMemo(() => getPageReviews(resolvedPagePath), [getPageReviews, resolvedPagePath, reviews])

  const [mode, setMode] = useState('element')
  const [formVisible, setFormVisible] = useState(false)
  const [listVisible, setListVisible] = useState(false)

  const [hoveredRect, setHoveredRect] = useState(null)
  const [hoveredTag, setHoveredTag] = useState('')
  const [selectedElement, setSelectedElement] = useState(null)

  const [dragRect, setDragRect] = useState(null)
  const isDragging = useRef(false)
  const dragStartRef = useRef({ x: 0, y: 0 })

  const [toolbarPos, setToolbarPos] = useState({ x: 0, y: 0 })
  const isDraggingToolbar = useRef(false)
  const toolbarDragStartRef = useRef({ x: 0, y: 0 })

  const [form, setForm] = useState({
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

  const canSubmit = form.title.trim() && form.suggestion.trim()

  const close = useCallback(() => {
    onActiveChange?.(false)
  }, [onActiveChange])

  const captureEnv = useCallback(() => ({
    viewport: { width: window.innerWidth, height: window.innerHeight },
    scroll: { x: window.scrollX, y: window.scrollY },
    pagePath: resolvedPagePath,
    pageUrl: window.location.href,
    pageName: pageName || resolvedPagePath
  }), [resolvedPagePath, pageName])

  const getElementSelector = useCallback((el) => {
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
  }, [])

  const getSafeTarget = useCallback((e) => {
    const target = document.elementFromPoint(e.clientX, e.clientY)
    if (!target) return null
    if (target.closest('.review-overlay')) return null
    return target
  }, [])

  const openForm = useCallback((type, viewportRect = null) => {
    const env = captureEnv()
    setForm({
      type,
      title: '',
      severity: 'medium',
      suggestion: '',
      selector: selectedElement?.selector || '',
      elementText: selectedElement?.text || '',
      elementRect: selectedElement?.rect || null,
      viewportRect,
      viewport: env.viewport,
      scroll: env.scroll,
      pagePath: env.pagePath,
      pageUrl: env.pageUrl,
      pageName: env.pageName
    })
    setFormVisible(true)
  }, [captureEnv, selectedElement])

  const resetForm = useCallback(() => {
    setSelectedElement(null)
    setDragRect(null)
    setForm({
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
  }, [])

  const submitReview = useCallback(() => {
    if (!canSubmit) return
    const record = addReview({
      type: form.type,
      title: form.title.trim(),
      severity: form.severity,
      suggestion: form.suggestion.trim(),
      selector: form.selector,
      elementText: form.elementText,
      elementRect: form.elementRect,
      viewportRect: form.viewportRect,
      viewport: form.viewport,
      scroll: form.scroll,
      pagePath: form.pagePath,
      pageUrl: form.pageUrl,
      pageName: form.pageName,
      status: 'open'
    })
    setFormVisible(false)
    onAdd?.(record)
  }, [canSubmit, form, addReview, onAdd])

  const resolve = useCallback((id) => {
    updateReview(id, { status: 'resolved' })
    onUpdate?.({ id, status: 'resolved' })
  }, [updateReview, onUpdate])

  const remove = useCallback((id) => {
    if (typeof window !== 'undefined' && !window.confirm('确定删除这条评审意见吗？')) return
    deleteReview(id)
    onDelete?.({ id })
  }, [deleteReview, onDelete])

  const clearPage = useCallback(() => {
    if (pageReviews.length === 0) return
    if (typeof window !== 'undefined' && !window.confirm('确定清空当前页面的所有评审意见吗？')) return
    clearPageReviews(resolvedPagePath)
    onClear?.({ pagePath: resolvedPagePath })
  }, [pageReviews.length, clearPageReviews, resolvedPagePath, onClear])

  const handleExportJSON = useCallback(() => {
    exportToJSON()
    onExport?.({ format: 'json' })
  }, [exportToJSON, onExport])

  const handleExportMarkdown = useCallback(() => {
    exportToMarkdown()
    onExport?.({ format: 'markdown' })
  }, [exportToMarkdown, onExport])

  const onMouseMove = useCallback((e) => {
    if (isDraggingToolbar.current) return
    if (mode !== 'element' || formVisible || isDragging.current) return
    const target = getSafeTarget(e)
    if (!target) {
      setHoveredRect(null)
      return
    }
    const rect = target.getBoundingClientRect()
    setHoveredRect({
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY,
      width: rect.width,
      height: rect.height
    })
    setHoveredTag(target.tagName.toLowerCase())
  }, [mode, formVisible, getSafeTarget])

  const onMouseOut = useCallback(() => {
    setHoveredRect(null)
  }, [])

  const onElementClick = useCallback((e) => {
    if (mode !== 'element' || formVisible || isDragging.current) return
    const target = getSafeTarget(e)
    if (!target) return
    e.preventDefault()
    e.stopPropagation()
    const rect = target.getBoundingClientRect()
    setSelectedElement({
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
    })
    openForm('element')
  }, [mode, formVisible, getSafeTarget, getElementSelector, openForm])

  const onMouseDown = useCallback((e) => {
    if (isDraggingToolbar.current) return
    if (mode !== 'viewport' || formVisible) return
    isDragging.current = true
    dragStartRef.current = { x: e.clientX + window.scrollX, y: e.clientY + window.scrollY }
    setDragRect({ x: dragStartRef.current.x, y: dragStartRef.current.y, width: 0, height: 0 })
  }, [mode, formVisible])

  const onMouseMoveDrag = useCallback((e) => {
    if (isDraggingToolbar.current) return
    if (!isDragging.current) return
    const x = e.clientX + window.scrollX
    const y = e.clientY + window.scrollY
    setDragRect({
      x: Math.min(dragStartRef.current.x, x),
      y: Math.min(dragStartRef.current.y, y),
      width: Math.abs(x - dragStartRef.current.x),
      height: Math.abs(y - dragStartRef.current.y)
    })
  }, [])

  const onMouseUp = useCallback((e) => {
    if (isDraggingToolbar.current) {
      isDraggingToolbar.current = false
      return
    }
    if (!isDragging.current) return
    isDragging.current = false
    setDragRect(prev => {
      if (prev && prev.width > 10 && prev.height > 10) {
        openForm('viewport', { ...prev })
      }
      return null
    })
  }, [openForm])

  const onToolbarMouseDown = useCallback((e) => {
    const isDragHandle = e.target.classList?.contains('toolbar-title') || e.target.classList?.contains('review-toolbar')
    if (!isDragHandle) return
    isDraggingToolbar.current = true
    toolbarDragStartRef.current = {
      x: e.clientX - toolbarPos.x,
      y: e.clientY - toolbarPos.y
    }
  }, [toolbarPos])

  const onToolbarMouseMove = useCallback((e) => {
    if (!isDraggingToolbar.current) return
    setToolbarPos({
      x: e.clientX - toolbarDragStartRef.current.x,
      y: e.clientY - toolbarDragStartRef.current.y
    })
  }, [])

  const onKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      if (formVisible) setFormVisible(false)
      else close()
    }
  }, [formVisible, close])

  useEffect(() => {
    if (!active) return
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseout', onMouseOut)
    document.addEventListener('click', onElementClick, true)
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('mousemove', onMouseMoveDrag)
    document.addEventListener('mousemove', onToolbarMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseout', onMouseOut)
      document.removeEventListener('click', onElementClick, true)
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mousemove', onMouseMoveDrag)
      document.removeEventListener('mousemove', onToolbarMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [active, onMouseMove, onMouseOut, onElementClick, onMouseDown, onMouseMoveDrag, onToolbarMouseMove, onMouseUp, onKeyDown])

  useEffect(() => {
    if (active) {
      setMode('element')
    } else {
      resetForm()
      setHoveredRect(null)
      setListVisible(false)
    }
  }, [active, resetForm])

  if (!active) return null

  const toolbarStyle = {
    transform: `translate(calc(-50% + ${toolbarPos.x}px), ${toolbarPos.y}px)`
  }

  return createPortal(
    <div className="review-overlay" onClick={(e) => e.stopPropagation()}>
      <div
        className={`review-toolbar ${isDraggingToolbar.current ? 'is-dragging' : ''}`}
        style={toolbarStyle}
        onMouseDown={onToolbarMouseDown}
      >
        <div className="toolbar-left">
          <span className="toolbar-title" title="按住此处可拖动">页面评审模式</span>
          <div className="radio-group">
            <button className={mode === 'element' ? 'active' : ''} onClick={() => setMode('element')}>选择元素</button>
            <button className={mode === 'viewport' ? 'active' : ''} onClick={() => setMode('viewport')}>框定视图</button>
          </div>
        </div>
        <div className="toolbar-right">
          <button className="badge-btn" onClick={() => setListVisible(true)}>
            评审列表 <span className="badge">{pageReviews.length}</span>
          </button>
          <div className="dropdown">
            <button className="primary" onClick={handleExportMarkdown}>导出</button>
            <div className="dropdown-menu">
              <div onClick={handleExportMarkdown}>导出为 Markdown</div>
              <div onClick={handleExportJSON}>导出为 JSON</div>
            </div>
          </div>
          <button className="danger" onClick={close}>退出评审</button>
        </div>
      </div>

      {hoveredRect && mode === 'element' && !formVisible && (
        <div className="highlight-box hover-box" style={highlightStyle(hoveredRect)}>
          <span className="highlight-label">{hoveredTag}</span>
        </div>
      )}

      {selectedElement && mode === 'element' && !formVisible && (
        <div className="highlight-box selected-box" style={highlightStyle(selectedElement.rect)}>
          <span className="highlight-label">已选：{selectedElement.tag}</span>
        </div>
      )}

      {dragRect && (
        <div className="drag-rect" style={dragRectStyle(dragRect)} />
      )}

      {formVisible && (
        <div className="modal-backdrop" onClick={() => setFormVisible(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">添加评审意见</div>
            <div className="modal-body">
              <div className="form-row">
                <label>评审位置</label>
                <div className="review-target-info">
                  <span className="tag">{form.type === 'element' ? '元素' : '视图范围'}</span>
                  <span className="target-desc">
                    {form.type === 'element'
                      ? (form.elementText || form.selector)
                      : `框选区域 x=${form.viewportRect?.x}, y=${form.viewportRect?.y}, w=${form.viewportRect?.width}, h=${form.viewportRect?.height}`}
                  </span>
                </div>
              </div>
              <div className="form-row">
                <label>窗口尺寸</label>
                <span className="text-muted">{form.viewport?.width} × {form.viewport?.height}</span>
              </div>
              <div className="form-row">
                <label>滚动位置</label>
                <span className="text-muted">x={form.scroll?.x}, y={form.scroll?.y}</span>
              </div>
              <div className="form-row">
                <label>标题 <span className="required">*</span></label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="例如：按钮样式不统一"
                />
              </div>
              <div className="form-row">
                <label>严重等级 <span className="required">*</span></label>
                <div className="radio-group">
                  {['low', 'medium', 'high', 'critical'].map(s => (
                    <label key={s} className="radio-label">
                      <input
                        type="radio"
                        name="severity"
                        value={s}
                        checked={form.severity === s}
                        onChange={() => setForm({ ...form, severity: s })}
                      />
                      {severityText(s)}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-row">
                <label>评审建议 <span className="required">*</span></label>
                <textarea
                  rows={4}
                  value={form.suggestion}
                  onChange={(e) => setForm({ ...form, suggestion: e.target.value })}
                  placeholder="描述问题现象、影响和改进建议"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setFormVisible(false)}>取消</button>
              <button className="primary" disabled={!canSubmit} onClick={submitReview}>保存评审</button>
            </div>
          </div>
        </div>
      )}

      {listVisible && (
        <>
          <div className="drawer-backdrop" onClick={() => setListVisible(false)} />
          <div className="drawer">
            <div className="drawer-header">
              <span>当前页面评审意见</span>
              <button className="close" onClick={() => setListVisible(false)}>×</button>
            </div>
            <div className="drawer-body">
              <div className="review-list-actions">
                <button className="primary" onClick={handleExportMarkdown}>导出 Markdown</button>
                <button onClick={handleExportJSON}>导出 JSON</button>
                <button className="danger-text" onClick={clearPage}>清空本页</button>
              </div>
              {pageReviews.length === 0 ? (
                <div className="empty">暂无评审意见</div>
              ) : (
                <div className="review-list">
                  {pageReviews.map(item => (
                    <div key={item.id} className="review-item">
                      <div className="review-item-header">
                        <span className="review-item-title">{item.title}</span>
                        <div className="review-item-tags">
                          <span className={`tag ${severityType(item.severity)}`}>{severityText(item.severity)}</span>
                          <span className="tag info">{item.type === 'element' ? '元素' : '视图'}</span>
                        </div>
                      </div>
                      <p className="review-item-target">
                        {item.type === 'element' ? (item.elementText || item.selector) : `框选 x=${item.viewportRect.x}, y=${item.viewportRect.y}`}
                      </p>
                      <p className="review-item-suggestion">{item.suggestion}</p>
                      <div className="review-item-meta">
                        <span className="text-muted">{new Date(item.createdAt).toLocaleString()}</span>
                        <div className="review-item-actions">
                          {item.status !== 'resolved' && <button className="link primary" onClick={() => resolve(item.id)}>标记解决</button>}
                          <button className="link danger" onClick={() => remove(item.id)}>删除</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>,
    document.body
  )
}

function highlightStyle(rect) {
  if (!rect) return {}
  return {
    left: rect.x + 'px',
    top: rect.y + 'px',
    width: rect.width + 'px',
    height: rect.height + 'px'
  }
}

function dragRectStyle(rect) {
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
