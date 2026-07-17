import { useState } from 'react'
import { Alert, Button, Card, Form, Input, Modal, Table, Tag, message } from 'antd'

// 2026-07-17 新口径（清单 26、概要七）：保证金/文件费不要求缴纳、不实现支付功能；
// 采购结果发布后由中标人线下缴纳投标费用，本页仅作登记台账（登记凭证），无在线缴费与缴费审核。
const FEE_TYPE = '投标费用'

export default function FeeManage() {
  const [records, setRecords] = useState([
    {
      id: 1,
      project: '软件开发服务项目',
      winner: 'A科技有限公司',
      type: FEE_TYPE,
      amount: '3,000',
      status: '已缴',
      voucherNo: 'PZ20260715001',
      registeredAt: '2026-07-16 10:30'
    },
    {
      id: 2,
      project: 'XX市轨道交通设备采购项目',
      winner: 'B实业有限公司',
      type: FEE_TYPE,
      amount: '5,000',
      status: '未缴',
      voucherNo: '',
      registeredAt: '2026-07-17 09:10'
    }
  ])

  const [registerVisible, setRegisterVisible] = useState(false)
  const [payTarget, setPayTarget] = useState(null)
  const [form] = Form.useForm()

  const openRegister = () => {
    setPayTarget(null)
    form.resetFields()
    setRegisterVisible(true)
  }

  const openMarkPaid = (row) => {
    setPayTarget(row)
    form.setFieldsValue({
      project: row.project,
      winner: row.winner,
      amount: row.amount,
      voucherNo: row.voucherNo || ''
    })
    setRegisterVisible(true)
  }

  const submitRegister = async () => {
    const values = await form.validateFields().catch(() => null)
    if (!values) return
    if (payTarget) {
      // 标记已缴：补录凭证号，缴费状态置为已缴
      setRecords((prev) =>
        prev.map((item) =>
          item.id === payTarget.id
            ? { ...item, status: '已缴', voucherNo: values.voucherNo }
            : item
        )
      )
      message.success(`已登记 ${payTarget.winner} 的缴费凭证，状态更新为已缴`)
    } else {
      setRecords((prev) => [
        {
          id: Date.now(),
          project: values.project,
          winner: values.winner,
          type: FEE_TYPE,
          amount: values.amount,
          status: '未缴',
          voucherNo: '',
          registeredAt: new Date().toLocaleString()
        },
        ...prev
      ])
      message.success('已登记中标人投标费用（待线下收缴）')
    }
    setRegisterVisible(false)
    setPayTarget(null)
    form.resetFields()
  }

  const columns = [
    { title: '关联项目', dataIndex: 'project', minWidth: 220 },
    { title: '中标人', dataIndex: 'winner', width: 180 },
    { title: '费用类型', dataIndex: 'type', width: 110 },
    { title: '金额（元）', dataIndex: 'amount', width: 110 },
    {
      title: '缴费状态',
      dataIndex: 'status',
      width: 100,
      render: (status) => <Tag color={status === '已缴' ? 'success' : 'warning'}>{status}</Tag>
    },
    { title: '凭证号', dataIndex: 'voucherNo', width: 150, render: (v) => v || '-' },
    { title: '登记时间', dataIndex: 'registeredAt', width: 170 },
    {
      title: '操作',
      width: 130,
      fixed: 'right',
      render: (_, row) =>
        row.status === '未缴' ? (
          <Button type="link" onClick={() => openMarkPaid(row)}>登记缴费凭证</Button>
        ) : null
    }
  ]

  return (
    <div className="fee-manage">
      <Card
        title={
          <div className="card-header">
            <span>费用台账（中标人投标费用登记）</span>
            <Button type="primary" onClick={openRegister}>登记</Button>
          </div>
        }
      >
        <Alert
          title="按 2026-07-17 新口径（清单 26、概要七）：保证金、文件费不要求缴纳，平台不实现在线支付。采购结果发布后，由中标人线下缴纳投标费用，本页仅登记台账与缴费凭证。"
          type="info"
          showIcon
          closable={false}
          style={{ marginBottom: 20 }}
        />
        <Table
          columns={columns}
          dataSource={records}
          rowKey="id"
          pagination={false}
          style={{ width: '100%' }}
        />
      </Card>

      <Modal
        title={payTarget ? '登记缴费凭证' : '登记中标人投标费用'}
        open={registerVisible}
        width={520}
        onOk={submitRegister}
        onCancel={() => {
          setRegisterVisible(false)
          setPayTarget(null)
        }}
        okText={payTarget ? '确认登记' : '登记'}
        cancelText="取消"
      >
        <Form form={form} layout="horizontal" labelCol={{ flex: '110px' }}>
          <Form.Item
            label="关联项目"
            name="project"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="采购结果已发布的项目" disabled={Boolean(payTarget)} />
          </Form.Item>
          <Form.Item
            label="中标人"
            name="winner"
            rules={[{ required: true, message: '请输入中标人名称' }]}
          >
            <Input placeholder="中标人（供应商）名称" disabled={Boolean(payTarget)} />
          </Form.Item>
          <Form.Item label="费用类型">
            <Input value={FEE_TYPE} disabled />
          </Form.Item>
          <Form.Item
            label="金额（元）"
            name="amount"
            rules={[{ required: true, message: '请输入金额' }]}
          >
            <Input placeholder="投标费用金额" disabled={Boolean(payTarget)} />
          </Form.Item>
          {payTarget && (
            <Form.Item
              label="凭证号"
              name="voucherNo"
              rules={[{ required: true, message: '请输入线下收缴凭证号' }]}
            >
              <Input placeholder="线下收缴的凭证号" />
            </Form.Item>
          )}
        </Form>
      </Modal>

      <style>{`
        .fee-manage {
          max-width: 1200px;
          margin: 0 auto;
        }
        .fee-manage .card-header {
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
