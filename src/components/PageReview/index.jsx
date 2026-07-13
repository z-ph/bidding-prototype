import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Modal, Form, Input, Select, Button, Radio, List, Tag, Space, Popconfirm, Empty, message } from 'antd'
import {
  usePageReview,
  getNodeInfo,
  captureElement,
  captureBox,
  generateScreenshotFilename
} from 'react-page-review'
import './PageReview.css'

const SEVERITY_OPTIONS = [
  { value: 'low', label: '低', color: 'blue' },
  { value: 'medium', label: '中', color: 'orange' },
  { value: 'high', label: '高', color: 'red' },
  { value: 'critical', label: '严重', color: 'magenta' }
]

function severityColor(s) {
  return SEVERITY_OPTIONS.find(o => o.value === s)?.color || 'default'
}

function severityLabel(s) {
  return SEVERITY_OPTIONS.find(o => o.value === s)?.label || s
}

function pageContext() {
  return {
    pagePath: window.location.pathname + window.location.search,
    pageUrl: window.location.href,
    viewport: { width: window.innerWidth, height: window.innerHeight },
    scroll: { x: window.scrollX, y: window.scrollY }
  }
}

let targetSeq = 0

export default function PageReview({ active = false, onActiveChange }) {
  const {
    addReview,
    updateReview,
    deleteReview,
    getPageReviews,
    exportToJSON,
    exportToMarkdown,
    exportToZIP
  } = usePageReview()

  const [mode, setMode] = useState('element')
  const [hoverRect, setHoverRect] = useState(null)
  const [dragRect, setDragRect] = useState(null)
  const [targets, setTargets] = useState([])
  const [formOpen, setFormOpen] = useState(false)
  const [listOpen, setListOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [scrollTick, setScrollTick] = useState(0)
  const [form] = Form.useForm()
  const dragStartRef = useRef(null)
  const [, forceUpdate] = useState(0)

  const pageReviews = getPageReviews()

  const clearTargets = useCallback(() => {
    setTargets([])
    setHoverRect(null)
    setDragRect(null)
  }, [])

  const close = useCallback(() => {
    clearTargets()
    setFormOpen(false)
    setListOpen(false)
    onActiveChange?.(false)
  }, [onActiveChange, clearTargets])

  // ESC 退出（表单/列表弹窗打开时交给 antd Modal 自己处理）
  useEffect(() => {
    if (!active) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !formOpen && !listOpen) close()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [active, formOpen, listOpen, close])

  // 滚动/缩放时重算高亮位置
  useEffect(() => {
    if (!active) return
    const onScroll = () => setScrollTick(n => n + 1)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onScroll)
    }
  }, [active])

  const inReviewUi = (el) => !!el?.closest?.('.page-review-ui')

  // 元素选择模式：hover 高亮 + 点击选中（不弹表单），Cmd/Ctrl+点击多选
  useEffect(() => {
    if (!active || mode !== 'element' || formOpen || listOpen) return
    const onMove = (e) => {
      if (inReviewUi(e.target)) {
        setHoverRect(null)
        return
      }
      const r = e.target.getBoundingClientRect()
      setHoverRect({ left: r.left, top: r.top, width: r.width, height: r.height })
    }
    const onClick = (e) => {
      if (inReviewUi(e.target)) return
      e.preventDefault()
      e.stopPropagation()
      const info = getNodeInfo(e.target)
      if (!info) return
      setHoverRect(null)
      const item = {
        id: ++targetSeq,
        kind: 'element',
        el: e.target,
        info,
        text: (e.target.textContent || '').trim().slice(0, 200)
      }
      if (e.metaKey || e.ctrlKey) {
        setTargets(prev => {
          const exists = prev.find(t => t.kind === 'element' && t.el === e.target)
          return exists ? prev.filter(t => t !== exists) : [...prev, item]
        })
      } else {
        setTargets(prev => {
          const kept = prev.filter(t => t.kind !== 'element')
          return [...kept, item]
        })
      }
    }
    document.addEventListener('mousemove', onMove, true)
    document.addEventListener('click', onClick, true)
    return () => {
      document.removeEventListener('mousemove', onMove, true)
      document.removeEventListener('click', onClick, true)
    }
  }, [active, mode, formOpen, listOpen])

  // 框定视图模式：overlay 上拖拽，松手后选区加入目标集合（不弹表单）
  const onOverlayMouseDown = (e) => {
    if (mode !== 'viewport' || formOpen || listOpen) return
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    setDragRect({ left: e.clientX, top: e.clientY, width: 0, height: 0 })
  }
  const onOverlayMouseMove = (e) => {
    if (!dragStartRef.current) return
    const { x, y } = dragStartRef.current
    setDragRect({
      left: Math.min(x, e.clientX),
      top: Math.min(y, e.clientY),
      width: Math.abs(e.clientX - x),
      height: Math.abs(e.clientY - y)
    })
  }
  const onOverlayMouseUp = (e) => {
    if (!dragStartRef.current) return
    const { x, y } = dragStartRef.current
    dragStartRef.current = null
    setDragRect(null)
    const rect = {
      left: Math.min(x, e.clientX),
      top: Math.min(y, e.clientY),
      width: Math.abs(e.clientX - x),
      height: Math.abs(e.clientY - y)
    }
    if (rect.width < 8 || rect.height < 8) return
    setTargets(prev => [...prev, {
      id: ++targetSeq,
      kind: 'viewport',
      pageRect: {
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height
      }
    }])
  }

  const targetViewRect = (t) => {
    void scrollTick
    if (t.kind === 'element') {
      if (!t.el.isConnected) return null
      const r = t.el.getBoundingClientRect()
      return { left: r.left, top: r.top, width: r.width, height: r.height }
    }
    return {
      left: t.pageRect.x - window.scrollX,
      top: t.pageRect.y - window.scrollY,
      width: t.pageRect.width,
      height: t.pageRect.height
    }
  }

  const submitReview = async () => {
    const values = await form.validateFields()
    if (targets.length === 0) return
    setSubmitting(true)
    try {
      const screenshots = []
      const payloadTargets = []
      for (const t of targets) {
        let dataUrl = null
        if (t.kind === 'element') {
          dataUrl = await captureElement(t.el)
          payloadTargets.push({
            type: 'element',
            selector: t.info.selector,
            elementText: t.text,
            elementRect: t.info.rect,
            aria: t.info.aria,
            locators: {
              cssSelector: t.info.selector,
              xpath: t.info.xpath,
              aria: t.info.aria,
              testId: t.info.testId
            }
          })
        } else {
          dataUrl = await captureBox(t.pageRect)
          payloadTargets.push({ type: 'viewport', viewportRect: t.pageRect })
        }
        if (dataUrl) {
          screenshots.push({
            type: t.kind,
            filename: generateScreenshotFilename(t.kind),
            data: dataUrl
          })
        }
      }
      addReview({
        type: payloadTargets.every(t => t.type === 'viewport') ? 'viewport' : 'element',
        title: values.title.trim(),
        severity: values.severity,
        suggestion: values.suggestion.trim(),
        targets: payloadTargets,
        status: 'open',
        screenshots,
        ...pageContext()
      })
      message.success('评审已提交')
      setFormOpen(false)
      clearTargets()
      form.resetFields()
    } catch (err) {
      console.error('submit review failed:', err)
      message.error('评审提交失败')
    } finally {
      setSubmitting(false)
    }
  }

  if (!active) return null

  return createPortal(
    <>
      <div
        className={`page-review-overlay page-review-ui${mode === 'viewport' && !formOpen && !listOpen ? ' is-drawable' : ''}`}
        onMouseDown={onOverlayMouseDown}
        onMouseMove={onOverlayMouseMove}
        onMouseUp={onOverlayMouseUp}
      />
      {hoverRect && (
        <div className="page-review-highlight page-review-ui" style={hoverRect} />
      )}
      {dragRect && (
        <div className="page-review-drag-rect page-review-ui" style={dragRect} />
      )}
      {targets.map(t => {
        const rect = targetViewRect(t)
        return rect ? (
          <div
            key={t.id}
            className={`page-review-selected page-review-ui${t.kind === 'viewport' ? ' is-box' : ''}`}
            style={rect}
          />
        ) : null
      })}
      <div className="page-review-toolbar page-review-ui">
        <span className="page-review-toolbar-title">页面评审</span>
        <Radio.Group
          value={mode}
          onChange={e => setMode(e.target.value)}
          optionType="button"
          size="small"
          options={[
            { value: 'element', label: '选择元素' },
            { value: 'viewport', label: '框定视图' }
          ]}
        />
        <span className="page-review-count">已选 {targets.length} 个目标</span>
        <Button
          size="small"
          type="primary"
          disabled={targets.length === 0}
          onClick={() => setFormOpen(true)}
        >
          提交评审
        </Button>
        <Button size="small" disabled={targets.length === 0} onClick={clearTargets}>
          取消选择
        </Button>
        <Button size="small" onClick={() => setListOpen(true)}>
          评审列表（{pageReviews.length}）
        </Button>
        <Button size="small" danger onClick={close}>退出评审</Button>
      </div>

      <Modal
        title={`提交评审（${targets.length} 个目标）`}
        open={formOpen}
        confirmLoading={submitting}
        okText="提交评审"
        onOk={submitReview}
        onCancel={() => setFormOpen(false)}
        destroyOnHidden
        rootClassName="page-review-ui"
      >
        <Form form={form} layout="vertical" initialValues={{ severity: 'medium' }}>
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="简要描述问题" maxLength={100} />
          </Form.Item>
          <Form.Item name="severity" label="严重等级">
            <Select options={SEVERITY_OPTIONS.map(o => ({ value: o.value, label: o.label }))} />
          </Form.Item>
          <Form.Item name="suggestion" label="评审建议" rules={[{ required: true, message: '请输入评审建议' }]}>
            <Input.TextArea rows={4} placeholder="详细说明问题与修改建议" maxLength={1000} />
          </Form.Item>
          <div className="page-review-target-info">
            {targets.map(t => (
              <div key={t.id}>
                {t.kind === 'element'
                  ? <>元素：<code>{t.info.selector}</code></>
                  : <>框选区域：{Math.round(t.pageRect.width)}×{Math.round(t.pageRect.height)}</>}
              </div>
            ))}
          </div>
        </Form>
      </Modal>

      <Modal
        title={`评审列表（本页 ${pageReviews.length} 条）`}
        open={listOpen}
        footer={
          <Space>
            <Button onClick={exportToJSON}>导出 JSON</Button>
            <Button onClick={exportToMarkdown}>导出 Markdown</Button>
            <Button type="primary" onClick={exportToZIP}>导出 ZIP</Button>
          </Space>
        }
        onCancel={() => setListOpen(false)}
        width={640}
        rootClassName="page-review-ui"
      >
        {pageReviews.length === 0 ? (
          <Empty description="本页暂无评审记录" />
        ) : (
          <List
            dataSource={pageReviews}
            renderItem={item => (
              <List.Item
                actions={[
                  item.status !== 'resolved' && (
                    <Button key="resolve" size="small" type="link"
                      onClick={() => { updateReview(item.id, { status: 'resolved' }); forceUpdate(n => n + 1) }}>
                      标记已解决
                    </Button>
                  ),
                  <Popconfirm key="del" title="确定删除这条评审吗？"
                    onConfirm={() => { deleteReview(item.id); forceUpdate(n => n + 1) }}>
                    <Button size="small" type="link" danger>删除</Button>
                  </Popconfirm>
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <span>{item.title}</span>
                      <Tag color={severityColor(item.severity)}>{severityLabel(item.severity)}</Tag>
                      <Tag color={item.status === 'resolved' ? 'green' : 'gold'}>
                        {item.status === 'resolved' ? '已解决' : '待处理'}
                      </Tag>
                    </Space>
                  }
                  description={
                    <>
                      <div>{item.suggestion}</div>
                      <div className="page-review-item-meta">
                        {item.targets?.length > 1
                          ? `${item.targets.length} 个目标`
                          : item.targets?.[0]?.type === 'element'
                            ? <code>{item.targets[0].selector}</code>
                            : `框选 ${Math.round(item.targets?.[0]?.viewportRect?.width || 0)}×${Math.round(item.targets?.[0]?.viewportRect?.height || 0)}`}
                        {' · '}{new Date(item.createdAt).toLocaleString()}
                      </div>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Modal>
    </>,
    document.body
  )
}
