import { useState } from 'react'
import { Alert, Button, Card, Table, Tabs, Tag, message } from 'antd'

export default function AdminSupplierAudit() {
  const [activeTab, setActiveTab] = useState('supplier')

  const [suppliers, setSuppliers] = useState([
    { companyName: 'D科技有限公司', creditCode: '91440300XXXXXXXX', contactName: '王五', phone: '13800138000', applyTime: '2026-07-08 09:00', status: '待审核' },
    { companyName: 'E实业有限公司', creditCode: '91440300YYYYYYYY', contactName: '赵六', phone: '13900139000', applyTime: '2026-07-07 16:00', status: '已通过' }
  ])

  const [experts, setExperts] = useState([
    { name: '专家丁', idCard: '110101XXXXXXXX0011', field: '土木工程', phone: '13700137000', applyTime: '2026-07-08 10:00', status: '待审核' }
  ])

  const statusColor = (s) => {
    const map = { 待审核: 'warning', 已通过: 'success', 已驳回: 'error' }
    return map[s] || 'default'
  }

  const updateRow = (setter, row, status) => {
    setter((prev) => prev.map((item) => (item === row ? { ...item, status } : item)))
  }

  const view = (row) => message.success(`查看详情：${row.companyName || row.name}`)
  const approve = (row) => {
    updateRow(row.companyName ? setSuppliers : setExperts, row, '已通过')
    message.success('审核已通过')
  }
  const reject = (row) => {
    updateRow(row.companyName ? setSuppliers : setExperts, row, '已驳回')
    message.success('已驳回，原因：资质材料不完整')
  }

  const supplierColumns = [
    { title: '企业名称', dataIndex: 'companyName', minWidth: 220 },
    { title: '统一社会信用代码', dataIndex: 'creditCode', width: 200 },
    { title: '联系人', dataIndex: 'contactName', width: 120 },
    { title: '手机号', dataIndex: 'phone', width: 140 },
    { title: '申请时间', dataIndex: 'applyTime', width: 160 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status) => <Tag color={statusColor(status)}>{status}</Tag>
    },
    {
      title: '操作',
      width: 200,
      fixed: 'right',
      render: (_, row) => (
        <>
          <Button type="link" onClick={() => view(row)}>查看</Button>
          {row.status === '待审核' && (
            <Button type="link" style={{ color: '#67C23A' }} onClick={() => approve(row)}>通过</Button>
          )}
          {row.status === '待审核' && (
            <Button type="link" danger onClick={() => reject(row)}>驳回</Button>
          )}
        </>
      )
    }
  ]

  const expertColumns = [
    { title: '姓名', dataIndex: 'name', width: 120 },
    { title: '身份证号', dataIndex: 'idCard', width: 180 },
    { title: '专业领域', dataIndex: 'field', width: 150 },
    { title: '手机号', dataIndex: 'phone', width: 140 },
    { title: '申请时间', dataIndex: 'applyTime', width: 160 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status) => <Tag color={statusColor(status)}>{status}</Tag>
    },
    {
      title: '操作',
      width: 200,
      fixed: 'right',
      render: (_, row) => (
        <>
          <Button type="link" onClick={() => view(row)}>查看</Button>
          {row.status === '待审核' && (
            <Button type="link" style={{ color: '#67C23A' }} onClick={() => approve(row)}>通过</Button>
          )}
          {row.status === '待审核' && (
            <Button type="link" danger onClick={() => reject(row)}>驳回</Button>
          )}
        </>
      )
    }
  ]

  const tabItems = [
    {
      key: 'supplier',
      label: '供应商审核',
      children: (
        <Table
          columns={supplierColumns}
          dataSource={suppliers}
          rowKey="companyName"
          pagination={false}
          style={{ width: '100%' }}
        />
      )
    },
    {
      key: 'expert',
      label: '专家审核',
      children: (
        <Table
          columns={expertColumns}
          dataSource={experts}
          rowKey="name"
          pagination={false}
          style={{ width: '100%' }}
        />
      )
    }
  ]

  return (
    <div className="admin-supplier-audit">
      <Card
        title={
          <div className="card-header">
            <span>供应商/专家准入审核</span>
          </div>
        }
      >
        <Alert
          message="审核通过后的供应商/专家方可参与平台业务；驳回时可填写原因，申请人可修改后重新提交。"
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
        .admin-supplier-audit {
          max-width: 1200px;
          margin: 0 auto;
        }
        .admin-supplier-audit .card-header {
          font-weight: bold;
        }
      `}</style>
    </div>
  )
}
