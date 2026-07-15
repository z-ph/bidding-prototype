import { useEffect, useState } from 'react'
import { Alert, Button, Card, Input, Modal, Table, Tabs, Tag, message } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'

const SUPPLIER_AUDIT_KEY = 'bidding-admin-supplier-audit'
const EXPERT_AUDIT_KEY = 'bidding-admin-expert-audit'
const REGISTRATION_KEY = 'bidding-registration'
const ADMISSION_KEY = 'bidding-admission-status'

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

const defaultSuppliers = [
  { companyName: 'D科技有限公司', creditCode: '91440300XXXXXXXX', contactName: '王五', phone: '13800138000', applyTime: '2026-07-08 09:00', status: '待审核', reason: '' },
  { companyName: 'E实业有限公司', creditCode: '91440300YYYYYYYY', contactName: '赵六', phone: '13900139000', applyTime: '2026-07-07 16:00', status: '已通过', reason: '' }
]

const defaultExperts = [
  { name: '专家丁', idCard: '110101XXXXXXXX0011', field: '土木工程', phone: '13700137000', applyTime: '2026-07-08 10:00', status: '待审核', reason: '' }
]

const statusColor = (s) => {
  const map = { 待审核: 'warning', 审核中: 'warning', 已通过: 'success', 已驳回: 'error', 已退回: 'error' }
  return map[s] || 'default'
}

export default function AdminSupplierAudit() {
  const [activeTab, setActiveTab] = useState('supplier')
  const [suppliers, setSuppliers] = useState(() => readJson(SUPPLIER_AUDIT_KEY, defaultSuppliers))
  const [experts, setExperts] = useState(() => readJson(EXPERT_AUDIT_KEY, defaultExperts))

  useEffect(() => {
    writeJson(SUPPLIER_AUDIT_KEY, suppliers)
  }, [suppliers])

  useEffect(() => {
    writeJson(EXPERT_AUDIT_KEY, experts)
  }, [experts])

  // Sync first supplier row with registration/admission status if present
  useEffect(() => {
    const registration = readJson(REGISTRATION_KEY, null)
    if (!registration) return
    const admission = readJson(ADMISSION_KEY, { status: 'draft', reason: '' })
    // Keep registration status in sync with admission status for the submitting account
    if (registration.status !== admission.status || registration.reason !== admission.reason) {
      const next = { ...registration, status: admission.status, reason: admission.reason || '' }
      writeJson(REGISTRATION_KEY, next)
    }
  }, [suppliers])

  const syncRegistrationStatus = (status, reason = '') => {
    const registration = readJson(REGISTRATION_KEY, null)
    if (registration) {
      const next = { ...registration, status, reason }
      writeJson(REGISTRATION_KEY, next)
    }
    writeJson(ADMISSION_KEY, { status, reason, reviewedAt: new Date().toISOString() })
  }

  const updateRow = (setter, row, status, reason = '') => {
    setter((prev) => prev.map((item) => (item === row ? { ...item, status, reason } : item)))
  }

  const view = (row) => message.success(`查看详情：${row.companyName || row.name}`)

  const approve = (row, setter) => {
    Modal.confirm({
      title: '确认通过审核？',
      icon: <ExclamationCircleOutlined />,
      content: `${row.companyName || row.name} 的资料将被标记为已通过。`,
      onOk: () => {
        updateRow(setter, row, '已通过')
        if (row.companyName) syncRegistrationStatus('已通过')
        message.success('审核已通过')
      }
    })
  }

  const reject = (row, setter) => {
    let reason = ''
    Modal.confirm({
      title: '驳回申请',
      icon: <ExclamationCircleOutlined />,
      content: (
        <Input.TextArea
          rows={3}
          placeholder="请输入驳回原因"
          onChange={(e) => { reason = e.target.value }}
        />
      ),
      onOk: () => {
        if (!reason.trim()) {
          message.error('请输入驳回原因')
          return Promise.reject(new Error('原因不能为空'))
        }
        updateRow(setter, row, '已驳回', reason)
        if (row.companyName) syncRegistrationStatus('已驳回', reason)
        message.success('已驳回')
      }
    })
  }

  const returnForModification = (row, setter) => {
    let reason = ''
    Modal.confirm({
      title: '退回修改',
      icon: <ExclamationCircleOutlined />,
      content: (
        <Input.TextArea
          rows={3}
          placeholder="请输入退回修改原因"
          onChange={(e) => { reason = e.target.value }}
        />
      ),
      onOk: () => {
        if (!reason.trim()) {
          message.error('请输入退回原因')
          return Promise.reject(new Error('原因不能为空'))
        }
        updateRow(setter, row, '已退回', reason)
        if (row.companyName) syncRegistrationStatus('已退回', reason)
        message.success('已退回修改')
      }
    })
  }

  const renderActions = (row, setter) => {
    if (row.status !== '待审核' && row.status !== '审核中') {
      return (
        <>
          <Button type="link" onClick={() => view(row)}>查看</Button>
          {row.reason && <span style={{ color: '#ff4d4f' }}>原因：{row.reason}</span>}
        </>
      )
    }
    return (
      <>
        <Button type="link" onClick={() => view(row)}>查看</Button>
        <Button type="link" style={{ color: '#67C23A' }} onClick={() => approve(row, setter)}>通过</Button>
        <Button type="link" danger onClick={() => reject(row, setter)}>驳回</Button>
        <Button type="link" onClick={() => returnForModification(row, setter)}>退回修改</Button>
      </>
    )
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
      width: 320,
      fixed: 'right',
      render: (_, row) => renderActions(row, setSuppliers)
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
      width: 320,
      fixed: 'right',
      render: (_, row) => renderActions(row, setExperts)
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
          title="审核通过后的供应商/专家方可参与平台业务；驳回或退回修改时需填写原因，申请人可查看原因并重新提交。"
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
