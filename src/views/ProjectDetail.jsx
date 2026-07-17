import { useState, useMemo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Table,
  Tag,
  Timeline,
  message,
  Modal
} from 'antd'
import {
  CheckCircleOutlined,
  EditOutlined,
  UploadOutlined,
  PlayCircleOutlined,
  StarOutlined,
  TrophyOutlined,
  CheckSquareOutlined
} from '@ant-design/icons'
import { useRole } from '../hooks/useRole.js'
import { projectStore } from '../data/projects.js'
import { requirementStore } from '../data/requirements.js'
import { approvalStore, APPROVAL_TYPES, APPROVAL_STATUS_MAP } from '../data/approvalStore.js'
import {
  BASELINE_PROJECTS,
  PROJECT_STATUS_MAP,
  getNextStepInfo,
  getPurchaseModeText
} from './ProjectList.jsx'
import { getProjectFlowNodes, getTendereeActions } from '../utils/projectFlow.js'
import EmptyState from '../components/EmptyState.jsx'

const FALLBACK_PROJECT = {
  id: 1,
  name: 'XX市轨道交通设备采购项目',
  code: 'ZB20260701001',
  orgMode: 'self',
  budget: 850,
  status: 'registering',
  publishTime: '2026-07-01',
  deadline: '2026-07-20',
  openTime: '2026-07-21 09:30',
  demandSource: '年度采购计划',
  demandCode: 'XQ-2026-001',
  linkedRequirementId: '',
  agentId: '',
  packages: [
    { name: '第一标段：主设备', code: 'B1', budget: 600, content: '主设备采购', purchaseMode: 'open', bidStart: '2026-07-10 09:00', bidEnd: '2026-07-20 17:00' },
    { name: '第二标段：辅材', code: 'B2', budget: 250, content: '辅助材料', purchaseMode: 'open', bidStart: '2026-07-10 09:00', bidEnd: '2026-07-20 17:00' }
  ],
  qualifications: ['营业执照', 'ISO9001认证'],
  intro: '本项目为轨道交通设备采购，包含主设备及辅材两个标段。'
}

const formatDate = (v) => {
  if (!v) return '-'
  const d = new Date(v)
  return isNaN(d.getTime()) ? String(v) : d.toLocaleDateString()
}

const formatTime = (t) => {
  if (!t) return '-'
  const d = new Date(t)
  return isNaN(d.getTime()) ? String(t) : d.toLocaleString()
}

// 审批归档（清单 53）：审批节点/操作人/意见/附件/签名(mock)/时间全量只读展示
const APPROVAL_ACTION_LABELS = {
  approve: '通过',
  reject: '驳回',
  'add-sign': '加签',
  transfer: '转办',
  return: '退回'
}
const approvalTypeLabel = (type) =>
  APPROVAL_TYPES.find((t) => t.value === type)?.label || type

const NODE_ICON_MAP = {
  CheckCircleOutlined,
  EditOutlined,
  UploadOutlined,
  PlayCircleOutlined,
  StarOutlined,
  TrophyOutlined,
  CheckSquareOutlined
}

