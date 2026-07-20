import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import {
  Card,
  Form,
  Row,
  Col,
  Select,
  Input,
  Upload,
  Button,
  Divider,
  message,
  Alert,
  Descriptions,
  Tag,
  Empty,
  List
} from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import {
  noticeStore,
  NOTICE_TYPES
} from '../data/notices.js'
import { projectStore } from '../data/projects.js'
import { mergeWithBaseline } from './ProjectList.jsx'

const EMPTY_NOTICE = {
  type: 'tender',
  projectId: null,
  title: ''
}

export default function NoticePublish() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false })
  const noticeId = searchParams.id

  // 与项目列表同一口径：projectStore + mock 基线合并
  const projects = useMemo(() => mergeWithBaseline(projectStore.getProjects()), [])

  const [form, setForm] = useState(EMPTY_NOTICE)
  const [fileList, setFileList] = useState([])

  useEffect(() => {
    if (!noticeId) {
      setForm(EMPTY_NOTICE)
      setFileList([])
      return
    }
    const notice = noticeStore.getNoticeById(noticeId)
    if (!notice) {
      message.error('公告不存在')
      navigate({ to: '/admin/notice-list' })
      return
    }
    setForm({
      type: notice.type || 'tender',
      projectId: notice.projectId != null ? String(notice.projectId) : null,
      title: notice.title || ''
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
  }, [noticeId, projects, navigate])

  const selectedProject = useMemo(
    () => projects.find((p) => String(p.id) === String(form.projectId)),
    [projects, form.projectId]
  )

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleProjectChange = (projectId) => {
    setForm((prev) => ({ ...prev, projectId }))
  }

  const handleTypeChange = (type) => {
    setForm((prev) => ({ ...prev, type }))
  }

  const saveDraft = () => {
    message.success('演示环境 · 草稿已保存')
  }

  const publish = () => {
    message.success('演示环境 · 公告已发布')
    navigate({ to: '/admin/notice-list' })
  }

  const typeName = NOTICE_TYPES.find((t) => t.value === form.type)?.label || '公告'

  return (
    <div className="notice-publish">
      <Card
        title={<span>{noticeId ? '编辑公告' : '发布公告'}</span>}
        extra={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button onClick={() => navigate({ to: '/admin/notice-list' })}>返回公告列表</Button>
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
                  options={projects.map((p) => ({ label: p.name, value: String(p.id) }))}
                  notFoundContent={
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="暂无可关联项目，请先在项目列表创建项目"
                    />
                  }
                />
                {projects.length === 0 && (
                  <Alert
                    type="warning"
                    showIcon
                    style={{ marginTop: 8 }}
                    title="当前没有可关联的项目，请先在「项目管理」中创建项目后再发布公告。"
                  />
                )}
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="公告标题" required>
            <Input
              placeholder="请输入公告标题"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
            />
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

          <Form.Item label="公告预览">
            <Card className="preview-card">
              <h2>{form.title || '公告标题'}</h2>
              <div className="preview-meta">
                <span>公告类型：{typeName}</span>
                <span>关联项目：{selectedProject?.name || '（未选择）'}</span>
              </div>
              <Divider />
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="附件数量">{fileList.length} 个</Descriptions.Item>
              </Descriptions>
              {fileList.length > 0 && (
                <List
                  size="small"
                  dataSource={fileList}
                  renderItem={(item) => <List.Item>{item.name}</List.Item>}
                />
              )}
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
      `}</style>
    </div>
  )
}
