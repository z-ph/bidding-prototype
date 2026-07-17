// 审批流配置（清单 55）：仅招标人（采购管理部）可新建/修改/启停/发布；
// 其他角色进入为只读并给出提示。发布后新提交的单据按新链流转；
// 停用或未发布的流程不作用于新发起的审批单；不按采购方式区分审批流（清单 51）。
import { useMemo, useState } from 'react'
import {
  Alert,
  AutoComplete,
  Button,
  Card,
  Drawer,
  Empty,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  message
} from 'antd'
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined
} from '@ant-design/icons'
import { useRole } from '../hooks/useRole.js'
import { approvalStore } from '../data/approvalStore.js'

const FLOW_STATUS_MAP = {
  draft: { label: '未发布', color: 'default' },
  published: { label: '已发布', color: 'success' },
  disabled: { label: '已停用', color: 'warning' }
}

const PUBLISHER_KIND_OPTIONS = [
  { value: 'agent', label: '代理发布（招标代理提交 → 招标人侧审核）' },
  { value: 'self', label: '招标人发布（招标人提交 → 需求部门 → 采购管理部）' }
]

const publisherKindLabel = (kind) => (kind === 'self' ? '招标人发布' : '代理发布')

// 常用审批节点预设，可自由输入其他节点名
const NODE_PRESETS = ['需求部门', '采购管理部', '财务部', '分管领导']

