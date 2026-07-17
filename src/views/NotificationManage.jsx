import { useMemo, useState } from 'react'
import { Alert, Badge, Button, Card, Form, Input, Modal, Select, Table, Tag, message } from 'antd'
import { messageStore, MESSAGE_TYPES } from '../data/messageStore.js'
import { useRole } from '../hooks/useRole.js'

// 通知管理（cal-009，缩圈）：以站内信为主（需求确认清单 54）；
// 短信（天翼云）/邮件通知仅预留接口，一期不实现（会议概要四；清单 56「不需要」）

// 接收角色选项：与 messageStore 契约一致（平台角色名 或 采购管理部/需求部门）
const ROLE_OPTIONS = [
  '招标人',
  '招标代理',
  '投标人',
  '评标专家',
  '监督人员',
  '平台管理员',
  '采购管理部',
  '需求部门'
].map((value) => ({ label: value, value }))

const TYPE_COLOR = {
  approval: 'processing',
  system: 'default',
  notice: 'warning'
}

const typeLabel = (value) => MESSAGE_TYPES.find((t) => t.value === value)?.label || value

export default function NotificationManage() {
  const { userName } = useRole()
  const [messages, setMessages] = useState(() => messageStore.list())
  const [search, setSearch] = useState({ type: undefined, read: undefined })

  const [dialogVisible, setDialogVisible] = useState(false)
  const [form, setForm] = useState({ toRole: undefined, toUser: '', type: 'system', title: '', content: '' })
  const [formErrors, setFormErrors] = useState({})

  // store 无订阅机制，变更后自行重读
  const reload = () => setMessages(messageStore.list())

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (formErrors[key]) setFormErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const openCreate = () => {
    setForm({ toRole: undefined, toUser: '', type: 'system', title: '', content: '' })
    setFormErrors({})
    setDialogVisible(true)
  }

  const send = () => {
    const errors = {}
    if (!form.toRole) errors.toRole = '请选择接收角色'
    if (!form.title.trim()) errors.title = '请输入标题'
    if (!form.content.trim()) errors.content = '请输入内容'
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      message.error('请完善必填项后再发送')
      return
    }
    messageStore.add({
      toRole: form.toRole,
      toUser: form.toUser.trim(),
      type: form.type,
      title: form.title.trim(),
      content: form.content.trim()
    })
    reload()
    setDialogVisible(false)
    message.success('站内信已发送，接收方可在消息中心查看')
  }

  const markRead = (row) => {
    messageStore.markRead(row.id)
    reload()
    message.success(`已标记为已读：${row.title}`)
  }

  const filtered = useMemo(
    () =>
      messages.filter(
        (m) =>
          (search.type === undefined || m.type === search.type) &&
          (search.read === undefined || String(m.read) === String(search.read))
      ),
    [messages, search]
  )

  const columns = [
    {
      title: '状态',
      dataIndex: 'read',
      width: 90,
      render: (read) =>
        read ? <Badge status="default" text="已读" /> : <Badge status="processing" text="未读" />
    },
    {
      title: '标题',
      dataIndex: 'title',
      minWidth: 240,
      render: (title, row) => (
        <span style={row.read ? undefined : { fontWeight: 'bold' }}>{title}</span>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 110,
      render: (type) => <Tag color={TYPE_COLOR[type]}>{typeLabel(type)}</Tag>
    },
    {
      title: '接收对象',
      width: 160,
      render: (_, row) => `${row.toRole || '-'}${row.toUser ? ` / ${row.toUser}` : ''}`
    },
    { title: '内容', dataIndex: 'content', minWidth: 260, ellipsis: true },
    { title: '发送时间', dataIndex: 'createdAt', width: 170 },
    {
      title: '操作',
      width: 110,
      render: (_, row) => (
        <Button type="link" disabled={row.read} onClick={() => markRead(row)}>
          标为已读
        </Button>
      )
    }
  ]

  return (
    <div className="notification-manage">
      <Card
        title={
          <div className="card-header">
            <span>通知管理</span>
            <Button type="primary" onClick={openCreate}>发送站内信</Button>
          </div>
        }
      >
        <Alert
          title="短信（天翼云）/邮件通知为预留接口，一期不实现（2026-07-17 会议概要四；需求确认清单 56「不需要」）。本页按站内信实现（清单 54），发送后接收方可在消息中心查看。"
          type="warning"
          showIcon
          closable={false}
          style={{ marginBottom: 20 }}
        />
        <div className="filter-bar">
          <Select
            placeholder="消息类型"
            allowClear
            style={{ width: 160 }}
            value={search.type}
            onChange={(value) => setSearch((prev) => ({ ...prev, type: value }))}
            options={MESSAGE_TYPES.map((t) => ({ label: t.label, value: t.value }))}
          />
          <Select
            placeholder="阅读状态"
            allowClear
            style={{ width: 140 }}
            value={search.read}
            onChange={(value) => setSearch((prev) => ({ ...prev, read: value }))}
            options={[
              { label: '未读', value: false },
              { label: '已读', value: true }
            ]}
          />
        </div>
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          pagination={false}
          style={{ width: '100%' }}
        />
      </Card>

      <Modal
        title="发送站内信"
        open={dialogVisible}
        width={600}
        onCancel={() => setDialogVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setDialogVisible(false)}>取消</Button>,
          <Button key="send" type="primary" onClick={send}>发送</Button>
        ]}
      >
        <Form labelCol={{ flex: '0 0 100px' }} wrapperCol={{ flex: 'auto' }}>
          <Form.Item label="接收角色" validateStatus={formErrors.toRole ? 'error' : ''} help={formErrors.toRole}>
            <Select
              style={{ width: '100%' }}
              placeholder="请选择接收角色"
              value={form.toRole}
              onChange={(value) => updateField('toRole', value)}
              options={ROLE_OPTIONS}
            />
          </Form.Item>
          <Form.Item label="指定接收人">
            <Input
              placeholder="可选，填写具体账号/姓名时仅该用户可见"
              value={form.toUser}
              onChange={(e) => updateField('toUser', e.target.value)}
            />
          </Form.Item>
          <Form.Item label="消息类型">
            <Select
              style={{ width: '100%' }}
              value={form.type}
              onChange={(value) => updateField('type', value)}
              options={MESSAGE_TYPES.map((t) => ({ label: t.label, value: t.value }))}
            />
          </Form.Item>
          <Form.Item label="标题" validateStatus={formErrors.title ? 'error' : ''} help={formErrors.title}>
            <Input value={form.title} onChange={(e) => updateField('title', e.target.value)} />
          </Form.Item>
          <Form.Item label="内容" validateStatus={formErrors.content ? 'error' : ''} help={formErrors.content}>
            <Input.TextArea
              rows={4}
              value={form.content}
              onChange={(e) => updateField('content', e.target.value)}
            />
          </Form.Item>
          <Form.Item label="发送人">
            <Input value={userName} disabled />
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .notification-manage {
          max-width: 1200px;
          margin: 0 auto;
        }
        .notification-manage .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
          width: 100%;
        }
        .notification-manage .filter-bar {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  )
}
