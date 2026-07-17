import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Alert, Button, Card, Empty, Table, Tabs, Tag } from 'antd'
import { useRole } from '../hooks/useRole.js'
import { approvalStore, APPROVAL_TYPES } from '../data/approvalStore.js'
import { projectStore } from '../data/projects.js'

// 待办中心（cal-008）：按当前角色聚合审批待办、项目状态待办、系统待办
// 口径：需求确认清单 47（§1.15）——各角色面板均含「系统待办」

// 审批链节点（部门名）与平台角色的映射：采购管理部/需求部门为招标人侧审批节点（approvalStore 契约）
const ROLE_APPROVAL_NODES = {
  tenderee: ['需求部门', '采购管理部']
}

// 审批类型 → 处理页面（目标路径须在 permissions 中对对应角色放行）
const APPROVAL_TYPE_PATH = {
  requirement: '/admin/procurement-requirements',
  'tender-doc': '/admin/tender-doc',
  'award-result': '/admin/award-confirm'
}

// 项目状态 → 各角色需处理的待办（目标路径须在 permissions 中对对应角色放行）
const PROJECT_STATUS_TODOS = {
  tenderee: {
    draft: { text: '为草稿，待发标', path: '/admin/projects' },
    pending: { text: '已提交，待确认发布', path: '/admin/projects' },
    registering: { text: '公告中，请关注供应商响应进展', path: '/admin/projects' },
    pending_open: { text: '待开标，请确认开标安排', path: '/admin/opening-hall' },
    evaluating: { text: '评标中，待确认评标结果', path: '/admin/award-confirm' }
  },
  agent: {
    draft: { text: '为草稿，招标文件待编制', path: '/admin/tender-doc' },
    pending: { text: '已提交，待确认发布', path: '/admin/projects' },
    registering: { text: '公告中，请关注供应商响应进展', path: '/admin/projects' },
    pending_open: { text: '待开标，请完成开标准备', path: '/admin/opening-hall' },
    evaluating: { text: '评标中，待汇总提交评标报告', path: '/admin/evaluation-hall' }
  },
  bidder: {
    registering: { text: '公告中，可下载招标文件', path: '/admin/bid-download' },
    pending_open: { text: '待开标，请准时参加在线开标', path: '/admin/opening-hall' }
  }
}

// 系统待办 mock：目标路径均为已存在且角色可访问的页面
const SYSTEM_TODOS = {
  tenderee: [
    { title: '采购结果已发布，中标人投标费用待登记', source: '费用台账', time: '2026-07-17 09:00', path: '/admin/fee-manage' }
  ],
  agent: [
    { title: '委托代理合同待确认后开展代理业务', source: '委托代理', time: '2026-07-17 09:00', path: '/admin/projects' }
  ],
  bidder: [
    { title: '企业档案信息待完善（资质证书待补充）', source: '企业信息维护', time: '2026-07-17 09:00', path: '/admin/supplier-profile' }
  ],
  expert: [
    { title: '有评标任务待签收确认', source: '评标任务', time: '2026-07-17 09:00', path: '/admin/expert-tasks' },
    { title: '专家信息待完善（专业领域/回避单位）', source: '专家信息', time: '2026-07-16 15:00', path: '/admin/expert-profile' }
  ],
  supervisor: [
    { title: '有开标异常登记待跟进处理', source: '异常登记', time: '2026-07-17 09:00', path: '/admin/supervisor-abnormal' }
  ],
  admin: [
    { title: '新进注册用户待分配角色与权限', source: '用户权限管理', time: '2026-07-17 09:00', path: '/admin/admin-users' },
    { title: '参数字典「采购方式」选项待核对', source: '系统信息维护', time: '2026-07-16 15:00', path: '/admin/admin-dictionary' }
  ]
}

const KIND_MAP = {
  approval: { label: '审批待办', color: 'processing' },
  project: { label: '项目待办', color: 'warning' },
  system: { label: '系统待办', color: 'default' }
}

function formatTime(value) {
  if (!value) return '-'
  const text = String(value)
  // ISO 串（如 2026-07-12T10:00:00.000Z）截断到分钟，其余原样展示
  return text.includes('T') ? text.slice(0, 16).replace('T', ' ') : text
}