export default function ApprovalFlowConfig() {
  const { role, userName } = useRole()
  // 页面级角色门禁：仅招标人（采购管理部语义）可维护；其余角色只读
  const canManage = role === 'tenderee'

  const [refresh, setRefresh] = useState(0)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [chain, setChain] = useState([])
  const [nodeInput, setNodeInput] = useState('')
  const [form] = Form.useForm()

  const configs = useMemo(
    () => approvalStore.getFlowConfigs(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refresh]
  )

  const openCreate = () => {
    setEditing(null)
    setChain([])
    setNodeInput('')
    form.resetFields()
    setDrawerOpen(true)
  }

  const openEdit = (record) => {
    setEditing(record)
    setChain([...(record.chain || [])])
    setNodeInput('')
    form.setFieldsValue({
      name: record.name,
      publisherKind: record.publisherKind,
      remark: record.remark
    })
    setDrawerOpen(true)
  }

  const addNode = () => {
    const value = nodeInput.trim()
    if (!value) return
    if (chain.includes(value)) {
      message.warning('该节点已在审批链中')
      return
    }
    setChain((prev) => [...prev, value])
    setNodeInput('')
  }

  const removeNode = (index) => setChain((prev) => prev.filter((_, i) => i !== index))

  const moveNode = (index, offset) => {
    setChain((prev) => {
      const next = [...prev]
      const target = index + offset
      if (target < 0 || target >= next.length) return prev
      const [item] = next.splice(index, 1)
      next.splice(target, 0, item)
      return next
    })
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      if (chain.length === 0) {
        message.warning('请至少添加一个审批节点')
        return
      }
      approvalStore.saveFlowConfig({
        ...(editing || {}),
        ...values,
        chain: [...chain]
      })
      message.success(editing ? '审批流已更新' : '审批流已创建（未发布，发布后生效）')
      setDrawerOpen(false)
      setRefresh((n) => n + 1)
    } catch {
      // 表单校验失败
    }
  }

  const changeStatus = (record, status) => {
    const textMap = {
      published: '发布后新提交的单据将按该审批链流转，在途单据仍按原链执行。',
      disabled: '停用后新发起的审批单不再使用该流程（回退默认审批链），在途单据不受影响。'
    }
    Modal.confirm({
      title: status === 'published' ? '发布审批流' : '停用审批流',
      content: textMap[status] || '确认变更流程状态？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        approvalStore.setFlowStatus(record.id, status)
        message.success('流程状态已更新')
        setRefresh((n) => n + 1)
      }
    })
  }

  const columns = [
    { title: '流程名称', dataIndex: 'name', width: 180 },
    {
      title: '适用单据',
      dataIndex: 'publisherKind',
      width: 110,
      render: (value) => <Tag color={value === 'self' ? 'geekblue' : 'green'}>{publisherKindLabel(value)}</Tag>
    },
    {
      title: '审批节点链',
      dataIndex: 'chain',
      render: (value) => (
        <Space size={4} wrap>
          {(value || []).map((node, idx) => (
            <Tag key={`${node}-${idx}`}>
              {idx + 1}. {node}
            </Tag>
          ))}
        </Space>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (value) => {
        const cfg = FLOW_STATUS_MAP[value] || { label: value, color: 'default' }
        return <Tag color={cfg.color}>{cfg.label}</Tag>
      }
    },
    { title: '更新时间', dataIndex: 'updatedAt', width: 150 },
    { title: '发布时间', dataIndex: 'publishedAt', width: 150, render: (v) => v || '-' },
    { title: '备注', dataIndex: 'remark', ellipsis: true, render: (v) => v || '-' },
    ...(canManage
      ? [
          {
            title: '操作',
            key: 'action',
            width: 200,
            render: (_, record) => (
              <Space size="small">
                <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>
                  编辑
                </Button>
                {record.status !== 'published' && (
                  <Button type="link" size="small" onClick={() => changeStatus(record, 'published')}>
                    {record.status === 'disabled' ? '重新启用' : '发布'}
                  </Button>
                )}
                {record.status === 'published' && (
                  <Button type="link" size="small" danger onClick={() => changeStatus(record, 'disabled')}>
                    停用
                  </Button>
                )}
              </Space>
            )
          }
        ]
      : [])
  ]

  return (
    <div className="approval-flow-config">
      <Card>
        <div className="header-actions">
          <div>
            <h3>审批流配置</h3>
            <p className="tip">
              审批流由招标人（采购管理部）新建、修改、启停和发布（清单 55）；不同采购方式共用同一审批流（清单 51）。
            </p>
          </div>
          {canManage && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新建审批流
            </Button>
          )}
        </div>

        {!canManage && (
          <Alert
            title={`审批流配置仅招标人（采购管理部）可维护，当前角色（${userName}）为只读查看。`}
            type="warning"
            showIcon
            closable={false}
            style={{ marginBottom: 16 }}
          />
        )}
        <Alert
          title="审批链按发布者类型区分：代理发布 → 采购管理部；招标人发布 → 需求部门 → 采购管理部。流程发布后，新提交的单据按新链流转；未发布或停用的流程不作用于新发起的审批单。"
          type="info"
          showIcon
          closable={false}
          style={{ marginBottom: 16 }}
        />

        <Table
          rowKey="id"
          columns={columns}
          dataSource={configs}
          pagination={false}
          size="small"
          locale={{ emptyText: <Empty description="暂无审批流配置" /> }}
        />
      </Card>

      <Drawer
        title={editing ? '编辑审批流' : '新建审批流'}
        width={520}
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
        <Form form={form} layout="vertical" initialValues={{ publisherKind: 'agent' }}>
          <Form.Item
            label="流程名称"
            name="name"
            rules={[{ required: true, message: '请输入流程名称' }]}
          >
            <Input placeholder="例如：代理发布审批流" maxLength={50} showCount />
          </Form.Item>
          <Form.Item
            label="适用单据（按发布者类型）"
            name="publisherKind"
            rules={[{ required: true, message: '请选择发布者类型' }]}
          >
            <Select options={PUBLISHER_KIND_OPTIONS} disabled={!!editing} />
          </Form.Item>
          <Form.Item label="审批节点链（按顺序依次审批）" required>
            <Space.Compact style={{ width: '100%', marginBottom: 8 }}>
              <AutoComplete
                style={{ width: '100%' }}
                placeholder="输入节点名称，如：采购管理部"
                value={nodeInput}
                onChange={setNodeInput}
                onPressEnter={addNode}
                options={NODE_PRESETS.filter((n) => !chain.includes(n)).map((n) => ({ value: n }))}
              />
              <Button type="primary" icon={<PlusOutlined />} onClick={addNode}>
                添加
              </Button>
            </Space.Compact>
            {chain.length === 0 ? (
              <Empty description="尚未添加审批节点" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <div className="chain-list">
                {chain.map((node, index) => (
                  <div key={`${node}-${index}`} className="chain-item">
                    <Tag color="blue">{index + 1}</Tag>
                    <span className="chain-node-name">{node}</span>
                    <Space size={0}>
                      <Button
                        type="text"
                        size="small"
                        icon={<ArrowUpOutlined />}
                        disabled={index === 0}
                        onClick={() => moveNode(index, -1)}
                      />
                      <Button
                        type="text"
                        size="small"
                        icon={<ArrowDownOutlined />}
                        disabled={index === chain.length - 1}
                        onClick={() => moveNode(index, 1)}
                      />
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeNode(index)}
                      />
                    </Space>
                  </div>
                ))}
              </div>
            )}
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <Input.TextArea rows={3} placeholder="流程用途说明（选填）" maxLength={200} showCount />
          </Form.Item>
        </Form>
        <Alert
          title="保存后流程为「未发布」状态，需发布后才会作用于新提交的单据；在途审批单仍按原链流转。"
          type="info"
          showIcon
          closable={false}
        />
      </Drawer>

      <style>{`
        .approval-flow-config .header-actions {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }
        .approval-flow-config .header-actions h3 {
          margin: 0;
        }
        .approval-flow-config .tip {
          color: #666;
          font-size: 13px;
          margin: 4px 0 0;
        }
        .chain-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .chain-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: #f5f5f5;
          border-radius: 4px;
        }
        .chain-node-name {
          flex: 1;
        }
      `}</style>
    </div>
  )
}
