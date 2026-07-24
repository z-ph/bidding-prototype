import { useState, useMemo } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Card, Select, Alert, Timeline, Button, Descriptions, Tag, Table } from 'antd'
import { projectStore } from '../data/projects.js'
import { useRole } from '../hooks/useRole.js'
import {
  BASELINE_PROJECTS,
  getPurchaseModeText,
  isInquiryFamily,
  PROJECT_STATUS_MAP
} from './ProjectList.jsx'
import {
  CheckCircleOutlined,
  EditOutlined,
  UploadOutlined,
  PlayCircleOutlined,
  StarOutlined,
  TrophyOutlined
} from '@ant-design/icons'
import { getProjectFlowNodes, getTendereeStatusSummary } from '../utils/projectFlow.js'

const iconMap = {
  CheckCircleOutlined,
  EditOutlined,
  UploadOutlined,
  PlayCircleOutlined,
  StarOutlined,
  TrophyOutlined
}

export default function ProjectTrack() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false })
  const { role } = useRole()
  const isBidder = role === 'bidder'
  const isSupervisor = role === 'supervisor'
  const isTenderSide = ['tenderee', 'agent', 'admin'].includes(role)
  const queryProjectId = searchParams.projectId
  const [projectId, setProjectId] = useState(queryProjectId || '1')

  const projectOptions = useMemo(() => {
    const stored = projectStore.getProjects().slice(0, 20)
    const map = new Map()
    BASELINE_PROJECTS.forEach((p) => map.set(String(p.id), p.name))
    stored.forEach((p) => map.set(String(p.id), p.name))
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }))
  }, [projectId])

  const currentProject = useMemo(() => {
    const stored = projectStore.getProjectById(projectId)
    if (stored) return stored
    const baseline = BASELINE_PROJECTS.find((p) => String(p.id) === String(projectId))
    if (baseline) return baseline
    return {
      id: projectId,
      name: projectOptions.find((p) => p.value === projectId)?.label || '-',
      deadline: '2026-07-20 17:00',
      packages: [
        { name: '第一采购包：主设备', code: 'B1', bidEnd: '2026-07-20 17:00' },
        { name: '第二采购包：辅材', code: 'B2', bidEnd: '2026-07-20 17:00' }
      ]
    }
  }, [projectId, projectOptions])

  const inquiryFamily = isInquiryFamily(currentProject)

  const deadline = currentProject.deadline || (currentProject.packages?.[0]?.bidEnd)
  const isDeadlinePassed = deadline ? new Date() > new Date(deadline) : false

  const go = (path) => navigate({ to: path })

  // 采购方/监督方：基于项目真实状态的流程节点
  const tenderFlowNodes = useMemo(() => getProjectFlowNodes(currentProject), [currentProject])
  const tendereeSummary = useMemo(
    () => getTendereeStatusSummary(currentProject),
    [currentProject]
  )

  const handleTendereeAction = (action) => {
    if (!action) return
    if (action.type === 'publish') {
      // 采购方在项目跟踪页不直接发布采购，引导到项目详情
      navigate({ to: `/admin/projects/detail/${currentProject.id}` })
      return
    }
    if (action.type === 'navigate') {
      navigate({ to: action.target, search: action.search })
    }
  }

  // 响应单位视角：公告期从下载采购文件开始（新口径无报名/缴费环节）
  const currentNode = isDeadlinePassed ? '待开启' : '下载采购文件'
  const currentStatus = isDeadlinePassed
    ? '响应已截止，等待开启'
    : '公告中，可下载采购文件并编制响应文件'
  const nextStepLabel = isDeadlinePassed ? '下一步：准时参加在线开启' : '下一步：下载采购文件'
  const nextStepAction = isBidder && !isDeadlinePassed
    ? { label: '去下载', path: `/admin/bid-download?projectId=${projectId}` }
    : null

  // 响应单位视角时间线（hall-purchase-method-mapping-20260721：采购族含线上开启，询比族含线上比价；评审对所有项目开放）
  const bidderNodes = [
    { key: 'requirement', title: '创建采购需求', desc: '采购单位创建需求并提交审核', time: '2026-07-01 10:00', color: 'green', icon: 'CheckCircleOutlined' },
    { key: 'doc', title: '编制采购文件', desc: '代理机构编制采购文件、配置评审办法', time: '2026-07-02 14:00', color: 'green', icon: 'EditOutlined' },
    { key: 'notice', title: '发布采购公告', desc: '采购公告已发布至门户，供应商可下载采购文件', time: '2026-07-03 09:00', color: 'green', icon: 'CheckCircleOutlined' },
    {
      key: 'bid',
      title: inquiryFamily ? '上传响应文件/报价' : '上传响应文件',
      desc: '供应商下载采购文件后上传加密响应文件并报价',
      time: '进行中',
      color: 'blue',
      icon: 'UploadOutlined',
      action: '去上传',
      path: `/admin/bid-upload?projectId=${projectId}`
    },
    ...(inquiryFamily
      ? [{ key: 'comparison', title: '线上比价', desc: '比价大厅比较各供应商报价', time: '待进行', color: 'gray', icon: 'PlayCircleOutlined' }]
      : [{ key: 'opening', title: '线上开启', desc: '开启大厅完成签到、解密、唱价', time: '待进行', color: 'gray', icon: 'PlayCircleOutlined' }]),
    { key: 'evaluation', title: '线上评审', desc: '专家评分、生成评审报告', time: '待进行', color: 'gray', icon: 'StarOutlined' },
    { key: 'award', title: '成交确认公示', desc: '确认中选人并发布结果公示', time: '待进行', color: 'gray', icon: 'TrophyOutlined' }
  ]

  const renderTimelineItems = (nodes) =>
    nodes.map((node, idx) => {
      const Icon = iconMap[node.icon]
      return {
        key: idx,
        color: node.color,
        dot: Icon ? <Icon /> : null,
        content: (
          <>
            <h4>{node.title || node.label}</h4>
            <p>{node.desc}</p>
            {node.action && (
              <Button type="primary" size="small" onClick={() => go(node.path)}>
                {node.action}
              </Button>
            )}
            <p style={{ color: '#999', fontSize: 12, marginTop: 4 }}>{node.time}</p>
          </>
        )
      }
    })

  return (
    <div className="project-track">
      <Card
        title={
          <div className="card-header">
            <span>项目跟踪</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Tag color={inquiryFamily ? 'purple' : 'default'} style={{ marginInlineEnd: 0 }}>
                采购方式：{getPurchaseModeText(currentProject)}
              </Tag>
              <Select
                placeholder="选择项目"
                style={{ width: 260 }}
                value={projectId}
                onChange={(value) => setProjectId(value)}
                options={projectOptions}
              />
            </div>
          </div>
        }
      >
        <Alert
          title="按角色查看项目当前节点和下一步操作，掌握项目进度。绿色节点为已完成，蓝色节点为进行中，灰色节点为待进行。"
          type="info"
          showIcon
          closable={false}
          style={{ marginBottom: 20 }}
        />

        {isTenderSide && (
          <Card size="small" title="当前状态与下一步" style={{ marginBottom: 20, background: '#f6ffed' }}>
            <Descriptions column={2}>
              <Descriptions.Item label="当前节点">{tendereeSummary.currentNode}</Descriptions.Item>
              <Descriptions.Item label="截止时间">{deadline}</Descriptions.Item>
              <Descriptions.Item label="当前状态">
                <Tag color={PROJECT_STATUS_MAP[currentProject.status]?.color || 'default'}>
                  {tendereeSummary.currentStatus}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="下一步">
                {tendereeSummary.firstAction ? (
                  <>
                    <span style={{ marginRight: 12 }}>{tendereeSummary.nextStepLabel}</span>
                    <Button type="primary" size="small" onClick={() => handleTendereeAction(tendereeSummary.firstAction.action)}>
                      {tendereeSummary.firstAction.buttonText}
                    </Button>
                  </>
                ) : (
                  <span>暂无后续操作</span>
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        {isBidder && (
          <Card size="small" title="当前状态与下一步" style={{ marginBottom: 20, background: '#f6ffed' }}>
            <Descriptions column={2}>
              <Descriptions.Item label="当前节点">{currentNode}</Descriptions.Item>
              <Descriptions.Item label="截止时间">{deadline}</Descriptions.Item>
              <Descriptions.Item label="当前状态">
                <Tag color={isDeadlinePassed ? 'warning' : 'processing'}>{currentStatus}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="下一步">
                {isDeadlinePassed ? (
                  <span>响应已截止，等待开启</span>
                ) : (
                  <>
                    <span style={{ marginRight: 12 }}>{nextStepLabel}</span>
                    {nextStepAction && (
                      <Button type="primary" size="small" onClick={() => go(nextStepAction.path)}>
                        {nextStepAction.label}
                      </Button>
                    )}
                  </>
                )}
              </Descriptions.Item>
            </Descriptions>
            {isDeadlinePassed && (
              <Alert
                title="提示：采购截止时间已过，当前项目不再接受新的响应文件。"
                type="warning"
                showIcon
                closable={false}
                style={{ marginTop: 12 }}
              />
            )}
          </Card>
        )}

        <Alert
          title={isSupervisor
            ? '当前为监督视角，仅可查看项目进度，不可执行操作。'
            : isBidder
              ? '当前为响应单位视角：公告期从下载采购文件开始（新口径无报名/缴费环节），请在采购截止前完成响应文件上传。'
              : '当前为采购方视角，下载采购文件、上传响应文件等响应单位动作由供应商在其工作台完成。'}
          type="info"
          showIcon
          closable={false}
          style={{ marginBottom: 20 }}
        />

        {inquiryFamily && (
          <Alert
            title="询比族项目（公开询比/邀请询比）：报价截止后进入比价大厅比较报价，再进入评审大厅评审（2026-07-21 新口径，无开启环节）。"
            type="info"
            showIcon
            closable={false}
            style={{ marginBottom: 20 }}
          />
        )}

        <Card size="small" title="采购包采购截止时间" style={{ marginBottom: 20 }}>
          <Table
            rowKey="code"
            size="small"
            pagination={false}
            dataSource={currentProject.packages || []}
            columns={[
              { title: '采购包名称', dataIndex: 'name' },
              { title: '采购包编号', dataIndex: 'code', width: 120 },
              { title: '采购截止时间', dataIndex: 'bidEnd', width: 180, render: (v) => v || '-' }
            ]}
          />
        </Card>

        <Timeline
          items={renderTimelineItems(isTenderSide ? tenderFlowNodes : bidderNodes)}
        />
      </Card>

      <style>{`
        .project-track {
          max-width: 1000px;
          margin: 0 auto;
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
        }
      `}</style>
    </div>
  )
}
