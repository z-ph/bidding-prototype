import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { Card, Input, Select, Button, Table, Tag, Pagination, message, Modal, Timeline } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useRole } from '../hooks/useRole.js'
import { projectStore } from '../data/projects.js'
import EmptyState from '../components/EmptyState.jsx'

// 采购方式口径：项目级采购方式已移除（cxy-016），列表/详情均由标段派生
export const PURCHASE_MODE_OPTIONS = [
  { label: '公开招标', value: 'open' },
  { label: '邀请招标', value: 'invitation' },
  { label: '公开询比价', value: 'inquiry' },
  { label: '邀请询比价', value: 'invitation_inquiry' }
]

const PURCHASE_MODE_VALUE_BY_LABEL = Object.fromEntries(
  PURCHASE_MODE_OPTIONS.map((o) => [o.label, o.value])
)

export const PROJECT_STATUS_MAP = {
  draft: { text: '草稿', color: 'default' },
  pending: { text: '待审核', color: 'processing' },
  tendering: { text: '招标中', color: 'success' },
  registering: { text: '公告中', color: 'geekblue' },
  pending_open: { text: '待开标', color: 'warning' },
  evaluating: { text: '评标中', color: 'error' },
  // 定标阶段（ExpertProject 评标报告生成后回写 status='评标完成'；定标侧另以 awardStage 记录阶段）
  '评标完成': { text: '评标完成', color: 'purple' },
  'evaluation-done': { text: '评标完成', color: 'purple' },
  '已确认中标人': { text: '已确认中标人', color: 'cyan' },
  'winner-confirmed': { text: '已确认中标人', color: 'cyan' },
  '通知书已发': { text: '通知书已发', color: 'default' },
  'notice-sent': { text: '通知书已发', color: 'default' },
  done: { text: '已完成', color: 'default' }
}

// 当前状态 → 下一步动作（默认口径，操作列与详情页共用；询比族见 INQUIRY_FAMILY_NEXT_STEP_MAP / getNextStepInfo）
export const NEXT_STEP_MAP = {
  draft: { label: '继续编辑', description: '草稿待完善，继续编辑后可提交审核' },
  pending: { label: '查看进度', description: '已提交审核，等待管理员审核' },
  tendering: { label: '发布公告', description: '招标中，下一步前往发布公告' },
  registering: { label: '进入开标', description: '公告中，投标截止后进入开标大厅' },
  pending_open: { label: '开标大厅', description: '待开标，进入开标大厅完成开标' },
  evaluating: { label: '评标大厅', description: '评标中，进入评标大厅查看进度' },
  // 定标阶段：评标完成→前往定标；已确认中标人→中标通知书；通知书已发→查看详情
  '评标完成': { label: '前往定标', description: '评标完成，前往定标确认中标人' },
  'evaluation-done': { label: '前往定标', description: '评标完成，前往定标确认中标人' },
  '已确认中标人': { label: '中标通知书', description: '已确认中标人，前往发送中标通知书' },
  'winner-confirmed': { label: '中标通知书', description: '已确认中标人，前往发送中标通知书' },
  '通知书已发': { label: '查看详情', description: '中标通知书已发出，查看项目详情' },
  'notice-sent': { label: '查看详情', description: '中标通知书已发出，查看项目详情' },
  done: { label: '查看详情', description: '项目已完成' }
}

// 演示环境不再预置 mock 基线数据；所有项目均通过页面 CRUD 写入 projectStore（localStorage）
export const BASELINE_PROJECTS = []

// 项目采购方式由标段派生：去重后拼接；无标段数据时回退到历史 type 字段
export function getPurchaseModeValues(project) {
  if (Array.isArray(project?.packages) && project.packages.length > 0) {
    return [...new Set(project.packages.map((pkg) => pkg.purchaseMode).filter(Boolean))]
  }
  const legacy = PURCHASE_MODE_VALUE_BY_LABEL[project?.type]
  return legacy ? [legacy] : []
}

export function getPurchaseModeText(project) {
  const values = getPurchaseModeValues(project)
  if (values.length === 0) return '-'
  return values
    .map((v) => PURCHASE_MODE_OPTIONS.find((o) => o.value === v)?.label || v)
    .join('、')
}

// ── 采购方式 → 流程节点映射（hall-purchase-method-mapping-20260721，两族两模板）──
// 口径：2026-07-21 需求——开标大厅服务招标族（公开招标 open/邀请招标 invitation），
// 比价大厅服务询比族（公开询比价 inquiry/邀请询比价 invitation_inquiry），
// 评标大厅对所有项目开放。废止 2026-07-17 清单 20「唯邀请询比价不用开标和评标」旧口径。
// 方式取值与 ProjectCreate 的 PURCHASE_MODE_OPTIONS 一致：open / invitation / inquiry / invitation_inquiry
export const FLOW_NODES = [
  { key: 'requirement', label: '创建采购需求' },
  { key: 'doc', label: '编制招标文件' },
  { key: 'notice', label: '发布招标公告' },
  { key: 'bid', label: '上传投标文件/报价' },
  { key: 'opening', label: '线上开标' },
  { key: 'comparison', label: '线上比价' },
  { key: 'evaluation', label: '线上评标' },
  { key: 'award', label: '定标公示' }
]

