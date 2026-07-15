import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import dayjs from 'dayjs'
import {
  Card,
  Form,
  Row,
  Col,
  Select,
  Input,
  DatePicker,
  Upload,
  Checkbox,
  Button,
  Divider,
  message,
  Alert
} from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import {
  noticeStore,
  NOTICE_TYPES
} from '../data/notices.js'
import { projectStore } from '../data/projects.js'

const EMPTY_NOTICE = {
  type: 'tender',
  projectId: null,
  packages: [],
  title: '',
  changeReason: '',
  publishTime: dayjs(),
  deadline: null,
  content: '',
  channels: ['平台门户', '电子招投标系统']
}

export default function NoticePublish() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const noticeId = searchParams.get('id')
  const projectIdFromQuery = searchParams.get('projectId')

  const projects = useMemo(() => projectStore.getProjects(), [])

  const [form, setForm] = useState(EMPTY_NOTICE)
  const [fileList, setFileList] = useState([])

  useEffect(() => {
    if (!noticeId) {
      const initialProjectId = projectIdFromQuery
        ? Number(projectIdFromQuery)
        : projects[0]?.id || null
      setForm((prev) => ({
        ...EMPTY_NOTICE,
        projectId: initialProjectId,
        title: buildDefaultTitle('tender', initialProjectId)
      }))
      setFileList([])
      return
    }

    const notice = noticeStore.getNoticeById(noticeId)
    if (!notice) {
      message.error('公告不存在')
      navigate('/admin/notice-list')
      return
    }

    setForm({
      type: notice.type || 'tender',
      projectId: notice.projectId || null,
      packages: (notice.packages || []).map((p) => p.id),
      title: notice.title || '',
      changeReason: notice.changeReason || '',
      publishTime: notice.publishTime ? dayjs(notice.publishTime) : dayjs(),
      deadline: notice.deadline && notice.deadline !== '-' ? dayjs(notice.deadline) : null,
      content: notice.content || '',
      channels: notice.channels || ['平台门户', '电子招投标系统']
    })
    setFileList(
      (notice.attachments || []).map((a, idx) => ({
        uid: String(-idx - 1),
        name: a.name,
        size: typeof a.size === 'string' && a.size.includes('MB')
          ? Number(a.size.replace('MB', '')) * 1024 * 1024
          : 2048
      }))
    )
  }, [noticeId, projectIdFromQuery, projects, navigate])

  const selectedProject = useMemo(
    () => projects.find((p) => String(p.id) === String(form.projectId)),
    [projects, form.projectId]
  )

  const packageOptions = useMemo(
    () =>
      (selectedProject?.packages || []).map((pkg) => ({
        label: pkg.name,
        value: pkg.id
      })),
    [selectedProject]
  )

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleProjectChange = (projectId) => {
    setForm((prev) => ({
      ...prev,
      projectId,
      packages: []
    }))
  }

  const handleTypeChange = (type) => {
    setForm((prev) => ({
      ...prev,
      type,
      title: prev.title || buildDefaultTitle(type, prev.projectId)
    }))
  }

  const previewContent = form.content.replace(/\n/g, '<br>')

  const formatTime = (t) => {
    if (!t) return '-'
    return new Date(t).toLocaleString()
  }

  const buildNoticePayload = (status) => {
    const typeMeta = NOTICE_TYPES.find((t) => t.value === form.type) || NOTICE_TYPES[0]
    const selectedPackages = (selectedProject?.packages || []).filter((p) =>
      form.packages.includes(p.id)
    )

    return {
      title: form.title.trim(),
      type: form.type,
      typeName: typeMeta.label,
      tagType: typeMeta.tagType,
      status,
      projectId: form.projectId,
      projectName: selectedProject?.name || '',
      packages: selectedPackages,
      changeReason: form.type === 'change' ? form.changeReason.trim() : '',
      purchaseMode: selectedProject?.purchaseMode || '公开招标',
      publishTime: status === 'published' && form.publishTime
        ? dayjs(form.publishTime).format('YYYY-MM-DD HH:mm:ss')
        : '',
      deadline: form.deadline
        ? dayjs(form.deadline).format('YYYY-MM-DD HH:mm:ss')
        : '-',
      registerStart: status === 'published' && form.publishTime
        ? dayjs(form.publishTime).format('YYYY-MM-DD HH:mm:ss')
        : '',
      registerEnd: form.deadline
        ? dayjs(form.deadline).format('YYYY-MM-DD HH:mm:ss')
        : '',
      content: form.content,
      attachments: noticeStore.buildAttachments(fileList),
      channels: form.channels,
      canRegister: form.type === 'tender' && status === 'published'
    }
  }

  const validate = (isPublish) => {
    const errors = []
    if (!form.title.trim()) errors.push('公告标题')
    if (!form.projectId) errors.push('关联项目')
    if (!form.type) errors.push('公告类型')
    if (isPublish && ['change', 'candidate', 'result'].includes(form.type) && form.packages.length === 0) {
      errors.push('关联标段')
    }
    if (form.type === 'change' && !form.changeReason.trim()) {
      errors.push('变更原因')
    }
    if (isPublish && !form.content.trim()) errors.push('公告正文')
    if (isPublish && !form.publishTime) errors.push('发布时间')
    return errors
  }

  const saveDraft = () => {
    const errors = validate(false)
    if (errors.length) {
      message.warning(`请完善：${errors.join('、')}`)
      return
    }

    const payload = buildNoticePayload('draft')
    if (noticeId) {
      noticeStore.updateNotice(noticeId, payload)
    } else {
      noticeStore.addNotice(payload)
    }
    message.success('公告草稿已保存')
    navigate('/admin/notice-list')
  }

  const publish = () => {
    const errors = validate(true)
    if (errors.length) {
      message.error(`请填写：${errors.join('、')}`)
      return
    }

    const payload = buildNoticePayload('published')
    if (noticeId) {
      noticeStore.updateNotice(noticeId, payload)
    } else {
      noticeStore.addNotice(payload)
    }
    message.success('公告已发布')
    navigate('/admin/notice-list')
  }

  return (
    <div className="notice-publish">
      <Card
        title={<span>{noticeId ? '编辑公告' : '发布公告'}</span>}
        extra={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button onClick={saveDraft}>保存草稿</Button>
            <Button type="primary" onClick={publish}>发布</Button>
          </div>
        }
      >
        <Form layout="horizontal" labelCol={{ flex: '100px' }} className="notice-form">
          <Row gutter={20}>
            <Col span={12}>
              <Form.Item label="公告类型" required>
                <Select
                  placeholder="请选择"
                  style={{ width: '100%' }}
                  value={form.type}
                  onChange={handleTypeChange}
                  options={NOTICE_TYPES.map((t) => ({ label: t.label, value: t.value }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="关联项目" required>
                <Select
                  placeholder="请选择关联项目"
                  style={{ width: '100%' }}
                  value={form.projectId}
                  onChange={handleProjectChange}
                  options={projects.map((p) => ({ label: p.name, value: p.id }))}
                />
              </Form.Item>
            </Col>
          </Row>

          {selectedProject && (
            <Form.Item label="关联标段" required={['change', 'candidate', 'result'].includes(form.type)}>
              <Checkbox.Group
                value={form.packages}
                onChange={(value) => updateField('packages', value)}
                options={packageOptions}
              />
              {packageOptions.length === 0 && (
                <div style={{ color: '#999', marginTop: 4 }}>该项目下暂无标段，请先在项目中配置标段。</div>
              )}
            </Form.Item>
          )}

          {form.type === 'change' && (
            <Form.Item label="变更原因" required>
              <Input.TextArea
                rows={3}
                placeholder="请填写变更原因，将在公告详情页顶部高亮展示"
                value={form.changeReason}
                onChange={(e) => updateField('changeReason', e.target.value)}
              />
            </Form.Item>
          )}

          <Form.Item label="公告标题" required>
            <Input
              placeholder="请输入公告标题"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
            />
          </Form.Item>

          <Row gutter={20}>
            <Col span={12}>
              <Form.Item label="发布时间">
                <DatePicker
                  showTime
                  style={{ width: '100%' }}
                  value={form.publishTime}
                  onChange={(value) => updateField('publishTime', value)}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="截止时间">
                <DatePicker
                  showTime
                  style={{ width: '100%' }}
                  value={form.deadline}
                  onChange={(value) => updateField('deadline', value)}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="公告正文" required>
            <div className="editor-mock">
              <div className="editor-toolbar">
                <Button size="small" type="text">正文</Button>
                <Button size="small" type="text">标题</Button>
                <Button size="small" type="text">加粗</Button>
                <Button size="small" type="text">插入链接</Button>
                <Button size="small" type="text">插入图片</Button>
                <Button size="small" type="text">插入表格</Button>
              </div>
              <Input.TextArea
                rows={16}
                placeholder="在此编辑公告正文..."
                className="notice-editor"
                value={form.content}
                onChange={(e) => updateField('content', e.target.value)}
              />
            </div>
          </Form.Item>

          <Form.Item label="附件">
            <Upload
              fileList={fileList}
              onChange={({ fileList: next }) => setFileList(next)}
              beforeUpload={() => false}
              multiple
            >
              <Button type="primary" icon={<UploadOutlined />}>上传附件</Button>
            </Upload>
          </Form.Item>

          <Form.Item label="发布平台">
            <Checkbox.Group
              value={form.channels}
              onChange={(value) => updateField('channels', value)}
              options={[
                { label: '平台门户', value: '平台门户' },
                { label: '电子招投标系统', value: '电子招投标系统' },
                { label: '短信通知已报名供应商', value: '短信通知已报名供应商' },
                { label: '邮件通知', value: '邮件通知' }
              ]}
            />
          </Form.Item>

          <Form.Item label="公告预览">
            <Card className="preview-card">
              <h2>{form.title || '公告标题'}</h2>
              <div className="preview-meta">
                <span>发布时间：{formatTime(form.publishTime)}</span>
                <span>截止时间：{formatTime(form.deadline)}</span>
              </div>
              {form.type === 'change' && form.changeReason && (
                <Alert
                  type="warning"
                  showIcon
                  message={`变更原因：${form.changeReason}`}
                  style={{ margin: '16px 0' }}
                />
              )}
              {selectedProject && form.packages.length > 0 && (
                <div className="preview-packages">
                  关联标段：
                  {selectedProject.packages
                    .filter((p) => form.packages.includes(p.id))
                    .map((p) => p.name)
                    .join('、')}
                </div>
              )}
              <Divider />
              <div className="preview-content" dangerouslySetInnerHTML={{ __html: previewContent }} />
            </Card>
          </Form.Item>
        </Form>
      </Card>

      <style>{`
        .notice-publish {
          max-width: 1000px;
          margin: 0 auto;
        }
        .notice-form {
          margin-top: 10px;
        }
        .editor-mock {
          border: 1px solid #dcdfe6;
          border-radius: 4px;
          overflow: hidden;
          width: 100%;
        }
        .editor-toolbar {
          display: flex;
          gap: 4px;
          padding: 8px;
          background: #f5f7fa;
          border-bottom: 1px solid #dcdfe6;
        }
        .notice-editor textarea {
          border: none;
          resize: vertical;
        }
        .preview-card {
          background: #fafafa;
          width: 100%;
        }
        .preview-card h2 {
          text-align: center;
          margin-bottom: 12px;
        }
        .preview-meta {
          display: flex;
          justify-content: center;
          gap: 24px;
          color: #666;
          font-size: 14px;
        }
        .preview-packages {
          text-align: center;
          color: #666;
          font-size: 14px;
          margin-top: 8px;
        }
        .preview-content {
          line-height: 1.8;
          color: #333;
        }
      `}</style>
    </div>
  )
}

function buildDefaultTitle(type, projectId) {
  const typeName = NOTICE_TYPES.find((t) => t.value === type)?.label || '公告'
  // projectId 仅用于占位提示，不实际查询名称，避免未挂载时产生副作用
  return `${typeName}（请完善标题）`
}
