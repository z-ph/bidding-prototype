import { useState, useCallback, useMemo } from 'react'

export function usePageReview(options = {}) {
  const {
    storageKey = 'page-reviews',
    defaultPagePath = () => typeof window !== 'undefined'
      ? window.location.pathname + window.location.search
      : '/'
  } = options

  function generateId() {
    return 'rv-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8)
  }

  function loadFromStorage() {
    if (typeof window === 'undefined') return []
    try {
      const raw = window.localStorage.getItem(storageKey)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  function saveToStorage(list) {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(list))
    } catch {}
  }

  const [reviews, setReviews] = useState(loadFromStorage)

  const allReviews = useMemo(() => reviews, [reviews])

  const getPageReviews = useCallback((pagePath) => {
    const path = pagePath || defaultPagePath()
    return reviews.filter(r => r.pagePath === path)
  }, [reviews, defaultPagePath])

  const addReview = useCallback((payload) => {
    const record = {
      id: generateId(),
      ...payload,
      createdAt: new Date().toISOString()
    }
    setReviews(prev => {
      const next = [record, ...prev]
      saveToStorage(next)
      return next
    })
    return record
  }, [])

  const updateReview = useCallback((id, updates) => {
    setReviews(prev => {
      const next = prev.map(r => r.id === id ? { ...r, ...updates } : r)
      saveToStorage(next)
      return next
    })
  }, [])

  const deleteReview = useCallback((id) => {
    setReviews(prev => {
      const next = prev.filter(r => r.id !== id)
      saveToStorage(next)
      return next
    })
  }, [])

  const clearPageReviews = useCallback((pagePath) => {
    const path = pagePath || defaultPagePath()
    setReviews(prev => {
      const next = prev.filter(r => r.pagePath !== path)
      saveToStorage(next)
      return next
    })
  }, [defaultPagePath])

  const clearAllReviews = useCallback(() => {
    setReviews([])
    saveToStorage([])
  }, [])

  const exportToJSON = useCallback(() => {
    const data = {
      exportTime: new Date().toISOString(),
      total: reviews.length,
      reviews: reviews
    }
    downloadBlob(
      new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
      `page-reviews-${formatDate()}.json`
    )
  }, [reviews])

  const exportToMarkdown = useCallback(() => {
    const lines = [
      '# 页面评审报告',
      '',
      `导出时间：${new Date().toLocaleString()}`,
      `评审总数：${reviews.length}`,
      ''
    ]

    const grouped = groupBy(reviews, 'pagePath')
    Object.entries(grouped).forEach(([path, list]) => {
      lines.push(`## 页面：${path}`)
      lines.push('')
      list.forEach((item, idx) => {
        lines.push(`### ${idx + 1}. ${item.title || '未命名评审'}`)
        lines.push(`- **类型**：${item.type === 'element' ? '元素评审' : '视图范围评审'}`)
        lines.push(`- **严重等级**：${severityText(item.severity)}`)
        lines.push(`- **状态**：${item.status === 'resolved' ? '已解决' : '待处理'}`)
        lines.push(`- **窗口尺寸**：${item.viewport?.width} × ${item.viewport?.height}`)
        if (item.scroll) {
          lines.push(`- **滚动位置**：x=${item.scroll.x}, y=${item.scroll.y}`)
        }
        if (item.type === 'element' && item.elementRect) {
          lines.push(`- **元素选择器**：\`${item.selector}\``)
          lines.push(`- **元素位置**：x=${item.elementRect.x}, y=${item.elementRect.y}, width=${item.elementRect.width}, height=${item.elementRect.height}`)
          if (item.elementText) lines.push(`- **元素文本**：${item.elementText}`)
        } else if (item.viewportRect) {
          lines.push(`- **框选范围**：x=${item.viewportRect.x}, y=${item.viewportRect.y}, width=${item.viewportRect.width}, height=${item.viewportRect.height}`)
        }
        lines.push(`- **评审建议**：${item.suggestion}`)
        lines.push(`- **创建时间**：${new Date(item.createdAt).toLocaleString()}`)
        lines.push('')
      })
    })

    downloadBlob(
      new Blob([lines.join('\n')], { type: 'text/markdown' }),
      `page-reviews-${formatDate()}.md`
    )
  }, [reviews])

  return {
    reviews,
    allReviews,
    getPageReviews,
    addReview,
    updateReview,
    deleteReview,
    clearPageReviews,
    clearAllReviews,
    exportToJSON,
    exportToMarkdown
  }
}

function downloadBlob(blob, filename) {
  if (typeof window === 'undefined') return
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function formatDate() {
  const now = new Date()
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`
}

function pad(n) {
  return String(n).padStart(2, '0')
}

function severityText(s) {
  const map = { low: '低', medium: '中', high: '高', critical: '严重' }
  return map[s] || s
}

function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key] || 'unknown'
    if (!acc[k]) acc[k] = []
    acc[k].push(item)
    return acc
  }, {})
}