const BASE_FLOW_NODE_KEYS = ['requirement', 'doc', 'notice', 'bid']

// 两族模板：招标族 = 开标 + 评标；询比族 = 比价 + 评标（评标对所有项目开放）
export const PURCHASE_METHOD_FLOW_MAP = {
  open: [...BASE_FLOW_NODE_KEYS, 'opening', 'evaluation', 'award'],
  invitation: [...BASE_FLOW_NODE_KEYS, 'opening', 'evaluation', 'award'],
  inquiry: [...BASE_FLOW_NODE_KEYS, 'comparison', 'evaluation', 'award'],
  invitation_inquiry: [...BASE_FLOW_NODE_KEYS, 'comparison', 'evaluation', 'award']
}

// 按采购方式查询节点序列（未知方式回退公开招标全链路）
export function getFlowNodeKeys(purchaseMode) {
  return PURCHASE_METHOD_FLOW_MAP[purchaseMode] || PURCHASE_METHOD_FLOW_MAP.open
}

// 判断某流程节点在该采购方式下是否启用
export function isFlowNodeEnabled(purchaseMode, nodeKey) {
  return getFlowNodeKeys(purchaseMode).includes(nodeKey)
}

// 询比族判定：全部标段均为询比类（inquiry/invitation_inquiry）→ 走比价大厅
export function isInquiryFamily(project) {
  const values = getPurchaseModeValues(project)
  return values.length > 0 && values.every((v) => v === 'inquiry' || v === 'invitation_inquiry')
}

// 纯邀请询比价项目判定：全部标段均为 invitation_inquiry（定标阶段兼容口径沿用，见 utils/awardFlow.js）
export function isInvitedRfqProject(project) {
  const values = getPurchaseModeValues(project)
  return values.length > 0 && values.every((v) => v === 'invitation_inquiry')
}

// 询比族下一步口径（hall-purchase-method-mapping-20260721）：报价相关状态进入比价大厅，评标中进入评标大厅
export const INQUIRY_FAMILY_NEXT_STEP_MAP = {
  ...NEXT_STEP_MAP,
  registering: { label: '进入比价', description: '询比族项目报价截止后进入比价大厅比较报价' },
  pending_open: { label: '比价大厅', description: '询比族项目进入比价大厅完成报价比较' }
}

// 当前状态 → 下一步动作（按采购方式族分流；操作列与详情页共用同一口径）
export function getNextStepInfo(project) {
  const map = isInquiryFamily(project) ? INQUIRY_FAMILY_NEXT_STEP_MAP : NEXT_STEP_MAP
  return map[project?.status] || { label: '详情', description: '暂无后续操作' }
}

// store 数据在前（新建/草稿/已变更），基线数据在后；同 id 以 store 为准
export function mergeWithBaseline(storeProjects) {
  const storeIds = new Set((storeProjects || []).map((p) => String(p.id)))
  return [
    ...(storeProjects || []),
    ...BASELINE_PROJECTS.filter((b) => !storeIds.has(String(b.id)))
  ]
}

function applyDataScope(items, scope, userInfo) {
  if (!scope || scope === 'all' || !userInfo) return items
  if (scope === 'enterprise') return items
  if (scope === 'department') {
    return items.filter((item) => !item.deptCode || item.deptCode === userInfo.deptCode)
  }
  if (scope === 'self') {
    return items.filter((item) => !item.owner || item.owner === userInfo.nickname || item.owner === userInfo.account)
  }
  return items
}

const formatDate = (v) => {
  if (!v) return '-'
  const d = dayjs(v)
  return d.isValid() ? d.format('YYYY-MM-DD') : String(v)
}