export default function ProjectDetail() {
  const { id } = useParams({ strict: false })
  const navigate = useNavigate()
  const { role } = useRole()

  // 与项目列表同一数据源：projectStore 优先，mock 基线兜底（2052-004 / project-list-detail-sync）
  const [project, setProject] = useState(() => {
    const stored = projectStore.getProjectById(id)
    if (stored) return stored
    const baseline = BASELINE_PROJECTS.find((p) => String(p.id) === String(id))
    return baseline || { ...FALLBACK_PROJECT, id: Number(id) || 1 }
  })

  const linkedRequirement = project.linkedRequirementId
    ? requirementStore.getRequirementById(project.linkedRequirementId)
    : null

  // 本项目的全部审批记录（含中标结果审批登记），只读归档视图，不可在此修改
  const projectApprovals = approvalStore
    .list({ projectId: String(project.id) })
    .slice()
    .sort((a, b) => String(b.submittedAt).localeCompare(String(a.submittedAt)))

  const orgModeText = { self: '自行招标', agent: '委托代理' }[project.orgMode] || project.orgMode || '-'
  const agentOption = project.agentId
    ? [{ label: '诚信招标代理有限公司', value: 'agent_01' }, { label: '国信招标代理股份有限公司', value: 'agent_02' }, { label: '中机国际招标有限公司', value: 'agent_03' }].find((a) => a.value === project.agentId)
    : null

  const purchaseModeText = getPurchaseModeText(project)
  // 下一步口径与项目列表一致（含邀请询比价直达定标），统一走 getNextStepInfo
  const nextStepInfo = getNextStepInfo(project)

  const beforeOpen = ['draft', 'tendering', 'registering'].includes(project.status)

  // 按采购方式过滤流程节点，并按当前状态高亮
  const flowNodes = useMemo(() => getProjectFlowNodes(project), [project])

  const tendereeActions = useMemo(() => getTendereeActions(project), [project])

  const publish = () => {
    Modal.confirm({
      title: '发标确认',
      content: `确认发布项目“${project.name}”？发布后将进入招标中状态并生成公告。`,
      okText: '确认发标',
      cancelText: '取消',
      onOk: () => {
        try {
          const saved = projectStore.saveProject({
            ...project,
            status: 'tendering',
            publishTime: new Date().toISOString().slice(0, 10)
          })
          setProject(saved)
          message.success('项目已发标，状态更新为「招标中」；下一步可前往「公告发布」发布招标公告')
        } catch {
          message.error('发标失败，请重试')
        }
      }
    })
  }

  const goEdit = () => {
    navigate({ to: '/admin/projects/create', search: { editId: project.id } })
  }

  const goTenderDoc = () => {
    navigate({ to: '/admin/tender-doc', search: { projectId: project.id } })
  }

  const goNextStep = () => {
    const actions = getTendereeActions(project)
    const first = actions[0]
    if (!first?.action) return
    handleAction(first.action)
  }

  const handleAction = (action) => {
    if (!action) return
    if (action.type === 'publish') {
      publish()
      return
    }
    if (action.type === 'navigate') {
      navigate({ to: action.target, search: action.search })
    }
  }

  const packageColumns = [
    { title: '标段名称', dataIndex: 'name', width: 200 },
    { title: '标段编号', dataIndex: 'code', width: 100 },
    { title: '采购方式', dataIndex: 'purchaseMode', width: 120, render: (v) => ({ open: '公开招标', invitation: '邀请招标', inquiry: '公开询比价', invitation_inquiry: '邀请询比价' }[v] || v || '-') },
    { title: '预算金额', dataIndex: 'budget', width: 120, render: (v) => (v ? `${v} 万元` : '-') },
    { title: '投标开始', dataIndex: 'bidStart', width: 160, render: (v) => formatTime(v) },
    { title: '投标截止', dataIndex: 'bidEnd', width: 160, render: (v) => formatTime(v) },
    { title: '采购内容', dataIndex: 'content', ellipsis: true }
  ]

  return (
    <div className="project-detail">
      <Card
        title={
          <div className="detail-header">
            <div>
              <h2>{project.name}</h2>
              <p className="subtitle">{project.code || '-'} · {purchaseModeText}</p>
            </div>
            <div className="detail-actions">
              <Tag color={PROJECT_STATUS_MAP[project.status]?.color || 'default'}>
                {PROJECT_STATUS_MAP[project.status]?.text || project.status}
              </Tag>
              {role === 'tenderee' && beforeOpen && (
                <Button onClick={goEdit} icon={<EditOutlined />}>
                  编辑
                </Button>
              )}
              {role === 'tenderee' && project.status === 'draft' && (
                <Button type="primary" onClick={publish}>发标</Button>
              )}
              <Button onClick={() => navigate({ to: '/admin/projects' })}>返回列表</Button>
            </div>
          </div>
        }
      >
        <Alert
          title={`当前状态：${PROJECT_STATUS_MAP[project.status]?.text || project.status} · 下一步：${nextStepInfo.description}`}
          type={project.status === 'done' ? 'success' : 'info'}
          showIcon
          closable={false}
          style={{ marginBottom: 20 }}
          action={
            tendereeActions.length > 0 ? (
              <Button size="small" type="primary" onClick={goNextStep}>
                {nextStepInfo.label}
              </Button>
            ) : null
          }
        />

        {tendereeActions.length > 0 && (
          <Card title="当前阶段操作" size="small" style={{ marginBottom: 20 }}>
            <div className="action-grid">
              {tendereeActions.map((action, idx) => (
                <Card
                  key={idx}
                  size="small"
                  className="action-card"
                  title={action.title}
                  extra={
                    <Button type="primary" size="small" onClick={() => handleAction(action.action)}>
                      {action.buttonText}
                    </Button>
                  }
                >
                  <p style={{ margin: 0, color: '#666', fontSize: 13 }}>{action.desc}</p>
                </Card>
              ))}
            </div>
          </Card>
        )}

        <Descriptions column={3} bordered style={{ marginBottom: 20 }}>
          <Descriptions.Item label="项目编号">{project.code || '-'}</Descriptions.Item>
          <Descriptions.Item label="采购方式">{purchaseModeText}</Descriptions.Item>
          <Descriptions.Item label="组织方式">{orgModeText}</Descriptions.Item>
          <Descriptions.Item label="项目预算">{project.budget ? `${project.budget} 万元` : '-'}</Descriptions.Item>
          <Descriptions.Item label="发布时间">{formatDate(project.publishTime || project.submitTime)}</Descriptions.Item>
          <Descriptions.Item label="投标截止">{formatDate(project.deadline || project.packages?.[0]?.bidEnd)}</Descriptions.Item>
          <Descriptions.Item label="开标时间">{formatTime(project.openTime)}</Descriptions.Item>
          <Descriptions.Item label="代理机构">{agentOption ? agentOption.label : '-'}</Descriptions.Item>
          <Descriptions.Item label="资质要求">{(project.qualifications || []).join('、') || '-'}</Descriptions.Item>
          <Descriptions.Item label="需求来源">{project.demandSource || '-'}</Descriptions.Item>
          <Descriptions.Item label="需求编号">{project.demandCode || '-'}</Descriptions.Item>
          <Descriptions.Item label="关联采购需求">
            {linkedRequirement ? `${linkedRequirement.id} ${linkedRequirement.title}` : '-'}
          </Descriptions.Item>
        </Descriptions>

        <Card title="标段信息" size="small" style={{ marginBottom: 20 }}>
          <Table
            rowKey="code"
            dataSource={project.packages || []}
            columns={packageColumns}
            pagination={false}
            locale={{ emptyText: <EmptyState description="暂无标段，可在编辑项目中添加" /> }}
          />
        </Card>

        <Card
          title="招标文件"
          size="small"
          extra={<Button type="link" onClick={goTenderDoc}>查看/编辑招标文件</Button>}
          style={{ marginBottom: 20 }}
        >
          <p>招标公告、投标人须知、评标办法、合同条款、采购需求、投标文件格式等章节。</p>
        </Card>

        <Card
          title="审批记录（归档）"
          size="small"
          style={{ marginBottom: 20 }}
        >
          <Alert
            title="审批记录全部进入项目归档（清单 53）：节点、审批人、意见、附件、签名、时间全量保留，只读不可修改。"
            type="info"
            showIcon
            closable={false}
            style={{ marginBottom: 16 }}
          />
          {projectApprovals.length === 0 ? (
            <EmptyState description="暂无审批记录" />
          ) : (
            projectApprovals.map((approval) => (
              <Card
                key={approval.id}
                size="small"
                type="inner"
                style={{ marginBottom: 12 }}
                title={
                  <span>
                    <Tag color="blue">{approvalTypeLabel(approval.type)}</Tag>
                    {approval.title}
                  </span>
                }
                extra={
                  <Tag color={APPROVAL_STATUS_MAP[approval.status]?.color || 'default'}>
                    {APPROVAL_STATUS_MAP[approval.status]?.label || approval.status}
                  </Tag>
                }
              >
                <p style={{ color: '#666', fontSize: 13 }}>
                  提交人：{approval.submittedBy || '-'} · 提交时间：{approval.submittedAt || '-'}
                  {approval.finishedAt ? ` · 办结时间：${approval.finishedAt}` : ''}
                  {approval.docNo ? ` · 审批文号：${approval.docNo}` : ''}
                  {approval.result ? ` · 外部审批结果：${approval.result}` : ''}
                </p>
                {approval.records.length === 0 ? (
                  <p style={{ color: '#999', fontSize: 13 }}>暂无流转记录（审批中）</p>
                ) : (
                  <Table
                    rowKey={(_, idx) => idx}
                    dataSource={approval.records}
                    pagination={false}
                    size="small"
                    columns={[
                      { title: '节点', dataIndex: 'node', width: 120 },
                      {
                        title: '动作',
                        dataIndex: 'action',
                        width: 80,
                        render: (v) => APPROVAL_ACTION_LABELS[v] || v
                      },
                      { title: '操作人', dataIndex: 'actor', width: 100 },
                      { title: '意见', dataIndex: 'comment', ellipsis: true, render: (v) => v || '—' },
                      {
                        title: '附件',
                        key: 'attachments',
                        width: 140,
                        render: (_, __, idx) =>
                          idx === 0 && approval.attachments?.length
                            ? approval.attachments.join('、')
                            : '—'
                      },
                      {
                        title: '签名',
                        dataIndex: 'actor',
                        key: 'sign',
                        width: 140,
                        render: (v) => (v ? `${v}（电子签名 mock）` : '—')
                      },
                      { title: '时间', dataIndex: 'at', width: 160 }
                    ]}
                  />
                )}
              </Card>
            ))
          )}
        </Card>

        <Card title="项目流程跟踪" size="small">
          <Timeline
            items={flowNodes.map((node, idx) => {
              const Icon = NODE_ICON_MAP[node.icon]
              return {
                key: idx,
                color: node.color,
                dot: Icon ? <Icon /> : null,
                content: (
                  <>
                    <h4>{node.label}</h4>
                    <p>{node.desc}</p>
                    <p style={{ color: '#999', fontSize: 12, marginTop: 4 }}>{node.time}</p>
                  </>
                )
              }
            })}
          />
        </Card>
      </Card>

      <style>{`
        .project-detail {
          max-width: 1100px;
          margin: 0 auto;
        }
        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }
        .detail-header h2 {
          margin: 0;
        }
        .detail-header .subtitle {
          color: #666;
          margin: 8px 0 0;
        }
        .detail-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .action-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }
        .action-card .ant-card-head {
          min-height: 44px;
        }
        .action-card .ant-card-head-title {
          font-size: 14px;
          font-weight: 500;
        }
        .action-card p {
          line-height: 1.6;
        }
      `}</style>
    </div>
  )
}