export default function TodoCenter() {
  const navigate = useNavigate()
  const { role, roleName, userName } = useRole()
  const [tab, setTab] = useState('all')

  // 审批待办：按角色名/用户名/映射的审批节点分别取 pendingFor，去重合并
  // （store 无订阅机制，组件渲染时自行重读）
  const approvalTodos = useMemo(() => {
    const candidates = [roleName, userName, ...(ROLE_APPROVAL_NODES[role] || [])].filter(Boolean)
    const seen = new Set()
    const list = []
    candidates.forEach((key) => {
      approvalStore.pendingFor(key).forEach((item) => {
        if (seen.has(item.id)) return
        seen.add(item.id)
        const typeLabel = APPROVAL_TYPES.find((t) => t.value === item.type)?.label || item.type
        list.push({
          id: `approval-${item.id}`,
          kind: 'approval',
          title: `【${typeLabel}审批】${item.title}`,
          source: `提交人：${item.submittedBy || '-'}`,
          time: formatTime(item.submittedAt),
          path: APPROVAL_TYPE_PATH[item.type] || '/admin/dashboard',
          projectId: item.projectId || ''
        })
      })
    })
    return list
  }, [role, roleName, userName])

  // 项目状态待办：projectStore 中处于「需当前角色处理」状态的项目
  const projectTodos = useMemo(() => {
    const map = PROJECT_STATUS_TODOS[role] || {}
    return projectStore
      .getProjects()
      .filter((p) => map[p.status])
      .map((p) => ({
        id: `project-${p.id}`,
        kind: 'project',
        title: `项目「${p.name || p.code || p.id}」${map[p.status].text}`,
        source: `项目编号：${p.code || '-'}`,
        time: formatTime(p.submitTime || p.createTime),
        path: map[p.status].path,
        projectId: p.id
      }))
  }, [role])

  // 系统待办 mock（清单 47：各角色面板均含系统待办）
  const systemTodos = useMemo(
    () =>
      (SYSTEM_TODOS[role] || []).map((t, i) => ({
        id: `system-${role}-${i}`,
        kind: 'system',
        projectId: '',
        ...t
      })),
    [role]
  )

  const todos = useMemo(
    () => [...approvalTodos, ...projectTodos, ...systemTodos],
    [approvalTodos, projectTodos, systemTodos]
  )

  const filtered = tab === 'all' ? todos : todos.filter((t) => t.kind === tab)

  const handleTodo = (row) => {
    if (row.projectId) {
      navigate({ to: row.path, search: { projectId: String(row.projectId) } })
    } else {
      navigate({ to: row.path })
    }
  }

  const columns = [
    {
      title: '类型',
      dataIndex: 'kind',
      width: 110,
      render: (kind) => <Tag color={KIND_MAP[kind]?.color}>{KIND_MAP[kind]?.label || kind}</Tag>
    },
    { title: '标题', dataIndex: 'title', minWidth: 320 },
    { title: '来源', dataIndex: 'source', width: 200 },
    { title: '时间', dataIndex: 'time', width: 170 },
    {
      title: '操作',
      width: 100,
      render: (_, row) => (
        <Button type="link" onClick={() => handleTodo(row)}>处理</Button>
      )
    }
  ]

  const tabItems = [
    { key: 'all', label: `全部（${todos.length}）` },
    { key: 'approval', label: `审批待办（${approvalTodos.length}）` },
    { key: 'project', label: `项目待办（${projectTodos.length}）` },
    { key: 'system', label: `系统待办（${systemTodos.length}）` }
  ]

  return (
    <div className="todo-center">
      <Card
        title={
          <div className="card-header">
            <span>待办中心</span>
            <Tag color="error">{todos.length} 项待处理</Tag>
          </div>
        }
      >
        <Alert
          title={`当前角色：${roleName}。按角色聚合审批待办、项目状态待办与系统待办，点击「处理」直达对应处理页面。`}
          type="info"
          showIcon
          closable={false}
          style={{ marginBottom: 20 }}
        />
        <Tabs type="card" activeKey={tab} onChange={setTab} items={tabItems} />
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          pagination={false}
          style={{ width: '100%' }}
          locale={{ emptyText: <Empty description="当前没有待办事项" /> }}
        />
      </Card>

      <style>{`
        .todo-center {
          max-width: 1100px;
          margin: 0 auto;
        }
        .todo-center .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
          width: 100%;
        }
      `}</style>
    </div>
  )
}
