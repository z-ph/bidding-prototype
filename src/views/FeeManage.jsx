import { useState } from 'react'
import { Alert, Button, Card, Table, Tabs, Tag, message } from 'antd'

export default function FeeManage() {
  const [activeTab, setActiveTab] = useState('pending')

  const [pendingFees, setPendingFees] = useState([
    { project: 'XX市轨道交通设备采购项目', bidder: 'A科技有限公司', type: '投标保证金', amount: '50,000', payMode: '线下转账', status: '待审核' },
    { project: '办公桌椅采购项目', bidder: 'B实业有限公司', type: '招标文件费', amount: '300', payMode: '线下转账', status: '待审核' }
  ])

  const [paidFees] = useState([
    { project: 'XX市轨道交通设备采购项目', bidder: 'A科技有限公司', type: '招标文件费', amount: '500', payTime: '2026-07-05 10:00' }
  ])

  const updateStatus = (row, status) => {
    setPendingFees((prev) => prev.map((item) => (item === row ? { ...item, status } : item)))
  }

  const approve = (row) => {
    updateStatus(row, '已通过')
    message.success('审核通过')
  }
  const reject = (row) => {
    updateStatus(row, '已驳回')
    message.success('已驳回')
  }
  const refund = (row) => {
    message.success(`退还 ${row.bidder} 的 ${row.type}`)
  }

  const pendingColumns = [
    { title: '关联项目', dataIndex: 'project', minWidth: 240 },
    { title: '缴纳人', dataIndex: 'bidder', width: 180 },
    { title: '费用类型', dataIndex: 'type', width: 140 },
    { title: '金额', dataIndex: 'amount', width: 120 },
    { title: '缴纳方式', dataIndex: 'payMode', width: 120 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status) => <Tag color="warning">{status}</Tag>
    },
    {
      title: '操作',
      width: 180,
      fixed: 'right',
      render: (_, row) => (
        <>
          <Button type="link" style={{ color: '#67C23A' }} onClick={() => approve(row)}>通过</Button>
          <Button type="link" danger onClick={() => reject(row)}>驳回</Button>
        </>
      )
    }
  ]

  const paidColumns = [
    { title: '关联项目', dataIndex: 'project', minWidth: 240 },
    { title: '缴纳人', dataIndex: 'bidder', width: 180 },
    { title: '费用类型', dataIndex: 'type', width: 140 },
    { title: '金额', dataIndex: 'amount', width: 120 },
    { title: '到账时间', dataIndex: 'payTime', width: 180 },
    {
      title: '操作',
      width: 120,
      render: (_, row) => (
        <Button type="link" onClick={() => refund(row)}>退还</Button>
      )
    }
  ]

  const rowKey = (row) => `${row.project}-${row.bidder}-${row.type}`

  const tabItems = [
    {
      key: 'pending',
      label: '待审核',
      children: (
        <Table
          columns={pendingColumns}
          dataSource={pendingFees}
          rowKey={rowKey}
          pagination={false}
          style={{ width: '100%' }}
        />
      )
    },
    {
      key: 'paid',
      label: '已缴纳',
      children: (
        <Table
          columns={paidColumns}
          dataSource={paidFees}
          rowKey={rowKey}
          pagination={false}
          style={{ width: '100%' }}
        />
      )
    }
  ]

  return (
    <div className="fee-manage">
      <Card
        title={
          <div className="card-header">
            <span>费用管理</span>
          </div>
        }
      >
        <Alert
          message="管理招标文件费、保证金、平台使用费的缴纳、审核、退还记录。线上支付自动到账，线下转账需人工审核。"
          type="info"
          showIcon
          closable={false}
          style={{ marginBottom: 20 }}
        />
        <Tabs
          type="card"
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Card>

      <style>{`
        .fee-manage {
          max-width: 1200px;
          margin: 0 auto;
        }
        .fee-manage .card-header {
          font-weight: bold;
        }
      `}</style>
    </div>
  )
}
