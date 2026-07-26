// @ts-nocheck — TS 渐进迁移基线：解冻本文件时删除本行并修复类型（见 AGENTS.md 技术栈）
import { useState, useMemo } from 'react'
import { Alert, Button, Card, Col, Drawer, Form, Input, Modal, Row, Select, Table, Tag, message } from 'antd'
import { getSuppliers, getSupplier, updateSupplier, updateSupplierStatus } from '../data/supplierStore'
import { projectStore } from '../data/projects.js'
import { useRole } from '../hooks/useRole.js'

const SUPPLIER_TYPE_OPTIONS = [
  { label: '材料供应商', value: '材料供应商' },
  { label: '劳务供应商', value: '劳务供应商' },
  { label: '服务供应商', value: '服务供应商' }
]

const STATUS_OPTIONS = [
  { label: '已认证', value: '已认证' },
  { label: '待审核', value: '待审核' }
]

const PROJECT_NAMES = {
  '1': 'XX市轨道交通设备采购项目',
  '2': '物业保洁服务采购项目',
  '3': 'XX大学实验室设备采购项目',
  '4': '物业服务采购项目',
  '5': '轨道交通电缆材料采购项目'
}

/**
 * 从 projectStore 解析项目名，优先 store，写死的常量作为兜底。
 * 演示原型直接展示；生产环境应统一走 store。
 */
const resolveProjectName = (pid) => {
  const p = projectStore.getProjectById(pid)
  return p?.name || PROJECT_NAMES[pid] || `项目 ${pid}`
}

