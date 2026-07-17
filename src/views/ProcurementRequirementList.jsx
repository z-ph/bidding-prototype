import { useEffect, useState, useMemo } from 'react'
import {
  Card,
  Table,
  Button,
  Tag,
  Input,
  Tabs,
  Drawer,
  Form,
  Select,
  InputNumber,
  Space,
  Popconfirm,
  Modal,
  message
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  SettingOutlined,
  SendOutlined
} from '@ant-design/icons'
import {
  requirementStore,
  REQUIREMENT_STATUS_MAP
} from '../data/requirements.js'
import { approvalStore } from '../data/approvalStore.js'
import { messageStore } from '../data/messageStore.js'
import { useRole } from '../hooks/useRole.js'

// 审批接入（清单 48/14/22）：发布改为提交审批，新增「审批中」本地状态（requirements.js 不改动）
const STATUS_MAP = {
  ...REQUIREMENT_STATUS_MAP,
  approving: { label: '审批中', color: 'warning' }
}

const TAB_ITEMS = [
  { key: 'all', label: '全部' },
  { key: 'draft', label: '草稿' },
  { key: 'approving', label: '审批中' },
  { key: 'published', label: '已发布' },
  { key: 'approved', label: '已审核' },
  { key: 'rejected', label: '已驳回' }
]

