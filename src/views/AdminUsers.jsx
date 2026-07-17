import { useState } from 'react'
import { Alert, Button, Card, Col, Form, Input, Modal, Row, Select, Table, Tag, Tooltip, message } from 'antd'
import { loadUsers, saveUsers } from '../data/userStore'

const roleOptions = [
  { label: '招标人', value: 'tenderee' },
  { label: '招标代理', value: 'agent' },
  { label: '投标人', value: 'bidder' },
  { label: '评标专家', value: 'expert' },
  { label: '监督人员', value: 'supervisor' },
  { label: '平台管理员', value: 'admin' }
]

export default function AdminUsers() {
  const [search, setSearch] = useState({ name: '', role: undefined })
  const [users, setUsers] = useState(() => loadUsers())

  // 写入持久化：任何 users 变更都落库，刷新后保留
  const updateUsers = (next) => {
    setUsers(next)
    saveUsers(next)
  }

  const [dialogVisible, setDialogVisible] = useState(false)
  const [form, setForm] = useState({ account: '', name: '', role: undefined, org: '' })
  const [formErrors, setFormErrors] = useState({})

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    // 清除该字段已显示的校验错误
    if (formErrors[key]) setFormErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const openCreate = () => {
    setForm({ account: '', name: '', role: undefined, org: '' })
    setFormErrors({})
    setDialogVisible(true)
  }

  const load = () => message.success('查询用户')
  const edit = (row) => message.success(`编辑：${row.name}`)
  const setPermission = (row) => message.success(`配置 ${row.name} 的菜单权限`)

  // 当前登录账号（用于禁止停用本人）
  const currentAccount = localStorage.getItem('bidding-account') || ''

  const requestToggleStatus = (row) => {
    // 禁止停用当前登录账号（test2-001 P0 核心防护）
    if (row.status === '启用' && row.account === currentAccount) {
      message.warning('不能停用当前登录账号')
      return
    }
    const action = row.status === '启用' ? '停用' : '启用'
    Modal.confirm({
      title: `确认${action}用户`,
      content: `确定要${action}「${row.name}（${row.account}）」吗？${row.status === '启用' ? '停用后该账号将无法登录。' : ''}`,
      okText: action,
      okButtonProps: { danger: row.status === '启用' },
      cancelText: '取消',
      onOk: () => {
        updateUsers(
          users.map((user) =>
            user === row ? { ...user, status: user.status === '启用' ? '禁用' : '启用' } : user
          )
        )
        message.success(`已${action}「${row.name}」`)
      }
    })
  }
  const save = () => {
    // 新增用户校验：账号必填且唯一、姓名必填、角色必选、所属组织必填
    const errors = {}
    const account = form.account.trim()
    const name = form.name.trim()
    const org = form.org.trim()
    if (!account) errors.account = '请输入账号'
    else if (users.some((u) => u.account === account)) errors.account = '账号已存在'
    if (!name) errors.name = '请输入姓名/企业名称'
    if (!form.role) errors.role = '请选择角色'
    if (!org) errors.org = '请输入所属组织'
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      message.error('请完善必填项后再保存')
      return
    }
    updateUsers([
      ...users,
      { account, name, role: form.role, org, status: '启用' }
    ])
    message.success('用户已保存')
    setDialogVisible(false)
  }

  const columns = [
    { title: '账号', dataIndex: 'account', width: 150 },
    { title: '姓名/企业', dataIndex: 'name', minWidth: 200 },
    { title: '角色', dataIndex: 'role', width: 120 },
    { title: '所属组织', dataIndex: 'org', width: 180 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === '启用' ? 'success' : 'default'}>{status}</Tag>
      )
    },
    {
      title: '操作',
      width: 200,
      render: (_, row) => {
        const isSelfDisable = row.status === '启用' && row.account === currentAccount
        const toggleBtn = (
          <Button
            type="link"
            danger={row.status === '启用'}
            disabled={isSelfDisable}
            onClick={() => requestToggleStatus(row)}
          >
            {row.status === '启用' ? '禁用' : '启用'}
          </Button>
        )
        return (
          <>
            <Button type="link" onClick={() => edit(row)}>编辑</Button>
            <Button type="link" onClick={() => setPermission(row)}>权限</Button>
            {isSelfDisable ? (
              <Tooltip title="不能停用当前登录账号">{toggleBtn}</Tooltip>
            ) : (
              toggleBtn
            )}
          </>
        )
      }
    }
  ]

  return (
    <div className="admin-users">
      <Card
        title={
          <div className="card-header">
            <span>用户与权限</span>
            <Button type="primary" onClick={openCreate}>新增用户</Button>
          </div>
        }
      >
        <Alert
          title="配置系统用户、角色和菜单权限，不同角色进入系统后看到不同的工作台和菜单。"
          type="info"
          showIcon
          closable={false}
          style={{ marginBottom: 20 }}
        />
        <Row gutter={20} style={{ marginBottom: 20 }}>
          <Col span={6}>
            <Input
              placeholder="用户名/账号"
              allowClear
              value={search.name}
              onChange={(e) => setSearch((prev) => ({ ...prev, name: e.target.value }))}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="角色"
              allowClear
              style={{ width: '100%' }}
              value={search.role}
              onChange={(value) => setSearch((prev) => ({ ...prev, role: value }))}
              options={roleOptions}
            />
          </Col>
          <Col span={4}>
            <Button type="primary" onClick={load}>查询</Button>
          </Col>
        </Row>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="account"
          pagination={false}
          style={{ width: '100%' }}
        />
      </Card>

      <Modal
        title="新增用户"
        open={dialogVisible}
        width={600}
        onCancel={() => setDialogVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setDialogVisible(false)}>取消</Button>,
          <Button key="save" type="primary" onClick={save}>保存</Button>
        ]}
      >
        <Form labelCol={{ flex: '0 0 100px' }} wrapperCol={{ flex: 'auto' }}>
          <Form.Item label="账号" validateStatus={formErrors.account ? 'error' : ''} help={formErrors.account}>
            <Input value={form.account} onChange={(e) => updateField('account', e.target.value)} />
          </Form.Item>
          <Form.Item label="姓名" validateStatus={formErrors.name ? 'error' : ''} help={formErrors.name}>
            <Input value={form.name} onChange={(e) => updateField('name', e.target.value)} />
          </Form.Item>
          <Form.Item label="角色" validateStatus={formErrors.role ? 'error' : ''} help={formErrors.role}>
            <Select
              style={{ width: '100%' }}
              value={form.role}
              onChange={(value) => updateField('role', value)}
              options={roleOptions}
            />
          </Form.Item>
          <Form.Item label="所属组织" validateStatus={formErrors.org ? 'error' : ''} help={formErrors.org}>
            <Input value={form.org} onChange={(e) => updateField('org', e.target.value)} />
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .admin-users {
          max-width: 1200px;
          margin: 0 auto;
        }
        .admin-users .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
          width: 100%;
        }
      `}</style>
    </div>
  )
}