export default function SupplierLedger() {
  const { role } = useRole()
  // admin 角色可审核和编辑，tenderee/agent 仅查看
  const isAdmin = role === 'admin'

  const [suppliers, setSuppliers] = useState(() => getSuppliers())
  const [search, setSearch] = useState({ keyword: '', type: undefined, status: undefined })
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [currentSupplier, setCurrentSupplier] = useState(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editForm] = Form.useForm()

  // 搜索筛选后的列表
  const filteredList = useMemo(() => {
    return suppliers.filter((s) => {
      if (search.keyword) {
        const kw = search.keyword.toLowerCase()
        if (!s.name.toLowerCase().includes(kw) && !s.creditCode.toLowerCase().includes(kw)) {
          return false
        }
      }
      if (search.type && s.type !== search.type) return false
      if (search.status && s.status !== search.status) return false
      return true
    })
  }, [suppliers, search])

  // 刷新列表数据
  const refresh = () => {
    setSuppliers(getSuppliers())
  }

  // 打开详情 Drawer
  const openDetail = (record) => {
    const full = getSupplier(record.id)
    setCurrentSupplier(full)
    setDrawerOpen(true)
  }

  // 打开编辑弹窗（管理员）
  const openEdit = (record) => {
    const full = getSupplier(record.id)
    setCurrentSupplier(full)
    editForm.setFieldsValue({
      name: full.name,
      creditCode: full.creditCode,
      contact: full.contact,
      phone: full.phone,
      type: full.type
    })
    setEditOpen(true)
  }

  // 提交编辑
  const submitEdit = async () => {
    const values = await editForm.validateFields().catch(() => null)
    if (!values) return
    updateSupplier(currentSupplier.id, values)
    setCurrentSupplier({ ...currentSupplier, ...values })
    message.success('供应商信息已更新')
    setEditOpen(false)
    refresh()
  }

  // 审核确认（管理员：待审核→已认证）
  const requestAudit = (record) => {
    Modal.confirm({
      title: '确认审核供应商',
      content: `确定将「${record.name}」的认证状态从「待审核」更新为「已认证」吗？`,
      okText: '确认认证',
      cancelText: '取消',
      onOk: () => {
        updateSupplierStatus(record.id, '已认证')
        message.success(`已将「${record.name}」认证为已认证`)
        refresh()
        // 如果详情 Drawer 打开的正是该供应商，同步更新状态
        if (currentSupplier?.id === record.id) {
          setCurrentSupplier((prev) => (prev ? { ...prev, status: '已认证' } : prev))
        }
      }
    })
  }

  const columns = [
    { title: '供应商编号', dataIndex: 'id', width: 100 },
    { title: '供应商名称', dataIndex: 'name', minWidth: 180 },
    { title: '统一社会信用代码', dataIndex: 'creditCode', width: 180 },
    { title: '供应商类型', dataIndex: 'type', width: 120 },
    { title: '联系人', dataIndex: 'contact', width: 100 },
    { title: '联系电话', dataIndex: 'phone', width: 130 },
    {
      title: '认证状态',
      dataIndex: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === '已认证' ? 'success' : 'warning'}>{status}</Tag>
      )
    },
    { title: '注册日期', dataIndex: 'registerDate', width: 110 },
    {
      title: '操作',
      width: isAdmin ? 220 : 120,
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => openDetail(record)}>查看详情</Button>
          {isAdmin && record.status === '待审核' && (
            <Button type="link" onClick={() => requestAudit(record)}>审核</Button>
          )}
          {isAdmin && (
            <Button type="link" onClick={() => openEdit(record)}>编辑信息</Button>
          )}
        </>
      )
    }
  ]

  return (
    <div className="supplier-ledger">
      <Card
        title={
          <div className="card-header">
            <span>供应商台账</span>
          </div>
        }
      >
        <Alert
          title="查看和管理系统内注册的全部供应商信息。采购单位与采购代理可查看供应商台账，平台管理员可审核认证状态并编辑供应商信息。"
          type="info"
          showIcon
          closable={false}
          style={{ marginBottom: 20 }}
        />
        <Row gutter={20} style={{ marginBottom: 20 }}>
          <Col span={6}>
            <Input
              placeholder="供应商名称/统一社会信用代码"
              allowClear
              value={search.keyword}
              onChange={(e) => setSearch((prev) => ({ ...prev, keyword: e.target.value }))}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="供应商类型"
              allowClear
              style={{ width: '100%' }}
              value={search.type}
              onChange={(value) => setSearch((prev) => ({ ...prev, type: value }))}
              options={SUPPLIER_TYPE_OPTIONS}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="认证状态"
              allowClear
              style={{ width: '100%' }}
              value={search.status}
              onChange={(value) => setSearch((prev) => ({ ...prev, status: value }))}
              options={STATUS_OPTIONS}
            />
          </Col>
          <Col span={4}>
            <Button
              onClick={() => setSearch({ keyword: '', type: undefined, status: undefined })}
            >
              重置
            </Button>
          </Col>
        </Row>
        <Table
          columns={columns}
          dataSource={filteredList}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
          style={{ width: '100%' }}
        />
      </Card>

      <Drawer
        title={`供应商详情 - ${currentSupplier?.name || ''}`}
        open={drawerOpen}
        width={560}
        onClose={() => setDrawerOpen(false)}
      >
        {currentSupplier && (
          <>
            <h4 style={{ marginBottom: 12 }}>基本信息</h4>
            <table className="detail-table">
              <tbody>
                <tr><td className="label">供应商编号</td><td>{currentSupplier.id}</td></tr>
                <tr><td className="label">供应商名称</td><td>{currentSupplier.name}</td></tr>
                <tr><td className="label">统一社会信用代码</td><td>{currentSupplier.creditCode}</td></tr>
                <tr><td className="label">供应商类型</td><td>{currentSupplier.type}</td></tr>
                <tr><td className="label">联系人</td><td>{currentSupplier.contact}</td></tr>
                <tr><td className="label">联系电话</td><td>{currentSupplier.phone}</td></tr>
                <tr>
                  <td className="label">认证状态</td>
                  <td><Tag color={currentSupplier.status === '已认证' ? 'success' : 'warning'}>{currentSupplier.status}</Tag></td>
                </tr>
                <tr><td className="label">注册日期</td><td>{currentSupplier.registerDate}</td></tr>
              </tbody>
            </table>

            <h4 style={{ margin: '20px 0 12px' }}>关联项目</h4>
            {currentSupplier.projects && currentSupplier.projects.length > 0 ? (
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                {currentSupplier.projects.map((pid) => (
                  <li key={pid}>{resolveProjectName(pid)}</li>
                ))}
              </ul>
            ) : (
              <span style={{ color: '#999' }}>暂无关联项目</span>
            )}

            <h4 style={{ margin: '20px 0 12px' }}>资质文件</h4>
            <span style={{ color: '#999' }}>请在供应商企业档案中查看完整资质文件。</span>
          </>
        )}
      </Drawer>

      <Modal
        title="编辑供应商信息"
        open={editOpen}
        width={520}
        onOk={submitEdit}
        onCancel={() => {
          setEditOpen(false)
          editForm.resetFields()
        }}
        okText="保存"
        cancelText="取消"
        destroyOnClose
      >
        <Form
          form={editForm}
          layout="horizontal"
          labelCol={{ flex: '120px' }}
        >
          <Form.Item
            label="供应商名称"
            name="name"
            rules={[{ required: true, message: '请输入供应商名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="统一社会信用代码"
            name="creditCode"
            rules={[{ required: true, message: '请输入统一社会信用代码' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="联系人"
            name="contact"
            rules={[{ required: true, message: '请输入联系人' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="联系电话"
            name="phone"
            rules={[{ required: true, message: '请输入联系电话' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="供应商类型"
            name="type"
            rules={[{ required: true, message: '请选择供应商类型' }]}
          >
            <Select options={SUPPLIER_TYPE_OPTIONS} />
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .supplier-ledger {
          max-width: 1200px;
          margin: 0 auto;
        }
        .supplier-ledger .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
          width: 100%;
        }
        .supplier-ledger .detail-table {
          width: 100%;
          border-collapse: collapse;
        }
        .supplier-ledger .detail-table td {
          padding: 8px 12px;
          border-bottom: 1px solid #f0f0f0;
        }
        .supplier-ledger .detail-table td.label {
          width: 140px;
          color: #666;
          font-weight: 500;
          background: #fafafa;
        }
      `}</style>
    </div>
  )
}
