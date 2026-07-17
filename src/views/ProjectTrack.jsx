import { useState, useMemo } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Card, Select, Alert, Timeline, Button, Descriptions, Tag, Table } from 'antd'
import { projectStore } from '../data/projects.js'
import { useRole } from '../hooks/useRole.js'
import {
  BASELINE_PROJECTS,
  getPurchaseModeText,
  isInvitedRfqProject,
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
        { name: '第一标段：主设备', code: 'B1', bidEnd: '2026-07-20 17:00' },
        { name: '第二标段：辅材', code: 'B2', bidEnd: '2026-07-20 17:00' }
      ]
    }
  }, [projectId, projectOptions])

  const invitedRfq = isInvitedRfqProject(currentProject)

  const deadline = currentProject.deadline || (currentProject.packages?.[0]?.bidEnd)
  const isDeadlinePassed = deadline ? new Date() > new Date(deadline) : false

  const go = (path) => navigate({ to: path })

  // 招标方/监督方：基于项目真实状态的流程节点
  const tenderFlowNodes = useMemo(() => getProjectFlowNodes(currentProject), [currentProject])
  const tendereeSummary = useMemo(
    () => getTendereeStatusSummary(currentProject),
    [currentProject]
  )

  const handleTendereeAction = (action) => {
    if (!action) return
    if (action.type === 'publish') {
      // 招标方在项目跟踪页不直接发标，引导到项目详情
      navigate({ to: `/admin/projects/detail/${currentProject.id}` })
      return
    }
    if (action.type === 'navigate') {
      navigate({ to: action.target, search: action.search })
    }
  }

  // 投标人视角：公告期从下载招标文件开始（新口径无报名/缴费环节）
  const currentNode = isDeadlinePassed ? '待开标' : '下载招标文件'
  const currentStatus = isDeadlinePassed
    ? '投标已截止，等待开标'
    : '公告中，可下载招标文件并编制投标文件'
  const nextStepLabel = isDeadlinePassed ? '下一步：准时参加在线开标' : '下一步：下载招标文件'
  const nextStepAction = isBidder && !isDeadlinePassed
    ? { label: '去下载', path: `/admin/bid-download?projectId=${projectId}` }
    : null

  // 投标人视角时间线（新口径：无报名/缴费/合同归档节点）
  const bidderNodes = (invitedRfq
    ? [
        { key: 'requirement', title: '创建采购需求', desc: '招标人创建需求并提交审核', time: '2026-07-01 10:00', color: 'green', icon: 'CheckCircleOutlined' },
        { key: 'doc', title: '编制招标文件', desc: '代理机构编制招标文件、配置评标办法', time: '2026-07-02 14:00', color: 'green', icon: 'EditOutlined' },
        { key: 'notice', title: '发布招标公告', desc: '招标公告已发布至门户，供应商可下载招标文件', time: '2026-07-03 09:00', color: 'green', icon: 'CheckCircleOutlined' },
        {
          key: 'bid',
          title: '上传投标文件/报价',
          desc: '供应商下载招标文件后上传加密投标文件并报价',
          time: '进行中',
          color: 'blue',
          icon: 'UploadOutlined',
          action: '去上传',
          path: `/admin/bid-upload?projectId=${projectId}`
        },
        { key: 'award', title: '定标公示', desc: '确认中标人并发布结果公示', time: '待进行', color: 'gray', icon: 'TrophyOutlined' }
      ]
    : [
        { key: 'requirement', title: '创建采购需求', desc: '招标人创建需求并提交审核', time: '2026-07-01 10:00', color: 'green', icon: 'CheckCircleOutlined' },
        { key: 'doc', title: '编制招标文件', desc: '代理机构编制招标文件、配置评标办法', time: '2026-07-02 14:00', color: 'green', icon: 'EditOutlined' },
        { key: 'notice', title: '发布招标公告', desc: '招标公告已发布至门户，供应商可下载招标文件', time: '2026-07-03 09:00', color: 'green', icon: 'CheckCircleOutlined' },
        {
          key: 'bid',
          title: '上传投标文件',
          desc: '供应商下载招标文件后上传加密投标文件并报价',
          time: '进行中',
          color: 'blue',
          icon: 'UploadOutlined',
          action: '去上传',
          path: `/admin/bid-upload?projectId=${projectId}`
        },
        { key: 'opening', title: '线上开标', desc: '开标大厅完成签到、解密、唱标', time: '待进行', color: 'gray', icon: 'PlayCircleOutlined' },
        { key: 'evaluation', title: '线上评标', desc: '专家评分、生成评标报告', time: '待进行', color: 'gray', icon: 'StarOutlined' },
        { key: 'award', title: '定标公示', desc: '确认中标人并发布结果公示', time: '待进行', color: 'gray', icon: 'TrophyOutlined' }
      ]
  )

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
              <Tag color={invitedRfq ? 'purple' : 'default'} style={{ marginInlineEnd: 0 }}>
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
                  <span>投标已截止，等待开标</span>
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
                title="提示：投标截止时间已过，当前项目不再接受新的投标文件。"
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
              ? '当前为投标人视角：公告期从下载招标文件开始（新口径无报名/缴费环节），请在投标截止前完成投标文件上传。'
              : '当前为招标方视角，下载招标文件、上传投标文件等投标人动作由供应商在其工作台完成。'}
          type="info"
          showIcon
          closable={false}
          style={{ marginBottom: 20 }}
        />

        {invitedRfq && (
          <Alert
            title="邀请询比价项目：无开标、评标环节，报价截止后直接进入采购结果，时间线已隐藏开标/评标节点。"
            type="info"
            showIcon
            closable={false}
            style={{ marginBottom: 20 }}
          />
        )}

        <Card size="small" title="标段投标截止时间" style={{ marginBottom: 20 }}>
          <Table
            rowKey="code"
            size="small"
            pagination={false}
            dataSource={currentProject.packages || []}
            columns={[
              { title: '标段名称', dataIndex: 'name' },
              { title: '标段编号', dataIndex: 'code', width: 120 },
              { title: '投标截止时间', dataIndex: 'bidEnd', width: 180, render: (v) => v || '-' }
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
