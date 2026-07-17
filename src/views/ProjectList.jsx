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
  registering: { text: '报名中', color: 'geekblue' },
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

// 当前状态 → 下一步动作（默认口径，操作列与详情页共用；邀请询比价见 INVITED_RFQ_NEXT_STEP_MAP / getNextStepInfo）
export const NEXT_STEP_MAP = {
  draft: { label: '继续编辑', description: '草稿待完善，继续编辑后可提交审核' },
  pending: { label: '查看进度', description: '已提交审核，等待管理员审核' },
  tendering: { label: '发布公告', description: '招标中，下一步前往发布公告' },
  registering: { label: '进入开标', description: '报名中，报名截止后进入开标大厅' },
  pending_open: { label: '开标大厅', description: '待开标，进入开标大厅完成开标' },
  evaluating: { label: '评标大厅', description: '评标中，进入评标大厅查看进度' },
  // 定标阶段：评标完成→前往定标；已确认中标人→中标通知书；通知书已发→查看详情
  '评标完成': { label: '前往定标', description: '评标完成，前往定标确认中标人' },
  'evaluation-done': { label: '前往定标', description: '评标完成，前往定标确认中标人' },
  '已确认中标人': { label: '中标通知书', description: '已确认中标人，前往发送中标通知书' },
  'winner-confirmed': { label: '中标通知书', description: '已确认中标人，前往发送中标通知书' },
  '通知书已发': { label: '查看详情', description: '中标通知书已发出，查看项目详情' },
  'notice-sent': { label: '查看详情', description: '中标通知书已发出，查看项目详情' },
  done: { label: '查看详情', description: '项目已完成并归档' }
}

