import { useState } from 'react'
import { Alert, Button, Card, Form, Input, Modal, Select, Table, Tag, message } from 'antd'

// 模板管理（cal-010）：招标文件目录模板/投标邀请书/中标通知书的元数据维护与启停用
// 口径：模板内容（正文条款）维护「与采购管理部联系」（需求确认清单 21/24）；
// 投标邀请书由系统自动生成、模板由采购管理部维护（清单 24）
// 本文件内自行持久化（任务约束只允许新建 4 个视图文件，不新增 store 文件）

const TEMPLATES_KEY = 'bidding-templates'

const TEMPLATE_TYPES = [
  { value: 'catalog', label: '招标文件目录模板' },
  { value: 'invitation', label: '投标邀请书' },
  { value: 'award', label: '中标通知书' }
]

const typeLabel = (value) => TEMPLATE_TYPES.find((t) => t.value === value)?.label || value

const defaultTemplates = [
  {
    id: 'tpl-1',
    type: 'catalog',
    name: '招标文件目录模板（货物类）',
    version: 'V1.2',
    maintainer: '采购管理部',
    updatedAt: '2026-07-10 14:00',
    status: '启用',
    remark: '货物类招标文件标准目录结构，供 TenderDoc「导入模板」引用'
  },
  {
    id: 'tpl-2',
    type: 'catalog',
    name: '招标文件目录模板（服务类）',
    version: 'V1.0',
    maintainer: '采购管理部',
    updatedAt: '2026-07-05 10:30',
    status: '启用',
    remark: '服务类招标文件标准目录结构'
  },
  {
    id: 'tpl-3',
    type: 'invitation',
    name: '投标邀请书模板',
    version: 'V1.0',
    maintainer: '采购管理部',
    updatedAt: '2026-07-08 10:00',
    status: '启用',
    remark: '邀请招标项目自动生成投标邀请书（清单 24）'
  },
  {
    id: 'tpl-4',
    type: 'award',
    name: '中标通知书模板',
    version: 'V1.1',
    maintainer: '采购管理部',
    updatedAt: '2026-06-30 16:00',
    status: '停用',
    remark: '定标后向中标人发出，待采购管理部确认新版正文后启用'
  }
]

function loadTemplates() {
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY)
    return raw ? JSON.parse(raw) : defaultTemplates
  } catch {
    return defaultTemplates
  }
}

function saveTemplates(list) {
  try {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(list))
  } catch {
    // ignore storage errors
  }
}

function nowString() {
  return new Date().toLocaleString()
}

const EMPTY_FORM = { type: undefined, name: '', version: 'V1.0', maintainer: '采购管理部', remark: '' }

