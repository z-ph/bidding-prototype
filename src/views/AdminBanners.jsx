// @ts-nocheck — TS 渐进迁移基线：解冻本文件时删除本行并修复类型（见 AGENTS.md 技术栈）
import { useState } from 'react'
import {
  Card, Table, Button, Tag, Space, Modal, Form, Input, Radio, ColorPicker, message, Upload
} from 'antd'
import { PlusOutlined, EditOutlined, DownOutlined, UploadOutlined } from '@ant-design/icons'
import { STATUS_COLORS } from '../config/permissions.js'
import { portalStore } from '../data/portalStore.js'

const statusMap = { draft: '草稿', published: '已发布', offline: '已下线' }

// 预设主题色方案
const PRESET_THEMES = [
  { label: '深蓝', value: 'linear-gradient(135deg, #001529 0%, #003366 100%)' },
  { label: '科技蓝', value: 'linear-gradient(135deg, #003366 0%, #0066cc 100%)' },
  { label: '藏青', value: 'linear-gradient(135deg, #001529 0%, #004080 100%)' },
  { label: '商务蓝', value: 'linear-gradient(135deg, #1a3a5c 0%, #2d6aa0 100%)' },
  { label: '暗夜蓝', value: 'linear-gradient(135deg, #0d1b2a 0%, #1b3a5c 100%)' },
  { label: '碳灰', value: 'linear-gradient(135deg, #2c3e50 0%, #4a6075 100%)' },
  { label: '深绿', value: 'linear-gradient(135deg, #1b3a2d 0%, #2d6a4f 100%)' },
  { label: '酒红', value: 'linear-gradient(135deg, #3a1b2d 0%, #6a2d4f 100%)' },
]

export default function AdminBanners() {
  const [banners, setBanners] = useState(() => portalStore.getBanners())
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form] = Form.useForm()

  const refresh = (next) => {
    setBanners([...next])
    portalStore.saveBanners(next)
  }

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({
      status: 'published',
      color: PRESET_THEMES[0].value,
      theme: PRESET_THEMES[0].value,
      color1: '#001529',
      color2: '#003366'
    })
    setModalOpen(true)
  }

  const openEdit = (record) => {
    setEditing(record)
    form.setFieldsValue({
      title: record.title,
      subtitle: record.subtitle,
      image: record.image || '',
      color: record.color || '',
      theme: record.color || PRESET_THEMES[0].value,
      color1: '#001529',
      color2: '#003366',
      status: record.status
    })
    setModalOpen(true)
  }

  const handlePublish = (record) => {
    refresh(banners.map((b) => b.id === record.id ? { ...b, status: 'published' } : b))
    message.success('轮播已发布')
  }

  const handleOffline = (record) => {
    refresh(banners.map((b) => b.id === record.id ? { ...b, status: 'offline' } : b))
    message.success('轮播已下线')
  }

  const handleSave = () => {
    form.validateFields().then((values) => {
      // 组装最终渐变色：优先用预设主题，其次手动拼接 ColorPicker 双色
      const color = values.theme ||
        `linear-gradient(135deg, ${values.color1 || '#001529'} 0%, ${values.color2 || '#003366'} 100%)`
      const saveValues = { ...values, color }
      if (editing) {
        refresh(banners.map((b) =>
          b.id === editing.id ? { ...b, ...saveValues } : b
        ))
        message.success('轮播已更新')
      } else {
        refresh([...banners, { id: Date.now(), ...saveValues }])
        message.success('轮播已创建')
      }
      setModalOpen(false)
    })
  }

  const renderColor = (color) => (
    <div style={{
      width: 60, height: 24, borderRadius: 4,
      background: color || '#ccc', border: '1px solid #d9d9d9'
    }} />
  )

  const columns = [
    { title: '标题', dataIndex: 'title', ellipsis: true },
    { title: '副标题', dataIndex: 'subtitle', width: 260, ellipsis: true },
    { title: '背景色', dataIndex: 'color', width: 100, render: renderColor },
    {
      title: '状态', dataIndex: 'status', width: 100,
      render: (status) => <Tag color={STATUS_COLORS[statusMap[status]] || 'default'}>{statusMap[status]}</Tag>
    },
    {
      title: '操作', width: 200,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(record)}>编辑</Button>
          {record.status === 'published'
            ? <Button type="link" danger icon={<DownOutlined />} onClick={() => handleOffline(record)}>下线</Button>
            : <Button type="link" onClick={() => handlePublish(record)}>发布</Button>
          }
        </Space>
      )
    }
  ]

  return (
    <div className="admin-banners">
      <Card
        title={<span>首页轮播管理</span>}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新增轮播</Button>}
      >
        <Table rowKey="id" dataSource={banners} columns={columns} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title={editing ? '编辑轮播' : '新增轮播'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        width={640}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item label="标题" name="title" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="轮播主标题，如：全流程电子化采购平台" />
          </Form.Item>
          <Form.Item label="副标题" name="subtitle" rules={[{ required: true, message: '请输入副标题' }]}>
            <Input placeholder="轮播副标题，如：阳光、公平、公正、高效、安全" />
          </Form.Item>
          <Form.Item label="背景图片（可选）" name="image">
            <Upload
              beforeUpload={() => false}
              listType="picture-card"
              maxCount={1}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>上传图片</Button>
            </Upload>
          </Form.Item>
          <Form.Item label="背景主题" name="theme">
            <Radio.Group optionType="button" buttonStyle="solid">
              {PRESET_THEMES.map((t) => (
                <Radio key={t.value} value={t.value}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      display: 'inline-block', width: 16, height: 16, borderRadius: 3,
                      background: t.value, border: '1px solid rgba(255,255,255,0.3)'
                    }} />
                    {t.label}
                  </span>
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>
          <Form.Item label="自定义背景色（覆盖主题）">
            <Space>
              <Form.Item name="color1" noStyle>
                <ColorPicker format="hex" />
              </Form.Item>
              <span>→</span>
              <Form.Item name="color2" noStyle>
                <ColorPicker format="hex" />
              </Form.Item>
              <span style={{ color: '#999', fontSize: 12 }}>
                左侧起始色 → 右侧结束色，渐变角度固定 135°
              </span>
            </Space>
          </Form.Item>
          <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}>
            <Radio.Group>
              <Radio value="draft">草稿</Radio>
              <Radio value="published">立即发布</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .admin-banners { max-width: 1200px; margin: 0 auto; padding: 20px; }
      `}</style>
    </div>
  )
}