// mock 基线数据：projectStore 中存在同 id 记录时以 store 为准（发标/编辑后持久化覆盖）
export const BASELINE_PROJECTS = [
  {
    id: 1, name: 'XX市轨道交通设备采购项目', code: 'ZB20260701001', type: '公开招标', orgMode: 'self', budget: 850,
    status: 'registering', publishTime: '2026-07-01', deadline: '2026-07-20', openTime: '2026-07-21 09:30',
    owner: '张三', deptCode: 'CG', demandSource: '年度采购计划', demandCode: 'XQ-2026-001',
    packages: [
      { name: '第一标段：主设备', code: 'B1', budget: 600, content: '主设备采购', purchaseMode: 'open', bidFee: 500, deposit: 50000, bidStart: '2026-07-10 09:00', bidEnd: '2026-07-20 17:00' },
      { name: '第二标段：辅材', code: 'B2', budget: 250, content: '辅助材料', purchaseMode: 'open', bidFee: 300, deposit: 20000, bidStart: '2026-07-10 09:00', bidEnd: '2026-07-20 17:00' }
    ],
    qualifications: ['营业执照', 'ISO9001认证'],
    intro: '本项目为轨道交通设备采购，包含主设备及辅材两个标段。'
  },
  {
    id: 2, name: '办公桌椅采购项目', code: 'ZB20260702002', type: '公开询比价', orgMode: 'self', budget: 45,
    status: 'pending_open', publishTime: '2026-07-02', deadline: '2026-07-18', openTime: '2026-07-19 09:30',
    owner: '李四', deptCode: 'ZB',
    packages: [
      { name: '办公家具标段', code: 'B1', budget: 45, content: '办公桌椅一批', purchaseMode: 'inquiry', bidFee: 100, deposit: 5000, bidStart: '2026-07-05 09:00', bidEnd: '2026-07-18 17:00' }
    ],
    qualifications: ['营业执照'],
    intro: '办公桌椅集中采购。'
  },
  {
    id: 3, name: '软件开发服务项目', code: 'ZB20260703003', type: '邀请招标', orgMode: 'agent', budget: 120,
    status: 'evaluating', publishTime: '2026-07-03', deadline: '2026-07-15', openTime: '2026-07-16 09:30',
    owner: '张三', deptCode: 'CG', agentId: 'agent_01',
    packages: [
      { name: '软件开发服务标段', code: 'B1', budget: 120, content: '信息系统定制开发', purchaseMode: 'invitation', bidFee: 800, deposit: 20000, bidStart: '2026-07-06 09:00', bidEnd: '2026-07-15 17:00' }
    ],
    qualifications: ['营业执照', '特定行业资质'],
    intro: '软件开发服务邀请招标项目。'
  },
  {
    id: 4, name: '物业服务采购项目', code: 'ZB20260704004', type: '公开招标', orgMode: 'self', budget: 60,
    status: 'done', publishTime: '2026-06-20', deadline: '2026-07-05', openTime: '2026-07-06 09:30',
    owner: '王五', deptCode: 'FW',
    packages: [
      { name: '物业服务标段', code: 'B1', budget: 60, content: '园区物业服务', purchaseMode: 'open', bidFee: 200, deposit: 10000, bidStart: '2026-06-25 09:00', bidEnd: '2026-07-05 17:00' }
    ],
    qualifications: ['营业执照'],
    intro: '年度物业服务采购。'
  },
  {
    id: 5, name: '实验室设备采购项目', code: 'ZB20260705005', type: '公开招标', orgMode: 'agent', budget: 230,
    status: 'tendering', publishTime: '2026-07-05', deadline: '2026-07-25', openTime: '2026-07-26 09:30',
    owner: '张三', deptCode: 'CG', agentId: 'agent_02',
    packages: [
      { name: '实验设备标段', code: 'B1', budget: 230, content: '实验室仪器设备', purchaseMode: 'open', bidFee: 600, deposit: 30000, bidStart: '2026-07-10 09:00', bidEnd: '2026-07-25 17:00' }
    ],
    qualifications: ['营业执照', '安全生产许可证'],
    intro: '实验室设备采购项目。'
  },
  {
    // 邀请询比价演示样例（add-purchase-method-flow-20260717）：驱动 项目中心 → 报价 → 定标 直通链路
    id: 6, name: '办公耗材邀请询比价项目', code: 'ZB20260710006', type: '邀请询比价', orgMode: 'self', budget: 18,
    status: 'registering', publishTime: '2026-07-10', deadline: '2026-07-22', openTime: null,
    owner: '李四', deptCode: 'CG',
    packages: [
      { name: '办公耗材标段', code: 'B1', budget: 18, content: '打印纸、硒鼓等办公耗材一批', purchaseMode: 'invitation_inquiry', bidFee: 0, deposit: 0, bidStart: '2026-07-12 09:00', bidEnd: '2026-07-22 17:00' }
    ],
    qualifications: ['营业执照'],
    intro: '邀请询比价演示项目：无开标/评标环节，报价截止后直接进入采购结果。'
  }
]

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

// ── 采购方式 → 流程节点映射（add-purchase-method-flow-20260717，任务 purchase-method-flow-map）──
// 口径：2026-07-17 需求确认清单 20——四种采购方式环节一样，唯邀请询比价（invitation_inquiry）
// 不用开标和评标，报价截止后可直接进入采购结果。
// 方式取值与 ProjectCreate 的 PURCHASE_MODE_OPTIONS 一致：open / invitation / inquiry / invitation_inquiry
export const FLOW_NODES = [
  { key: 'requirement', label: '创建采购需求' },
  { key: 'doc', label: '编制招标文件' },
  { key: 'notice', label: '发布招标公告' },
  { key: 'register', label: '投标报名与缴费' },
  { key: 'bid', label: '上传投标文件/报价' },
  { key: 'opening', label: '线上开标' },
  { key: 'evaluation', label: '线上评标' },
  { key: 'award', label: '定标公示' },
  { key: 'contract', label: '合同归档' }
]

