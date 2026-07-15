import { useState } from 'react'
import { Alert, Button, Card, Form, Input, Modal, Select, Table, Tag, message } from 'antd'

export default function AdminDictionary() {
  const [dicts] = useState([
    {
      id: 1, name: '采购方式', code: 'purchase_mode', type: '分类', status: '启用',
      children: [
        { id: 11, name: '公开招标', code: 'open', type: '选项', status: '启用' },
        { id: 12, name: '邀请招标', code: 'invitation', type: '选项', status: '启用' },
        { id: 13, name: '公开询比价', code: 'inquiry', type: '选项', status: '启用' },
        { id: 14, name: '单一来源', code: 'single', type: '选项', status: '启用' }
      ]
    },
    {
      id: 2, name: '项目类型', code: 'project_type', type: '分类', status: '启用',
      children: [
        { id: 21, name: '工程', code: 'engineering', type: '选项', status: '启用' },
        { id: 22, name: '货物', code: 'goods', type: '选项', status: '启用' },
        { id: 23, name: '服务', code: 'service', type: '选项', status: '启用' }
      ]
    }
  ])

  const [dialogVisible, setDialogVisible] = useState(false)
  const [form, setForm] = useState({ name: '', code: '', parent: '' })

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const edit = (row) => message.success(`编辑字典：${row.name}`)
  const addChild = (row) => {
    setForm((prev) => ({ ...prev, parent: row.code }))
    setDialogVisible(true)
  }
  const save = () => {
    message.success('字典项已保存')
    setDialogVisible(false)
  }

  const columns = [
    { title: '字典名称', dataIndex: 'name', minWidth: 200 },
    { title: '字典编码', dataIndex: 'code', width: 180 },
    { title: '类型', dataIndex: 'type', width: 120 },
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
      width: 180,
      render: (_, row) => (
        <>
          <Button type="link" onClick={() => edit(row)}>编辑</Button>
          <Button type="link" onClick={() => addChild(row)}>新增子项</Button>
        </>
      )
    }
  ]

  return (
    <div className="admin-dictionary">
      <Card
        title={
          <div className="card-header">
            <span>参数字典</span>
            <Button type="primary" onClick={() => setDialogVisible(true)}>新增字典项</Button>
          </div>
        }
      >
        <Alert
          title="维护项目类型、采购方式、资质类别、标段分类等系统选项，供业务表单统一引用。"
          type="info"
          showIcon
          closable={false}
          style={{ marginBottom: 20 }}
        />
        <Table
          columns={columns}
          dataSource={dicts}
          rowKey="id"
          expandable={{ defaultExpandAllRows: true }}
          pagination={false}
          style={{ width: '100%' }}
        />
      </Card>

      <Modal
        title="新增字典项"
        open={dialogVisible}
        width={600}
        onCancel={() => setDialogVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setDialogVisible(false)}>取消</Button>,
          <Button key="save" type="primary" onClick={save}>保存</Button>
        ]}
      >
        <Form labelCol={{ flex: '0 0 100px' }} wrapperCol={{ flex: 'auto' }}>
          <Form.Item label="字典名称">
            <Input value={form.name} onChange={(e) => updateField('name', e.target.value)} />
          </Form.Item>
          <Form.Item label="字典编码">
            <Input value={form.code} onChange={(e) => updateField('code', e.target.value)} />
          </Form.Item>
          <Form.Item label="所属分类">
            <Select
              style={{ width: '100%' }}
              value={form.parent}
              onChange={(value) => updateField('parent', value)}
              options={[
                { label: '顶层分类', value: '' },
                { label: '采购方式', value: 'purchase' },
                { label: '项目类型', value: 'project' },
                { label: '资质类别', value: 'qualification' }
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .admin-dictionary {
          max-width: 1100px;
          margin: 0 auto;
        }
        .admin-dictionary .card-header {
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
