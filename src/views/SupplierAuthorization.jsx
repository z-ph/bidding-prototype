import { useMemo, useState } from 'react'
import { Alert, Button, Card, Form, Input, Modal, Popconfirm, Select, Table, Tag, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useRole } from '../hooks/useRole.js'
import { projectStore } from '../data/projects.js'
import { authorizationStore, AUTHORIZATION_STATUS_MAP } from '../data/authorizationStore.js'
import { INVITATION_RESPONSES_KEY } from './BidderProjects.jsx'

// 供应商授权管理（招标人/代理）：按项目维护授权名单（授权/撤销/重新授权），
// 授权为年度周期（授权日起 1 年），过期自动标记「需重新授权」并视同未授权（概要三）；
// 投标邀请书在授权时按项目+供应商自动生成（清单 24，genInvitation 幂等）。
const PURCHASE_MODE_LABELS = {
  open: '公开招标',
  invitation: '邀请招标',
  inquiry: '公开询比价',
  invitation_inquiry: '邀请询比价'
}

// 与 ProjectCreate 注册企业一致的平台供应商名册（mock）
const SUPPLIER_ROSTER = ['A科技有限公司', 'B实业有限公司', 'C股份有限公司', 'D集团有限公司']

// 种子项目（projectStore 无记录时兜底）；项目 3 与 authorizationStore 种子授权记录一致
const SEED_PROJECTS = [
  { id: '1', name: 'XX市轨道交通设备采购项目', purchaseMode: 'open' },
  { id: '2', name: '办公桌椅采购项目', purchaseMode: 'inquiry' },
  { id: '3', name: '软件开发服务项目', purchaseMode: 'invitation', invitedBidders: ['A科技有限公司', 'B实业有限公司'] },
  { id: '4', name: '物业服务采购项目', purchaseMode: 'open' },
  { id: '5', name: '实验室设备采购项目', purchaseMode: 'open' }
]

const INVITE_TRACK_STATUS = {
  sent: { label: '已发送', color: 'processing' },
  accepted: { label: '已接受', color: 'success' },
  rejected: { label: '已拒绝', color: 'error' }
}