// 开标/评标节点 key，邀请询比价剔除这两项
export const OPENING_EVALUATION_NODE_KEYS = ['opening', 'evaluation']

const FULL_FLOW_NODE_KEYS = FLOW_NODES.map((n) => n.key)

// 四种采购方式的节点序列：仅邀请询比价不含开标、评标，报价后直接为定标/采购结果
export const PURCHASE_METHOD_FLOW_MAP = {
  open: [...FULL_FLOW_NODE_KEYS],
  invitation: [...FULL_FLOW_NODE_KEYS],
  inquiry: [...FULL_FLOW_NODE_KEYS],
  invitation_inquiry: FULL_FLOW_NODE_KEYS.filter((k) => !OPENING_EVALUATION_NODE_KEYS.includes(k))
}

// 按采购方式查询节点序列（未知方式回退公开招标全链路）
export function getFlowNodeKeys(purchaseMode) {
  return PURCHASE_METHOD_FLOW_MAP[purchaseMode] || PURCHASE_METHOD_FLOW_MAP.open
}

// 判断某流程节点在该采购方式下是否启用
export function isFlowNodeEnabled(purchaseMode, nodeKey) {
  return getFlowNodeKeys(purchaseMode).includes(nodeKey)
}

// 纯邀请询比价项目判定：全部标段均为 invitation_inquiry（混合标段项目仍走开标/评标链路）
export function isInvitedRfqProject(project) {
  const values = getPurchaseModeValues(project)
  return values.length > 0 && values.every((v) => v === 'invitation_inquiry')
}

// 邀请询比价下一步口径（任务 invited-rfq-direct-award）：报价相关状态直达定标/采购结果，不出现开标/评标入口
export const INVITED_RFQ_NEXT_STEP_MAP = {
  ...NEXT_STEP_MAP,
  registering: { label: '前往定标', description: '邀请询比价无开标/评标环节，报价截止后直接进入定标/采购结果' },
  pending_open: { label: '前往定标', description: '邀请询比价无开标环节，报价截止后直接进入定标/采购结果' },
  evaluating: { label: '前往定标', description: '邀请询比价无评标环节，直接进入定标/采购结果' }
}

// 当前状态 → 下一步动作（按采购方式分流；操作列与详情页共用同一口径）
export function getNextStepInfo(project) {
  const map = isInvitedRfqProject(project) ? INVITED_RFQ_NEXT_STEP_MAP : NEXT_STEP_MAP
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

  const nextLabel = (row) => getNextStepInfo(row).label

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
    if (row.status === 'draft') {
      navigate({ to: '/admin/projects/create', search: { editId: row.id } })
      return
    }
    if (row.status === 'pending' || row.status === 'done') {
      viewDetail(row)
      return
    }
    // 定标阶段（评标报告生成后 status='评标完成'；兼容 awardStage 键值口径）
    if (['评标完成', 'evaluation-done'].includes(row.status)) {
      navigate({ to: '/admin/award-confirm', search: { projectId: row.id } })
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
    // 邀请询比价（清单 20）：无开标/评标环节，报价相关状态直达定标/采购结果
    if (isInvitedRfqProject(row) && ['registering', 'pending_open', 'evaluating'].includes(row.status)) {
      navigate({ to: '/admin/award-confirm', search: { projectId: row.id } })
      return
    }
    const to = {
      tendering: '/admin/notice-publish',
      registering: '/admin/opening-hall',
      pending_open: '/admin/opening-hall',
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
      render: (_, row) => formatDate(row.deadline || row.registerEnd)
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right',
      render: (_, row) => (
        <>
          <Button type="link" onClick={() => viewDetail(row)}>详情</Button>
          {beforeOpenStatuses.includes(row.status) && (
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
                  { label: '报名中', value: 'registering' },
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
            {role === 'tenderee' && (
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
                reason={role === 'tenderee' ? '可点击右上角「创建项目」发起新项目' : ''}
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