export default function ProcurementRequirementList() {
  const { role, userName } = useRole()
  const [activeTab, setActiveTab] = useState('all')
  const [keyword, setKeyword] = useState('')
  const [refresh, setRefresh] = useState(0)
  const [editing, setEditing] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [typesOpen, setTypesOpen] = useState(false)
  const [form] = Form.useForm()

  const requirementTypes = requirementStore.getTypes()

  // 发布者类型（清单 14）：招标代理发布 → 采购管理部审核；招标人发布 → 需求部门 → 采购管理部
  const publisherKind = role === 'agent' ? 'agent' : 'self'

  // 页面加载时同步在途审批单结果：通过 → 已发布；驳回 → 已驳回（清单 49/50）
  useEffect(() => {
    const list = requirementStore.getRequirements()
    let changed = false
    list.forEach((req) => {
      if (req.status !== 'approving') return
      const approval =
        (req.approvalId && approvalStore.get(req.approvalId)) ||
        approvalStore.list({ type: 'requirement' }).find((a) => a.refId === req.id)
      if (!approval || approval.status === 'pending') return
      requirementStore.updateStatus(req.id, approval.status === 'approved' ? 'published' : 'rejected')
      changed = true
    })
    if (changed) setRefresh((n) => n + 1)
  }, [])

  const dataSource = useMemo(() => {
    let list = requirementStore.getRequirements()
    if (activeTab !== 'all') {
      list = list.filter((item) => item.status === activeTab)
    }
    if (keyword.trim()) {
      const lower = keyword.trim().toLowerCase()
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(lower) ||
          item.id.toLowerCase().includes(lower) ||
          (item.content && item.content.toLowerCase().includes(lower))
      )
    }
    return list.sort((a, b) => String(b.createTime).localeCompare(String(a.createTime)))
  }, [activeTab, keyword, refresh])

  const openCreate = () => {
    form.resetFields()
    setEditing(null)
    setDrawerOpen(true)
  }

  const openEdit = (record) => {
    form.setFieldsValue({
      id: record.id,
      title: record.title,
      type: record.type,
      budget: record.budget,
      content: record.content,
      status: record.status
    })
    setEditing(record)
    setDrawerOpen(true)
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      requirementStore.saveRequirement({
        ...(editing || {}),
        ...values,
        id: editing?.id || undefined
      })
      message.success(editing ? '需求已更新' : '需求已创建')
      setDrawerOpen(false)
      setRefresh((n) => n + 1)
    } catch {
      // validation failed
    }
  }

  const changeStatus = (record, status) => {
    requirementStore.updateStatus(record.id, status)
    message.success(`需求已${STATUS_MAP[status].label}`)
    setRefresh((n) => n + 1)
  }

  // 发布 = 提交审批（清单 48）：创建审批单后需求置「审批中」，通过/驳回结果由加载时同步回写
  const submitApproval = (record) => {
    const instance = approvalStore.create({
      type: 'requirement',
      refId: record.id,
      title: record.title,
      publisherKind,
      submittedBy: userName,
      projectId: record.projectId || ''
    })
    requirementStore.saveRequirement({ ...record, status: 'approving', approvalId: instance.id })
    messageStore.add({
      toRole: instance.chain[0],
      title: `【审批待办】${record.title}`,
      content: `${userName} 提交了采购需求「${record.title}」发布申请（审批链：${instance.chain.join(' → ')}），请及时审批。`,
      type: 'approval'
    })
    message.success(`已提交审批（${instance.chain.join(' → ')}），审批通过后自动发布`)
    setRefresh((n) => n + 1)
  }

  const handleDelete = (record) => {
    const list = requirementStore.getRequirements().filter((r) => r.id !== record.id)
    requirementStore.saveRequirements(list)
    message.success('需求已删除')
    setRefresh((n) => n + 1)
  }

  const typeLabel = (value) => requirementTypes.find((t) => t.value === value)?.label || value

  const columns = [
    {
      title: '需求编号',
      dataIndex: 'id',
      width: 160
    },
    {
      title: '需求标题',
      dataIndex: 'title',
      ellipsis: true
    },
    {
      title: '需求类型',
      dataIndex: 'type',
      width: 120,
      render: (value) => typeLabel(value)
    },
    {
      title: '预算金额（万元）',
      dataIndex: 'budget',
      width: 150,
      align: 'right'
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (value) => {
        const cfg = STATUS_MAP[value] || { label: value, color: 'default' }
        return <Tag color={cfg.color}>{cfg.label}</Tag>
      }
    },
    {
      title: '发布人',
      dataIndex: 'publisher',
      width: 100
    },
    {
      title: '发布时间',
      dataIndex: 'publishTime',
      width: 120,
      render: (value) => value || '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 260,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>
            编辑
          </Button>
          {(record.status === 'draft' || record.status === 'rejected') && (
            <Button
              type="link"
              size="small"
              icon={<SendOutlined />}
              onClick={() => submitApproval(record)}
            >
              提交审批
            </Button>
          )}
          {record.status === 'approving' && <Tag color="warning">审批中</Tag>}
          {record.status === 'published' && (
            <>
              <Button
                type="link"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => changeStatus(record, 'approved')}
              >
                审核
              </Button>
              <Button
                type="link"
                size="small"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => changeStatus(record, 'rejected')}
              >
                驳回
              </Button>
            </>
          )}
          <Popconfirm
            title="确认删除？"
            description="删除后不可恢复"
            onConfirm={() => handleDelete(record)}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div className="procurement-requirement-list">
      <Card>
        <div className="header-actions">
          <div>
            <h3>采购需求管理</h3>
            <p className="tip">采购需求提交审批通过后方可发布（清单 48）；代理发布由采购管理部审核，招标人发布经需求部门、采购管理部审核（清单 14/22）。</p>
          </div>
          <Space>
            <Button icon={<SettingOutlined />} onClick={() => setTypesOpen(true)}>
              类型管理
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新建需求
            </Button>
          </Space>
        </div>

        <Tabs activeKey={activeTab} items={TAB_ITEMS} onChange={setActiveTab} />

        <Input.Search
          placeholder="搜索需求编号、标题或内容"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onSearch={setKeyword}
          style={{ maxWidth: 360, marginBottom: 16 }}
          allowClear
        />

        <Table
          rowKey="id"
          columns={columns}
          dataSource={dataSource}
          pagination={{ pageSize: 10 }}
          size="small"
        />
      </Card>

      <Drawer
        title={editing ? '编辑采购需求' : '新建采购需求'}
        width={560}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        footer={
          <Space style={{ justifyContent: 'flex-end' }}>
            <Button onClick={() => setDrawerOpen(false)}>取消</Button>
            <Button type="primary" onClick={handleSave}>
              保存
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: 'draft' }}
        >
          {editing && (
            <Form.Item label="需求编号" name="id">
              <Input disabled />
            </Form.Item>
          )}
          <Form.Item
            label="需求标题"
            name="title"
            rules={[{ required: true, message: '请输入需求标题' }]}
          >
            <Input placeholder="请输入需求标题" maxLength={100} showCount />
          </Form.Item>
          <Form.Item
            label="需求类型"
            name="type"
            rules={[{ required: true, message: '请选择需求类型' }]}
          >
            <Select
              placeholder="请选择需求类型"
              options={requirementTypes}
            />
          </Form.Item>
          <Form.Item
            label="预算金额（万元）"
            name="budget"
            rules={[{ required: true, message: '请输入预算金额' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
              placeholder="请输入预算金额"
            />
          </Form.Item>
          <Form.Item
            label="具体需求内容"
            name="content"
            rules={[{ required: true, message: '请输入具体需求内容' }]}
          >
            <Input.TextArea
              rows={6}
              placeholder="描述采购范围、技术要求、服务要求等"
              maxLength={2000}
              showCount
            />
          </Form.Item>
          <Form.Item
            label="当前状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select
              placeholder="请选择状态"
              options={[
                { label: '草稿', value: 'draft' },
                { label: '审批中', value: 'approving' },
                { label: '已发布', value: 'published' },
                { label: '已审核', value: 'approved' },
                { label: '已驳回', value: 'rejected' }
              ]}
            />
          </Form.Item>
          <Form.Item label="发布人" name="publisher">
            <Input placeholder="例如：张三" />
          </Form.Item>
        </Form>
      </Drawer>

      <RequirementTypeModal open={typesOpen} onClose={() => setTypesOpen(false)} />

      <style>{`
        .procurement-requirement-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .header-actions {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }
        .tip {
          color: #666;
          font-size: 13px;
          margin: 4px 0 0;
        }
      `}</style>
    </div>
  )
}

function RequirementTypeModal({ open, onClose }) {
  const [types, setTypes] = useState(requirementStore.getTypes())
  const [keyword, setKeyword] = useState('')

  const handleAdd = () => {
    const value = keyword.trim()
    if (!value) return
    if (types.some((t) => t.value === value || t.label === value)) {
      message.warning('该类型已存在')
      return
    }
    const next = [...types, { value, label: value }]
    setTypes(next)
    requirementStore.saveTypes(next)
    setKeyword('')
  }

  const handleDelete = (value) => {
    const next = types.filter((t) => t.value !== value)
    setTypes(next)
    requirementStore.saveTypes(next)
  }

  return (
    <Modal
      title="需求类型管理"
      open={open}
      onCancel={onClose}
      footer={
        <Button type="primary" onClick={onClose}>
          完成
        </Button>
      }
    >
      <Space.Compact style={{ width: '100%', marginBottom: 16 }}>
        <Input
          placeholder="输入新类型名称"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onPressEnter={handleAdd}
        />
        <Button type="primary" onClick={handleAdd}>
          添加
        </Button>
      </Space.Compact>
      <div className="type-list">
        {types.map((t) => (
          <div key={t.value} className="type-item">
            <span>{t.label}</span>
            <Button type="link" danger size="small" onClick={() => handleDelete(t.value)}>
              删除
            </Button>
          </div>
        ))}
      </div>
      <style>{`
        .type-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .type-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: #f5f5f5;
          border-radius: 4px;
        }
      `}</style>
    </Modal>
  )
}
