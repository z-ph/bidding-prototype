import { useState } from 'react'
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
  message
} from 'antd'
import { UploadOutlined } from '@ant-design/icons'

export default function NoticePublish() {
  const projects = [
    { id: 1, name: 'XX市轨道交通设备采购项目' },
    { id: 2, name: '办公桌椅采购项目' }
  ]

  const [form, setForm] = useState({
    type: 'tender',
    projectId: 1,
    title: 'XX市轨道交通设备采购项目招标公告',
    publishTime: dayjs(),
    deadline: null,
    content: '一、招标条件\n本项目已由相关部门批准，现进行公开招标。\n\n二、项目概况\n采购内容：轨道交通设备一批。\n\n三、投标人资格要求\n1. 具有独立法人资格；\n2. 具有相应供货能力；\n3. 本项目不接受联合体投标。\n\n四、获取招标文件\n时间：即日起至投标截止时间。\n\n五、联系方式\n招标人：XX市轨道交通集团有限公司',
    channels: ['平台门户', '电子招投标系统']
  })

  const [fileList, setFileList] = useState([
    { uid: '-1', name: '招标文件.pdf', size: 2048000 }
  ])

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const previewContent = form.content.replace(/\n/g, '<br>')

  const formatTime = (t) => {
    if (!t) return '-'
    return new Date(t).toLocaleString()
  }

  const saveDraft = () => {
    message.success('公告草稿已保存')
  }

  const publish = () => {
    message.success('公告已发布')
  }

  return (
    <div className="notice-publish">
      <Card
        title={<span>发布公告</span>}
        extra={
          <div>
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
                  onChange={(value) => updateField('type', value)}
                  options={[
                    { label: '招标公告', value: 'tender' },
                    { label: '变更公告', value: 'change' },
                    { label: '候选人公示', value: 'candidate' },
                    { label: '中标公告', value: 'result' },
                    { label: '流标公告', value: 'abort' }
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="关联项目" required>
                <Select
                  placeholder="请选择关联项目"
                  style={{ width: '100%' }}
                  value={form.projectId}
                  onChange={(value) => updateField('projectId', value)}
                  options={projects.map((p) => ({ label: p.name, value: p.id }))}
                />
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
              onChange={({ fileList }) => setFileList(fileList)}
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
        .preview-content {
          line-height: 1.8;
          color: #333;
        }
      `}</style>
    </div>
  )
}
