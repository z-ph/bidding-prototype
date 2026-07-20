import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
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
  Alert,
  Descriptions,
  Tag,
  Empty
} from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import {
  noticeStore,
  NOTICE_TYPES
} from '../data/notices.js'
import { projectStore } from '../data/projects.js'
import { mergeWithBaseline } from './ProjectList.jsx'
import ProjectEntryGuard from '../components/ProjectEntryGuard.jsx'

const EMPTY_NOTICE = {
  type: 'tender',
  projectId: null,
  packages: [],
  title: '',
  changeReason: '',
  publishTime: dayjs(),
  deadline: null,
  projectCode: '',
  purchaseMode: '公开招标',
  bidOpenTime: null,
  bidOpenLocation: '',
  evaluationMethod: '',
  bidSummaryFields: [],
  contactName: '',
  contactPhone: '',
  content: '',
  channels: ['平台门户', '电子招投标系统']
}

export default function NoticePublish() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false })
  const noticeId = searchParams.id
  const projectIdFromQuery = searchParams.projectId

  // 公告发布属于项目阶段操作，必须从项目上下文进入（守卫见主 return 前，需在全部 hooks 之后）

  // 与项目列表同一口径：projectStore（新建/草稿）+ mock 基线合并
  const projects = useMemo(() => mergeWithBaseline(projectStore.getProjects()), [])

  const [form, setForm] = useState(EMPTY_NOTICE)
  const [fileList, setFileList] = useState([])

  useEffect(() => {
    if (!noticeId) {
      const initialProjectId = String(projectIdFromQuery)
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
      navigate({ to: '/admin/notice-list' })
      return
    }

    setForm({
      type: notice.type || 'tender',
      projectId: notice.projectId != null ? String(notice.projectId) : null,
      packages: (notice.packages || []).map((p) => p.id ?? p.code ?? p.name),
      title: notice.title || '',
      changeReason: notice.changeReason || '',
      publishTime: notice.publishTime ? dayjs(notice.publishTime) : dayjs(),
      deadline: notice.deadline && notice.deadline !== '-' ? dayjs(notice.deadline) : null,
      projectCode: notice.projectCode || '',
      purchaseMode: notice.purchaseMode || '公开招标',
      bidOpenTime: notice.bidOpenTime && notice.bidOpenTime !== '-' ? dayjs(notice.bidOpenTime) : null,
      bidOpenLocation: notice.bidOpenLocation || '',
      evaluationMethod: notice.evaluationMethod || '',
      bidSummaryFields: notice.bidSummaryFields || [],
      contactName: notice.contactName || '',
      contactPhone: notice.contactPhone || '',
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

  // 标段可能没有 id（新建项目的标段仅有 code/name），统一取可辨识键
  const pkgKey = (pkg) => pkg.id ?? pkg.code ?? pkg.name

  const packageOptions = useMemo(
    () =>
      (selectedProject?.packages || []).map((pkg) => ({
        label: pkg.name,
        value: pkgKey(pkg)
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

  const saveDraft = () => {
    message.success('演示环境 · 草稿已保存')
  }

  const publish = () => {
    message.success('演示环境 · 公告已发布')
    navigate({ to: '/admin/notice-list' })
  }

  // 入口守卫（所有 hooks 之后）：公告发布属于项目阶段操作，无 projectId 时阻断并引导从项目进入；
  // 同路由无参→有参导航复用组件实例，hooks 数量必须保持不变
  if (!projectIdFromQuery) {
    return <ProjectEntryGuard />
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

          <Row gutter={20}>
            <Col span={12}>
              <Form.Item label="项目编号" required>
                <Input
                  placeholder="请输入项目编号"
                  value={form.projectCode}
                  onChange={(e) => updateField('projectCode', e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="采购方式" required>
                <Select
                  placeholder="请选择采购方式"
                  style={{ width: '100%' }}
                  value={form.purchaseMode || undefined}
                  onChange={(value) => updateField('purchaseMode', value)}
                  options={[
                    { label: '公开招标', value: '公开招标' },
                    { label: '邀请招标', value: '邀请招标' },
                    { label: '公开询比价', value: '公开询比价' },
                    { label: '竞争性谈判', value: '竞争性谈判' },
                    { label: '邀请询比价', value: '邀请询比价' }
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={20}>
            <Col span={12}>
              <Form.Item label="开标时间" required>
                <DatePicker
                  showTime
                  style={{ width: '100%' }}
                  value={form.bidOpenTime}
                  onChange={(value) => updateField('bidOpenTime', value)}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="开标地点" required>
                <Input
                  placeholder="请输入开标地点"
                  value={form.bidOpenLocation}
                  onChange={(e) => updateField('bidOpenLocation', e.target.value)}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={20}>
            <Col span={12}>
              <Form.Item label="评标方法" required>
                <Select
                  placeholder="请选择评标方法"
                  style={{ width: '100%' }}
                  value={form.evaluationMethod || undefined}
                  onChange={(value) => updateField('evaluationMethod', value)}
                  options={[
                    { label: '综合评分法', value: '综合评分法' },
                    { label: '最低价法', value: '最低价法' },
                    { label: '性价比法', value: '性价比法' },
                    { label: '经评审的最低投标价法', value: '经评审的最低投标价法' }
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="开标一览表字段" required>
                <Select
                  mode="tags"
                  placeholder="请输入开标一览表字段，按回车确认"
                  style={{ width: '100%' }}
                  value={form.bidSummaryFields}
                  onChange={(value) => updateField('bidSummaryFields', value)}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={20}>
            <Col span={12}>
              <Form.Item label="联系人" required>
                <Input
                  placeholder="请输入联系人"
                  value={form.contactName}
                  onChange={(e) => updateField('contactName', e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="联系电话" required>
                <Input
                  placeholder="请输入联系电话"
                  value={form.contactPhone}
                  onChange={(e) => updateField('contactPhone', e.target.value)}
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
                { label: '短信通知受邀供应商', value: '短信通知受邀供应商' },
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
              <Descriptions column={2} bordered size="small" style={{ marginTop: 16 }}>
                <Descriptions.Item label="项目编号">{form.projectCode || '-'}</Descriptions.Item>
                <Descriptions.Item label="采购方式">{form.purchaseMode || '-'}</Descriptions.Item>
                <Descriptions.Item label="开标时间">{formatTime(form.bidOpenTime)}</Descriptions.Item>
                <Descriptions.Item label="开标地点">{form.bidOpenLocation || '-'}</Descriptions.Item>
                <Descriptions.Item label="评标方法">{form.evaluationMethod || '-'}</Descriptions.Item>
                <Descriptions.Item label="开标一览表字段">
                  {form.bidSummaryFields.length > 0
                    ? form.bidSummaryFields.map((f) => <Tag key={f} size="small">{f}</Tag>)
                    : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="联系人">{form.contactName || '-'}</Descriptions.Item>
                <Descriptions.Item label="联系电话">{form.contactPhone || '-'}</Descriptions.Item>
              </Descriptions>
              {form.type === 'change' && form.changeReason && (
                <Alert
                  type="warning"
                  showIcon
                  title={`变更原因：${form.changeReason}`}
                  style={{ margin: '16px 0' }}
                />
              )}
              {selectedProject && form.packages.length > 0 && (
                <div className="preview-packages">
                  关联标段：
                  {selectedProject.packages
                    .filter((p) => form.packages.includes(pkgKey(p)))
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