export default function ProjectList() {
  const navigate = useNavigate()
  const { role, userInfo, dataScope, userName } = useRole()
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState({
    name: '',
    status: '',
    type: '',
    page: 1,
    pageSize: 10
  })

  // 数据源：projectStore（新建/草稿/变更）+ mock 基线合并（2052-004）
  const [projects, setProjects] = useState(() => mergeWithBaseline(projectStore.getProjects()))

  const reloadProjects = () => {
    setProjects(mergeWithBaseline(projectStore.getProjects()))
  }

  const orgModeText = (mode) => ({ self: '自行招标', agent: '委托代理' }[mode] || mode || '-')

  const scopedProjects = useMemo(() => applyDataScope(projects, dataScope, userInfo), [projects, dataScope, userInfo])

  const filteredProjects = useMemo(() => {
    const kw = search.name.trim().toLowerCase()
    return scopedProjects.filter((p) => {
      if (kw && !`${p.name || ''}${p.code || ''}`.toLowerCase().includes(kw)) return false
      if (search.status && p.status !== search.status) return false
      if (search.type && !getPurchaseModeValues(p).includes(search.type)) return false
      return true
    })
  }, [scopedProjects, search])

  const pagedProjects = useMemo(
    () => filteredProjects.slice((search.page - 1) * search.pageSize, search.page * search.pageSize),
    [filteredProjects, search.page, search.pageSize]
  )

  const hasActiveFilter = !!(search.name.trim() || search.status || search.type)

  const [operationRecords, setOperationRecords] = useState([])

  const statusText = (s) => PROJECT_STATUS_MAP[s]?.text || s || '-'
  const statusColor = (s) => PROJECT_STATUS_MAP[s]?.color || 'default'

  const nextLabel = (row) => {
    // 代理草稿项目下一步为编制招标文件（代理已有创建权限但无编辑权限，agent-project-requirement-management-20260721）
    if (role === 'agent' && row.status === 'draft') return '编制文件'
    return getNextStepInfo(row).label
  }

  const loadProjects = () => {
    setLoading(true)
    setTimeout(() => {
      reloadProjects()
      setLoading(false)
    }, 300)
  }

  const reset = () => {
    setSearch({ name: '', status: '', type: '', page: 1, pageSize: 10 })
    loadProjects()
  }

  const beforeOpenStatuses = ['draft', 'tendering', 'registering']

  const viewDetail = (row) => {
    navigate({ to: `/admin/projects/detail/${row.id}` })
  }

  const edit = (row) => {
    navigate({ to: '/admin/projects/create', search: { editId: row.id } })
  }

  const publish = (row) => {
    Modal.confirm({
      title: '发标确认',
      content: `确认发布项目“${row.name}”？发布后将进入招标中状态并生成招标公告。`,
      okText: '确认发标',
      cancelText: '取消',
      onOk: () => {
        try {
          projectStore.saveProject({
            ...row,
            status: 'tendering',
            publishTime: dayjs().format('YYYY-MM-DD')
          })
          reloadProjects()
          addOperationRecord('发标', `项目“${row.name}”已发标，进入招标中状态`)
          message.success('发标成功，项目已进入「招标中」；下一步可前往「公告发布」发布招标公告')
        } catch {
          message.error('发标失败，请重试')
        }
      }
    })
  }

  const addOperationRecord = (action, detail) => {
    setOperationRecords((prev) => [
      {
        id: Date.now(),
        action,
        detail,
        operator: userInfo?.nickname || userName || '-',
        time: new Date().toLocaleString()
      },
      ...prev
    ])
  }

  const nextStep = (row) => {
    const isAgentRole = role === 'agent'
    if (row.status === 'draft') {
      // 代理草稿项目进入招标文件编制（代理无编辑权限，编辑仍限招标人，与驾驶舱 getAgentActions 一致）
      if (isAgentRole) {
        navigate({ to: '/admin/tender-doc', search: { projectId: row.id } })
        return
      }
      navigate({ to: '/admin/projects/create', search: { editId: row.id } })
      return
    }
    if (row.status === 'pending' || row.status === 'done') {
      viewDetail(row)
      return
    }
    // 定标阶段（评标报告生成后 status='评标完成'；兼容 awardStage 键值口径）
    // 代理职责为汇总评标报告提交定标审批（approval-center），招标人进入定标确认
    if (['评标完成', 'evaluation-done'].includes(row.status)) {
      navigate({ to: isAgentRole ? '/admin/approval-center' : '/admin/award-confirm', search: { projectId: row.id } })
      return
    }
    if (['已确认中标人', 'winner-confirmed'].includes(row.status)) {
      navigate({ to: '/admin/award-notice', search: { projectId: row.id } })
      return
    }
    if (['通知书已发', 'notice-sent'].includes(row.status)) {
      viewDetail(row)
      return
    }
    // 大厅族分流（hall-purchase-method-mapping-20260721）：招标族→开标大厅，询比族→比价大厅；评标对所有项目开放
    if (row.status === 'registering' || row.status === 'pending_open') {
      navigate({ to: isInquiryFamily(row) ? '/admin/comparison-hall' : '/admin/opening-hall', search: { projectId: row.id } })
      return
    }
    const to = {
      tendering: '/admin/notice-publish',
      evaluating: '/admin/evaluation-hall'
    }[row.status]
    navigate({ to: to || '/admin/projects', search: { projectId: row.id } })
  }

  const columns = [
    { title: '', key: 'index', width: 50, render: (_, __, index) => (search.page - 1) * search.pageSize + index + 1 },
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      width: 240,
      render: (name, row) => (
        <Button type="link" onClick={() => viewDetail(row)} style={{ padding: 0 }}>
          {name}
        </Button>
      )
    },
    { title: '项目编号', dataIndex: 'code', key: 'code', width: 150 },
    {
      title: '采购方式',
      key: 'purchaseMode',
      width: 130,
      render: (_, row) => getPurchaseModeText(row)
    },
    { title: '组织方式', dataIndex: 'orgMode', key: 'orgMode', width: 110, render: (mode) => orgModeText(mode) },
    {
      title: '预算金额',
      dataIndex: 'budget',
      key: 'budget',
      width: 130,
      render: (budget) => (budget ? `${budget} 万元` : '-')
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => <Tag color={statusColor(status)}>{statusText(status)}</Tag>
    },
    {
      title: '发布时间',
      key: 'publishTime',
      width: 120,
      render: (_, row) => formatDate(row.publishTime || row.submitTime)
    },
    {
      title: '截止时间',
      key: 'deadline',
      width: 120,
      render: (_, row) => formatDate(row.deadline || row.packages?.[0]?.bidEnd)
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right',
      render: (_, row) => (
        <>
          <Button type="link" onClick={() => viewDetail(row)}>详情</Button>
          {beforeOpenStatuses.includes(row.status) && role === 'tenderee' && (
            <Button type="link" onClick={() => edit(row)}>编辑</Button>
          )}
          {row.status === 'draft' && role === 'tenderee' && (
            <Button type="link" onClick={() => publish(row)}>发标</Button>
          )}
          <Button type="link" onClick={() => nextStep(row)}>{nextLabel(row)}</Button>
        </>
      )
    }
  ]

  return (
    <div className="project-list">
      <Card
        title={
          <div className="header-actions">
            <div className="filter-bar">
              <Input
                placeholder="项目名称/编号"
                style={{ width: 220 }}
                allowClear
                value={search.name}
                onChange={(e) => setSearch({ ...search, name: e.target.value, page: 1 })}
              />
              <Select
                placeholder="项目状态"
                allowClear
                style={{ width: 140 }}
                value={search.status}
                onChange={(value) => setSearch({ ...search, status: value || '', page: 1 })}
                options={[
                  { label: '全部', value: '' },
                  { label: '草稿', value: 'draft' },
                  { label: '待审核', value: 'pending' },
                  { label: '招标中', value: 'tendering' },
                  { label: '公告中', value: 'registering' },
                  { label: '待开标', value: 'pending_open' },
                  { label: '评标中', value: 'evaluating' },
                  { label: '已完成', value: 'done' }
                ]}
              />
              <Select
                placeholder="采购方式"
                allowClear
                style={{ width: 140 }}
                value={search.type || undefined}
                onChange={(value) => setSearch({ ...search, type: value || '', page: 1 })}
                options={PURCHASE_MODE_OPTIONS}
              />
              <Button type="primary" onClick={loadProjects}>查询</Button>
              <Button onClick={reset}>重置</Button>
            </div>
            {['tenderee', 'agent'].includes(role) && (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate({ to: '/admin/projects/create' })}>
                创建项目
              </Button>
            )}
          </div>
        }
      >
        <Table
          rowKey="id"
          dataSource={pagedProjects}
          columns={columns}
          loading={loading}
          pagination={false}
          locale={{
            emptyText: hasActiveFilter ? (
              <EmptyState description="未找到符合条件的项目，请调整筛选条件" />
            ) : (
              <EmptyState
                description="暂无项目数据"
                reason={['tenderee', 'agent'].includes(role) ? '可点击右上角「创建项目」发起新项目' : ''}
              />
            )
          }}
        />
        <div className="pagination">
          <Pagination
            total={filteredProjects.length}
            pageSize={search.pageSize}
            current={search.page}
            showTotal={(total) => `共 ${total} 条`}
            onChange={(page) => {
              setSearch({ ...search, page })
            }}
          />
        </div>
      </Card>

      {operationRecords.length > 0 && (
        <Card title="操作记录" size="small">
          <Timeline
            items={operationRecords.map((record) => ({
              key: record.id,
              content: (
                <div>
                  <strong>{record.action}</strong>
                  <span style={{ color: '#999', marginLeft: 12, fontSize: 12 }}>{record.time}</span>
                  <p style={{ margin: '4px 0 0', color: '#666' }}>{record.detail}</p>
                  <p style={{ margin: 0, color: '#999', fontSize: 12 }}>操作人：{record.operator}</p>
                </div>
              )
            }))}
          />
        </Card>
      )}

      <style>{`
        .header-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .filter-bar {
          display: flex;
          gap: 12px;
        }
        .pagination {
          margin-top: 20px;
          display: flex;
          justify-content: flex-end;
        }
      `}</style>
    </div>
  )
}
