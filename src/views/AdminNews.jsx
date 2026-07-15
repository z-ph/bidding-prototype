import { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Radio,
  Upload,
  message
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DownOutlined,
  UploadOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons'
import { STATUS_COLORS } from '../config/permissions.js'
import { portalStore } from '../data/portalStore.js'

const { Option } = Select
const { TextArea } = Input

const categories = [
  '平台公告',
  '培训通知',
  '办事指南',
  '政策法规',
  '产品更新',
  '采购信息',
  '常见问题'
]

const statusMap = {
  draft: '草稿',
  published: '已发布',
  offline: '已下线'
}

export default function AdminNews() {
  const navigate = useNavigate()
  const [news, setNews] = useState(() => portalStore.getNews())
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form] = Form.useForm()

  const refresh = (next) => {
    setNews(next)
    portalStore.saveNews(next)
  }

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({ status: 'published', category: '平台公告' })
    setModalOpen(true)
  }

  const openEdit = (record) => {
    setEditing(record)
    form.setFieldsValue({
      title: record.title,
      category: record.category,
      content: record.content,
      status: record.status
    })
    setModalOpen(true)
  }

  const handleOffline = (record) => {
    const next = news.map((n) =>
      n.id === record.id ? { ...n, status: 'offline' } : n
    )
    refresh(next)
    message.success('新闻已下线')
  }

  const handlePublish = (record) => {
    const next = news.map((n) =>
      n.id === record.id ? { ...n, status: 'published' } : n
    )
    refresh(next)
    message.success('新闻已发布')
  }

  const handleSave = () => {
    form.validateFields().then((values) => {
      const now = new Date().toISOString().slice(0, 10)
      if (editing) {
        const next = news.map((n) =>
          n.id === editing.id
            ? { ...n, ...values, publishTime: values.status === 'published' && n.status !== 'published' ? now : n.publishTime }
            : n
        )
        refresh(next)
        message.success('新闻已更新')
      } else {
        const newItem = {
          id: Date.now(),
          ...values,
          publishTime: values.status === 'published' ? now : '-',
          attachments: []
        }
        refresh([newItem, ...news])
        message.success('新闻已创建')
      }
      setModalOpen(false)
    })
  }

  const columns = [
    { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: '分类', dataIndex: 'category', key: 'category', width: 120 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={STATUS_COLORS[statusMap[status]] || 'default'}>
          {statusMap[status]}
        </Tag>
      )
    },
    { title: '发布时间', dataIndex: 'publishTime', key: 'publishTime', width: 120 },
    {
      title: '操作',
      key: 'action',
      width: 220,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(record)}>
            编辑
          </Button>
          {record.status === 'published' ? (
            <Button type="link" danger icon={<DownOutlined />} onClick={() => handleOffline(record)}>
              下线
            </Button>
          ) : (
            <Button type="link" onClick={() => handlePublish(record)}>
              发布
            </Button>
          )}
        </Space>
      )
    }
  ]

  return (
    <div className="admin-news">
      <Card
        title={
          <div className="admin-news-header">
            <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate({ to: '/admin/admin-dashboard' })}>
              返回
            </Button>
            <span>新闻公告维护</span>
          </div>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新增新闻
          </Button>
        }
      >
        <Table rowKey="id" dataSource={news} columns={columns} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title={editing ? '编辑新闻' : '新增新闻'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        width={720}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={{ status: 'published', category: '平台公告' }}>
          <Form.Item
            label="标题"
            name="title"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入新闻标题" />
          </Form.Item>
          <Form.Item
            label="分类"
            name="category"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="请选择分类">
              {categories.map((c) => (
                <Option key={c} value={c}>{c}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="正文"
            name="content"
            rules={[{ required: true, message: '请输入正文' }]}
          >
            <TextArea rows={8} placeholder="请输入新闻正文" />
          </Form.Item>
          <Form.Item label="附件">
            <Upload beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>上传附件</Button>
            </Upload>
          </Form.Item>
          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Radio.Group>
              <Radio value="draft">草稿</Radio>
              <Radio value="published">立即发布</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .admin-news {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        .admin-news-header {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: bold;
        }
      `}</style>
    </div>
  )
}
