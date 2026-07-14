import { useEffect, useMemo, useState } from 'react'
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  message
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  LockOutlined,
  StopOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'

const SUB_ACCOUNTS_KEY = 'bidding-sub-accounts'
const ORG_KEY = 'bidding-organization'

const ROLE_OPTIONS = [
  { label: '招标人', value: 'tenderee' },
  { label: '招标代理', value: 'agent' },
  { label: '投标人', value: 'bidder' },
  { label: '评标专家', value: 'expert' },
  { label: '监督人员', value: 'supervisor' },
  { label: '管理员', value: 'admin' }
]

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function flattenOrg(nodes, result = []) {
  (nodes || []).forEach((node) => {
    result.push({ label: node.name, value: node.code })
    if (node.children) flattenOrg(node.children, result)
  })
  return result
}

const defaultSubAccounts = [
  { id: '1', name: '子账号A', phone: '13800000001', department: 'CG', departmentName: '采购部', role: 'tenderee', status: 'active', contactInfo: '负责采购业务' },
  { id: '2', name: '子账号B', phone: '13800000002', department: 'ZB', departmentName: '招标代理部', role: 'agent', status: 'inactive', contactInfo: '代理业务联系人' }
]

export default function SubAccounts() {
  const [subAccounts, setSubAccounts] = useState(() => readJson(SUB_ACCOUNTS_KEY, defaultSubAccounts))
  const [orgTree, setOrgTree] = useState(() => readJson(ORG_KEY, []))
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState('create')
  const [editingId, setEditingId] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    const handler = () => setOrgTree(readJson(ORG_KEY, []))
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const deptOptions = useMemo(() => flattenOrg(orgTree), [orgTree])

  const persist = (next) => {
    setSubAccounts(next)
    writeJson(SUB_ACCOUNTS_KEY, next)
  }

  const openCreate = () => {
    setModalType('create')
    setEditingId(null)
    form.resetFields()
    form.setFieldsValue({ status: 'active' })
    setModalOpen(true)
  }

  const openEdit = (row) => {
    setModalType('edit')
    setEditingId(row.id)
    form.setFieldsValue({
      name: row.name,
      phone: row.phone,
      department: row.department,
      role: row.role,
      contactInfo: row.contactInfo,
      status: row.status
    })
    setModalOpen(true)
  }

  const handleSave = () => {
    form.validateFields().then((values) => {
      const deptName = deptOptions.find((d) => d.value === values.department)?.label || values.department
      if (modalType === 'create') {
        const next = [
          ...subAccounts,
          {
            id: `${Date.now()}`,
            ...values,
            departmentName: deptName,
            password: values.password || '123456'
          }
        ]
        persist(next)
        message.success('子账号已创建')
      } else {
        const next = subAccounts.map((item) =>
          item.id === editingId
            ? { ...item, ...values, departmentName: deptName }
            : item
        )
        persist(next)
        message.success('子账号已更新')
      }
      setModalOpen(false)
    })
  }

  const toggleStatus = (row) => {
    const nextStatus = row.status === 'active' ? 'inactive' : 'active'
    const actionText = nextStatus === 'active' ? '启用' : '停用'
    Modal.confirm({
      title: `确认${actionText}该子账号？`,
      content: `子账号：${row.name}`,
      onOk: () => {
        persist(subAccounts.map((item) => (item.id === row.id ? { ...item, status: nextStatus } : item)))
        message.success(`已${actionText}`)
      }
    })
  }

  const resetPassword = (row) => {
    Modal.confirm({
      title: '重置密码',
      content: `确定重置「${row.name}」的密码为 123456 吗？`,
      onOk: () => {
        persist(subAccounts.map((item) => (item.id === row.id ? { ...item, password: '123456' } : item)))
        message.success('密码已重置')
      }
    })
  }

  const columns = [
    { title: '姓名', dataIndex: 'name', width: 120 },
    { title: '手机号', dataIndex: 'phone', width: 140 },
    { title: '所属部门', dataIndex: 'departmentName', width: 140 },
    { title: '角色', dataIndex: 'role', width: 120, render: (r) => ROLE_OPTIONS.find((o) => o.value === r)?.label || r },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (s) => <Tag color={s === 'active' ? 'success' : 'default'}>{s === 'active' ? '启用' : '停用'}</Tag>
    },
    { title: '联系信息', dataIndex: 'contactInfo', ellipsis: true },
    {
      title: '操作',
      width: 260,
      fixed: 'right',
      render: (_, row) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(row)}>编辑</Button>
          <Button
            type="link"
            icon={row.status === 'active' ? <StopOutlined /> : <CheckCircleOutlined />}
            onClick={() => toggleStatus(row)}
          >
            {row.status === 'active' ? '停用' : '启用'}
          </Button>
          <Button type="link" icon={<LockOutlined />} onClick={() => resetPassword(row)}>重置密码</Button>
        </Space>
      )
    }
  ]

  return (
    <div className="sub-accounts">
      <Card
        title={
          <div className="card-header">
            <span>子账号管理</span>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新建子账号</Button>
          </div>
        }
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={subAccounts}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={modalType === 'create' ? '新建子账号' : '编辑子账号'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="姓名" name="name" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item label="手机号" name="phone" rules={[{ required: true, message: '请输入手机号' }, { pattern: /^1[3-9]\d{9}$/, message: '手机号格式错误' }]}>
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item label="所属部门" name="department" rules={[{ required: true, message: '请选择所属部门' }]}>
            <Select placeholder="请选择部门" options={deptOptions} />
          </Form.Item>
          <Form.Item label="角色" name="role" rules={[{ required: true, message: '请选择角色' }]}>
            <Select placeholder="请选择角色" options={ROLE_OPTIONS} />
          </Form.Item>
          {modalType === 'create' && (
            <Form.Item label="初始密码" name="password" rules={[{ required: true, message: '请设置初始密码' }]}>
              <Input.Password placeholder="请输入初始密码" />
            </Form.Item>
          )}
          <Form.Item label="联系信息" name="contactInfo">
            <Input.TextArea rows={3} placeholder="备注联系信息" />
          </Form.Item>
          {modalType === 'edit' && (
            <Form.Item label="状态" name="status" rules={[{ required: true }]}>
              <Select
                options={[
                  { label: '启用', value: 'active' },
                  { label: '停用', value: 'inactive' }
                ]}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>

      <style>{`
        .sub-accounts {
          max-width: 1200px;
          margin: 0 auto;
        }
        .sub-accounts .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
        }
      `}</style>
    </div>
  )
}