function loadInvitationResponses() {
  try {
    const raw = localStorage.getItem(INVITATION_RESPONSES_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

// 投标邀请书 mock 文本：项目信息/标段/时间由项目数据填充，模板为占位（真实模板联系采购管理部）
function buildInvitationLetter(project, invitation, supplierName) {
  const packages = (project?.packages || [])
    .map((p) => p.name || p.code)
    .filter(Boolean)
    .join('、') || '详见招标文件'
  const deadline = project?.deadline || project?.packages?.[0]?.bidEnd || '详见招标公告'
  const openTime = project?.openTime || '详见招标公告'
  return [
    '投 标 邀 请 书',
    '',
    `编号：${invitation.code}`,
    `致：${supplierName || invitation.supplierName || invitation.supplierId}`,
    '',
    `贵单位已被邀请参加「${project?.name || invitation.projectId}」（项目编号：${project?.code || project?.id || invitation.projectId}）的投标活动。`,
    `采购方式：${PURCHASE_MODE_LABELS[project?.purchaseMode] || project?.purchaseMode || '邀请招标'}`,
    `标段：${packages}`,
    `投标截止时间：${deadline}`,
    `开标时间：${openTime}`,
    '',
    '请登录招投标采购平台下载招标文件，并按文件要求编制、上传投标文件。',
    '',
    `生成时间：${invitation.generatedAt}`,
    '（本邀请书由系统自动生成，内容为原型占位模板；真实模板维护请联系采购管理部。）'
  ].join('\n')
}

function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function SupplierAuthorization() {
  const { userInfo } = useRole()
  const [form] = Form.useForm()

  const [records, setRecords] = useState(() => authorizationStore.list())
  const [inviteResponses, setInviteResponses] = useState(loadInvitationResponses)
  const [filters, setFilters] = useState({ projectId: undefined, status: undefined })
  const [grantOpen, setGrantOpen] = useState(false)
  const [letterModal, setLetterModal] = useState({ open: false, invitation: null, text: '' })

  // 项目清单：种子项目 + ProjectCreate 持久化项目（去重）
  const projectOptions = useMemo(() => {
    const merged = SEED_PROJECTS.map((p) => ({ ...p }))
    projectStore.getProjects().forEach((p) => {
      if (!merged.some((s) => String(s.id) === String(p.id))) {
        merged.push({ id: String(p.id), name: p.name, purchaseMode: p.purchaseMode, packages: p.packages, invitedBidders: p.invitedBidders || [] })
      }
    })
    return merged
  }, [])

  const projectById = (id) => projectOptions.find((p) => String(p.id) === String(id))

  // 无订阅机制：操作后自行重读 store 与邀请响应
  const refresh = () => {
    setRecords(authorizationStore.list())
    setInviteResponses(loadInvitationResponses())
  }

  const filteredRecords = useMemo(
    () =>
      records.filter((r) => {
        if (filters.projectId && String(r.projectId) !== String(filters.projectId)) return false
        if (filters.status && r.status !== filters.status) return false
        return true
      }),
    [records, filters]
  )

  const submitGrant = async () => {
    const values = await form.validateFields().catch(() => null)
    if (!values) return
    const record = authorizationStore.authorize({
      projectId: values.projectId,
      supplierId: values.supplierName,
      supplierName: values.supplierName,
      grantedBy: values.grantedBy
    })
    // 授权同时自动生成投标邀请书（幂等，已生成则复用原编号）
    authorizationStore.genInvitation(record.projectId, record.supplierId)
    message.success(`已授权 ${record.supplierName}，有效期 ${record.grantedAt} 至 ${record.expiresAt}，投标邀请书已自动生成`)
    setGrantOpen(false)
    form.resetFields()
    refresh()
  }

  const revoke = (record) => {
    authorizationStore.revoke(record.id)
    message.success(`已撤销 ${record.supplierName} 在「${projectById(record.projectId)?.name || record.projectId}」的授权`)
    refresh()
  }

  const reauthorize = (record) => {
    const next = authorizationStore.authorize({
      projectId: record.projectId,
      supplierId: record.supplierId,
      supplierName: record.supplierName,
      grantedBy: userInfo?.nickname || ''
    })
    message.success(`已重新授权 ${next.supplierName}，新有效期至 ${next.expiresAt}`)
    refresh()
  }

  const viewLetter = (record) => {
    const invitation = authorizationStore.genInvitation(record.projectId, record.supplierId)
    setLetterModal({
      open: true,
      invitation,
      text: buildInvitationLetter(projectById(record.projectId), invitation, record.supplierName || record.supplierId)
    })
  }

  // 邀请状态跟踪（招标人/代理侧）：读取 ProjectCreate 持久化的 invitedBidders + 供应商接受状态
  const inviteTrackRows = useMemo(() => {
    const rows = []
    projectOptions
      .filter((p) => ['invitation', 'invitation_inquiry'].includes(p.purchaseMode) && (p.invitedBidders || []).length > 0)
      .forEach((p) => {
        p.invitedBidders.forEach((name) => {
          const response = inviteResponses[`${p.id}::${name}`]
          rows.push({
            key: `${p.id}::${name}`,
            projectName: p.name,
            supplierName: name,
            status: response?.status || 'sent',
            respondedAt: response?.respondedAt || '-'
          })
        })
      })
    return rows
  }, [projectOptions, inviteResponses])

  const columns = [
    {
      title: '项目名称',
      dataIndex: 'projectId',
      key: 'projectId',
      minWidth: 200,
      render: (pid) => projectById(pid)?.name || pid
    },
    { title: '供应商', dataIndex: 'supplierName', key: 'supplierName', minWidth: 160 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const meta = AUTHORIZATION_STATUS_MAP[status] || { label: status, color: 'default' }
        return <Tag color={meta.color}>{meta.label}</Tag>
      }
    },
    { title: '授权人', dataIndex: 'grantedBy', key: 'grantedBy', width: 100 },
    { title: '授权时间', dataIndex: 'grantedAt', key: 'grantedAt', width: 120 },
    { title: '到期时间', dataIndex: 'expiresAt', key: 'expiresAt', width: 120 },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <>
          <Button type="link" size="small" onClick={() => viewLetter(record)}>
            邀请书
          </Button>
          {record.status === 'authorized' && (
            <Popconfirm
              title="确认撤销该授权？"
              description="撤销后该供应商将无法下载该项目招标文件。"
              okText="撤销"
              cancelText="取消"
              onConfirm={() => revoke(record)}
            >
              <Button type="link" size="small" danger>
                撤销
              </Button>
            </Popconfirm>
          )}
          {(record.status === 'expired' || record.status === 'revoked') && (
            <Button type="link" size="small" onClick={() => reauthorize(record)}>
              重新授权
            </Button>
          )}
        </>
      )
    }
  ]

  return (
    <div className="supplier-authorization">
      <Card
        title={
          <div className="card-header">
            <span>供应商授权管理</span>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setGrantOpen(true)}>
              新增授权
            </Button>
          </div>
        }
      >
        <Alert
          title="授权按年度周期生效（授权日起 1 年），过期自动标记「需重新授权」并视同未授权；公开项目供应商可自行下载招标文件，非公开项目仅授权名单内供应商可下载。授权时系统自动生成投标邀请书。"
          type="info"
          showIcon
          closable={false}
          style={{ marginBottom: 16 }}
        />
        <div className="filter-bar">
          <Select
            allowClear
            placeholder="按项目筛选"
            style={{ width: 280 }}
            value={filters.projectId}
            onChange={(value) => setFilters((prev) => ({ ...prev, projectId: value }))}
            options={projectOptions.map((p) => ({ label: p.name, value: String(p.id) }))}
          />
          <Select
            allowClear
            placeholder="按状态筛选"
            style={{ width: 160 }}
            value={filters.status}
            onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
            options={Object.entries(AUTHORIZATION_STATUS_MAP).map(([value, meta]) => ({ label: meta.label, value }))}
          />
        </div>
        <Table
          columns={columns}
          dataSource={filteredRecords}
          rowKey="id"
          bordered
          pagination={false}
          style={{ width: '100%' }}
        />
      </Card>

      <Card title="邀请状态跟踪" style={{ marginTop: 16 }}>
        <Alert
          title="邀请制项目的受邀企业及供应商接受/拒绝状态；供应商在项目中心接受或拒绝后实时更新。"
          type="info"
          showIcon
          closable={false}
          style={{ marginBottom: 16 }}
        />
        <Table
          rowKey="key"
          bordered
          pagination={false}
          dataSource={inviteTrackRows}
          locale={{ emptyText: '暂无邀请制项目或受邀企业' }}
          style={{ width: '100%' }}
          columns={[
            { title: '项目名称', dataIndex: 'projectName', key: 'projectName', minWidth: 200 },
            { title: '受邀企业', dataIndex: 'supplierName', key: 'supplierName', minWidth: 160 },
            {
              title: '邀请状态',
              dataIndex: 'status',
              key: 'status',
              width: 110,
              render: (status) => {
                const meta = INVITE_TRACK_STATUS[status] || INVITE_TRACK_STATUS.sent
                return <Tag color={meta.color}>{meta.label}</Tag>
              }
            },
            { title: '响应时间', dataIndex: 'respondedAt', key: 'respondedAt', width: 180 }
          ]}
        />
      </Card>

      <Modal
        title="新增供应商授权"
        open={grantOpen}
        onOk={submitGrant}
        onCancel={() => setGrantOpen(false)}
        okText="确认授权"
        cancelText="取消"
        destroyOnHidden
      >
        <Form form={form} layout="horizontal" labelCol={{ flex: '100px' }} initialValues={{ grantedBy: userInfo?.nickname || '' }}>
          <Form.Item label="选择项目" name="projectId" rules={[{ required: true, message: '请选择项目' }]}>
            <Select
              placeholder="请选择项目"
              options={projectOptions.map((p) => ({
                label: `${p.name}（${PURCHASE_MODE_LABELS[p.purchaseMode] || p.purchaseMode || '-'}）`,
                value: String(p.id)
              }))}
            />
          </Form.Item>
          <Form.Item label="选择供应商" name="supplierName" rules={[{ required: true, message: '请选择供应商' }]}>
            <Select
              placeholder="请选择供应商"
              options={SUPPLIER_ROSTER.map((name) => ({ label: name, value: name }))}
            />
          </Form.Item>
          <Form.Item label="授权人" name="grantedBy" rules={[{ required: true, message: '请填写授权人' }]}>
            <Input placeholder="授权人姓名" />
          </Form.Item>
        </Form>
        <div style={{ color: '#999', fontSize: 12 }}>
          授权有效期为授权日起 1 年；对已撤销/已过期的供应商再次授权将复用原记录并重置有效期。
        </div>
      </Modal>

      <Modal
        title={`投标邀请书（${letterModal.invitation?.code || ''}）`}
        open={letterModal.open}
        width={640}
        onCancel={() => setLetterModal((prev) => ({ ...prev, open: false }))}
        footer={[
          <Button key="close" onClick={() => setLetterModal((prev) => ({ ...prev, open: false }))}>
            关闭
          </Button>,
          <Button
            key="download"
            type="primary"
            onClick={() =>
              downloadTextFile(`投标邀请书-${letterModal.invitation?.code || 'letter'}.txt`, letterModal.text)
            }
          >
            下载邀请书
          </Button>
        ]}
      >
        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>{letterModal.text}</pre>
      </Modal>

      <style>{`
        .supplier-authorization {
          max-width: 1200px;
          margin: 0 auto;
        }
        .supplier-authorization .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
        }
        .supplier-authorization .filter-bar {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
      `}</style>
    </div>
  )
}