export default function TemplateManage() {
  const [templates, setTemplates] = useState(() => loadTemplates())
  const [search, setSearch] = useState({ type: undefined })

  const [dialogVisible, setDialogVisible] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})

  // 写入持久化：任何 templates 变更都落库，刷新后保留
  const updateTemplates = (next) => {
    setTemplates(next)
    saveTemplates(next)
  }

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (formErrors[key]) setFormErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormErrors({})
    setDialogVisible(true)
  }

  const openEdit = (row) => {
    setEditingId(row.id)
    setForm({ type: row.type, name: row.name, version: row.version, maintainer: row.maintainer, remark: row.remark })
    setFormErrors({})
    setDialogVisible(true)
  }

  const save = () => {
    const errors = {}
    if (!form.type) errors.type = '请选择模板类型'
    if (!form.name.trim()) errors.name = '请输入模板名称'
    if (!form.version.trim()) errors.version = '请输入版本号'
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      message.error('请完善必填项后再保存')
      return
    }
    const payload = {
      type: form.type,
      name: form.name.trim(),
      version: form.version.trim(),
      maintainer: form.maintainer.trim() || '采购管理部',
      remark: form.remark.trim()
    }
    if (editingId) {
      updateTemplates(
        templates.map((t) => (t.id === editingId ? { ...t, ...payload, updatedAt: nowString() } : t))
      )
      message.success(`模板「${payload.name}」已更新`)
    } else {
      updateTemplates([
        { id: `tpl-${Date.now()}`, ...payload, updatedAt: nowString(), status: '启用' },
        ...templates
      ])
      message.success(`模板「${payload.name}」已新增`)
    }
    setDialogVisible(false)
  }

  const requestToggleStatus = (row) => {
    const action = row.status === '启用' ? '停用' : '启用'
    Modal.confirm({
      title: `确认${action}模板`,
      content: `确定要${action}「${row.name}（${row.version}）」吗？${row.status === '启用' ? '停用后业务页面将不再引用该模板。' : ''}`,
      okText: action,
      okButtonProps: { danger: row.status === '启用' },
      cancelText: '取消',
      onOk: () => {
        updateTemplates(
          templates.map((t) =>
            t.id === row.id
              ? { ...t, status: t.status === '启用' ? '停用' : '启用', updatedAt: nowString() }
              : t
          )
        )
        message.success(`已${action}「${row.name}」`)
      }
    })
  }

  const columns = [
    {
      title: '类型',
      dataIndex: 'type',
      width: 160,
      render: (type) => <Tag color="processing">{typeLabel(type)}</Tag>
    },
    { title: '模板名称', dataIndex: 'name', minWidth: 220 },
    { title: '版本', dataIndex: 'version', width: 90 },
    { title: '维护人', dataIndex: 'maintainer', width: 120 },
    { title: '更新时间', dataIndex: 'updatedAt', width: 170 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (status) => <Tag color={status === '启用' ? 'success' : 'default'}>{status}</Tag>
    },
    {
      title: '操作',
      width: 150,
      render: (_, row) => (
        <>
          <Button type="link" onClick={() => openEdit(row)}>编辑</Button>
          <Button type="link" danger={row.status === '启用'} onClick={() => requestToggleStatus(row)}>
            {row.status === '启用' ? '停用' : '启用'}
          </Button>
        </>
      )
    }
  ]

  return (
    <div className="template-manage">
      <Card
        title={
          <div className="card-header">
            <span>模板管理</span>
            <Button type="primary" onClick={openCreate}>新增模板</Button>
          </div>
        }
      >
        <Alert
          title="模板内容（正文条款）维护请与采购管理部联系（需求确认清单 21/24：开发到具体模块时与采购管理部联系）。本页维护模板元数据（名称/版本/维护人）与启停用，数据持久化在浏览器 localStorage。"
          type="info"
          showIcon
          closable={false}
          style={{ marginBottom: 20 }}
        />
        <div className="filter-bar">
          <Select
            placeholder="模板类型"
            allowClear
            style={{ width: 200 }}
            value={search.type}
            onChange={(value) => setSearch({ type: value })}
            options={TEMPLATE_TYPES}
          />
        </div>
        <Table
          columns={columns}
          dataSource={templates.filter((t) => search.type === undefined || t.type === search.type)}
          rowKey="id"
          pagination={false}
          style={{ width: '100%' }}
        />
      </Card>

      <Modal
        title={editingId ? '编辑模板' : '新增模板'}
        open={dialogVisible}
        width={600}
        onCancel={() => setDialogVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setDialogVisible(false)}>取消</Button>,
          <Button key="save" type="primary" onClick={save}>保存</Button>
        ]}
      >
        <Form labelCol={{ flex: '0 0 100px' }} wrapperCol={{ flex: 'auto' }}>
          <Form.Item label="模板类型" validateStatus={formErrors.type ? 'error' : ''} help={formErrors.type}>
            <Select
              style={{ width: '100%' }}
              placeholder="请选择模板类型"
              value={form.type}
              onChange={(value) => updateField('type', value)}
              options={TEMPLATE_TYPES}
            />
          </Form.Item>
          <Form.Item label="模板名称" validateStatus={formErrors.name ? 'error' : ''} help={formErrors.name}>
            <Input value={form.name} onChange={(e) => updateField('name', e.target.value)} />
          </Form.Item>
          <Form.Item label="版本号" validateStatus={formErrors.version ? 'error' : ''} help={formErrors.version}>
            <Input placeholder="如 V1.0" value={form.version} onChange={(e) => updateField('version', e.target.value)} />
          </Form.Item>
          <Form.Item label="维护人">
            <Input value={form.maintainer} onChange={(e) => updateField('maintainer', e.target.value)} />
          </Form.Item>
          <Form.Item label="备注">
            <Input.TextArea
              rows={3}
              placeholder="模板用途/引用说明；正文条款内容请与采购管理部联系维护"
              value={form.remark}
              onChange={(e) => updateField('remark', e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .template-manage {
          max-width: 1100px;
          margin: 0 auto;
        }
        .template-manage .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
          width: 100%;
        }
        .template-manage .filter-bar {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  )
}
