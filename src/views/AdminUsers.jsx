import { useState } from 'react'
import { Alert, Button, Card, Col, Form, Input, Modal, Row, Select, Table, Tag, message } from 'antd'

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
  const [users, setUsers] = useState([
    { account: 'admin', name: '平台管理员', role: '平台管理员', org: '平台运营部', status: '启用' },
    { account: 'tenderee01', name: '张三', role: '招标人', org: 'XX市轨道交通集团', status: '启用' },
    { account: 'agent01', name: '李四', role: '招标代理', org: 'XX招标代理有限公司', status: '启用' },
    { account: 'bidder01', name: 'A科技有限公司', role: '投标人', org: 'A科技有限公司', status: '启用' },
    { account: 'expert01', name: '专家甲', role: '评标专家', org: '个人', status: '启用' }
  ])

  const [dialogVisible, setDialogVisible] = useState(false)
  const [form, setForm] = useState({ account: '', name: '', role: undefined, org: '' })

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const load = () => message.success('查询用户')
  const edit = (row) => message.success(`编辑：${row.name}`)
  const setPermission = (row) => message.success(`配置 ${row.name} 的菜单权限`)
  const toggleStatus = (row) => {
    setUsers((prev) =>
      prev.map((user) =>
        user === row ? { ...user, status: user.status === '启用' ? '禁用' : '启用' } : user
      )
    )
  }
  const save = () => {
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
      render: (_, row) => (
        <>
          <Button type="link" onClick={() => edit(row)}>编辑</Button>
          <Button type="link" onClick={() => setPermission(row)}>权限</Button>
          <Button type="link" danger onClick={() => toggleStatus(row)}>
            {row.status === '启用' ? '禁用' : '启用'}
          </Button>
        </>
      )
    }
  ]

  return (
    <div className="admin-users">
      <Card
        title={
          <div className="card-header">
            <span>用户与权限</span>
            <Button type="primary" onClick={() => setDialogVisible(true)}>新增用户</Button>
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
          <Form.Item label="账号">
            <Input value={form.account} onChange={(e) => updateField('account', e.target.value)} />
          </Form.Item>
          <Form.Item label="姓名">
            <Input value={form.name} onChange={(e) => updateField('name', e.target.value)} />
          </Form.Item>
          <Form.Item label="角色">
            <Select
              style={{ width: '100%' }}
              value={form.role}
              onChange={(value) => updateField('role', value)}
              options={roleOptions}
            />
          </Form.Item>
          <Form.Item label="所属组织">
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
