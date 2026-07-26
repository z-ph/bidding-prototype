// @ts-nocheck — TS 渐进迁移基线：解冻本文件时删除本行并修复类型（见 AGENTS.md 技术栈）
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
  message
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DownOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons'
import { STATUS_COLORS } from '../config/permissions.js'
import { portalStore } from '../data/portalStore.js'

const { Option } = Select
const { TextArea } = Input

const categories = [
  '操作手册',
  '驱动工具',
  '模板文件',
  '政策法规'
]

const statusMap = {
  draft: '草稿',
  published: '已发布',
  offline: '已下线'
}

export default function AdminDownloads() {
  const navigate = useNavigate()
  const [downloads, setDownloads] = useState(() => portalStore.getDownloads())
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form] = Form.useForm()

  const refresh = (next) => {
    setDownloads(next)
    portalStore.saveDownloads(next)
  }

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({ status: 'published', category: '操作手册' })
    setModalOpen(true)
  }

  const openEdit = (record) => {
    setEditing(record)
    form.setFieldsValue({
      name: record.name,
      category: record.category,
      version: record.version,
      desc: record.desc,
      content: record.content,
      status: record.status
    })
    setModalOpen(true)
  }

  const handleOffline = (record) => {
    const next = downloads.map((d) =>
      d.id === record.id ? { ...d, status: 'offline' } : d
    )
    refresh(next)
    message.success('资源已下线')
  }

  const handlePublish = (record) => {
    const next = downloads.map((d) =>
      d.id === record.id ? { ...d, status: 'published' } : d
    )
    refresh(next)
    message.success('资源已发布')
  }

  const handleSave = () => {
    form.validateFields().then((values) => {
      const now = new Date().toISOString().slice(0, 10)
      if (editing) {
        const next = downloads.map((d) =>
          d.id === editing.id
            ? { ...d, ...values, updateTime: values.status === 'published' && d.status !== 'published' ? now : d.updateTime }
            : d
        )
        refresh(next)
        message.success('资源已更新')
      } else {
        const newItem = {
          id: Date.now(),
          ...values,
          updateTime: values.status === 'published' ? now : '-',
        }
        refresh([newItem, ...downloads])
        message.success('资源已创建')
      }
      setModalOpen(false)
    })
  }

  const columns = [
    { title: '文件名称', dataIndex: 'name', key: 'name', ellipsis: true },
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
    { title: '版本', dataIndex: 'version', key: 'version', width: 100 },
    { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime', width: 120 },
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
    <div className="admin-downloads">
      <Card
        title={
          <div className="admin-downloads-header">
            <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate({ to: '/admin/dashboard' })}>
              返回
            </Button>
            <span>下载中心管理</span>
          </div>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新增资源
          </Button>
        }
      >
        <Table rowKey="id" dataSource={downloads} columns={columns} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title={editing ? '编辑资源' : '新增资源'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        width={640}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={{ status: 'published', category: '操作手册' }}>
          <Form.Item
            label="文件名称"
            name="name"
            rules={[{ required: true, message: '请输入文件名称' }]}
          >
            <Input placeholder="请输入文件名称" />
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
          <Form.Item label="版本" name="version">
            <Input placeholder="例如 V1.0.0" />
          </Form.Item>
          <Form.Item label="说明" name="desc">
            <Input placeholder="请输入资源说明" />
          </Form.Item>
          <Form.Item label="文件内容（模拟下载内容）" name="content">
            <TextArea rows={6} placeholder="请输入模拟下载的文本内容" />
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
        .admin-downloads {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        .admin-downloads-header {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: bold;
        }
      `}</style>
    </div>
  )
}
