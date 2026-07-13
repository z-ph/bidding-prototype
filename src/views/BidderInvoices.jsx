import { useState } from 'react'
import { Alert, Button, Card, Form, Input, Modal, Radio, Select, Table, Tag, message } from 'antd'

export default function BidderInvoices() {
  const [dialogVisible, setDialogVisible] = useState(false)

  const [invoices] = useState([
    { project: 'XX市轨道交通设备采购项目', feeType: '招标文件费', amount: 500, type: '增值税普通发票', status: '已开票' },
    { project: '办公桌椅采购项目', feeType: '招标文件费', amount: 300, type: '增值税普通发票', status: '审核中' }
  ])

  const [form, setForm] = useState({
    feeId: '',
    type: '增值税普通发票',
    title: '',
    taxNo: ''
  })

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const statusColor = (s) => {
    const map = { 审核中: 'warning', 已开票: 'success', 已驳回: 'error' }
    return map[s] || 'default'
  }

  const download = (row) => {
    message.success(`下载电子发票：${row.project}`)
  }

  const submit = () => {
    message.success('发票申请已提交')
    setDialogVisible(false)
  }

  const columns = [
    { title: '关联项目', dataIndex: 'project', key: 'project', minWidth: 260 },
    { title: '费用类型', dataIndex: 'feeType', key: 'feeType', width: 140 },
    { title: '开票金额', dataIndex: 'amount', key: 'amount', width: 120 },
    { title: '发票类型', dataIndex: 'type', key: 'type', width: 120 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => <Tag color={statusColor(status)}>{status}</Tag>
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, row) =>
        row.status === '已开票' && (
          <Button type="link" onClick={() => download(row)}>下载</Button>
        )
    }
  ]

  return (
    <div className="bidder-invoices">
      <Card
        title={
          <div className="card-header">
            <span>发票申请</span>
            <Button type="primary" onClick={() => setDialogVisible(true)}>申请发票</Button>
          </div>
        }
      >
        <Alert
          message="仅对已缴纳且审核通过的费用申请发票，开票后可在列表下载电子发票。"
          type="info"
          showIcon
          closable={false}
          style={{ marginBottom: 20 }}
        />
        <Table
          columns={columns}
          dataSource={invoices}
          rowKey="project"
          pagination={false}
          style={{ width: '100%' }}
        />
      </Card>

      <Modal
        title="申请发票"
        open={dialogVisible}
        width={600}
        onCancel={() => setDialogVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setDialogVisible(false)}>取消</Button>,
          <Button key="submit" type="primary" onClick={submit}>提交申请</Button>
        ]}
      >
        <Form labelCol={{ flex: '0 0 100px' }} wrapperCol={{ flex: 'auto' }}>
          <Form.Item label="关联费用">
            <Select
              value={form.feeId || undefined}
              onChange={(value) => updateField('feeId', value)}
              placeholder="请选择已缴纳费用"
              style={{ width: '100%' }}
              options={[{ label: 'XX市轨道交通设备采购项目-招标文件费 500元', value: '1' }]}
            />
          </Form.Item>
          <Form.Item label="发票类型">
            <Radio.Group
              value={form.type}
              onChange={(e) => updateField('type', e.target.value)}
            >
              <Radio value="增值税普通发票">增值税普通发票</Radio>
              <Radio value="增值税专用发票">增值税专用发票</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="开票抬头">
            <Input
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="请输入发票抬头"
            />
          </Form.Item>
          <Form.Item label="纳税人识别号">
            <Input
              value={form.taxNo}
              onChange={(e) => updateField('taxNo', e.target.value)}
              placeholder="请输入税号"
            />
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .bidder-invoices {
          max-width: 1100px;
          margin: 0 auto;
        }
        .bidder-invoices .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
        }
      `}</style>
    </div>
  )
}
