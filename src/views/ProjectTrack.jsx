import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Card, Select, Alert, Timeline, Button, Descriptions, Tag, Table } from 'antd'
import { projectStore } from '../data/projects.js'
import { useRole } from '../hooks/useRole.js'
import {
  BASELINE_PROJECTS,
  OPENING_EVALUATION_NODE_KEYS,
  getPurchaseModeText,
  isInvitedRfqProject
} from './ProjectList.jsx'
import {
  CheckCircleOutlined,
  EditOutlined,
  UploadOutlined,
  PlayCircleOutlined,
  StarOutlined,
  TrophyOutlined,
  CheckSquareOutlined,
  WalletOutlined
} from '@ant-design/icons'

export default function ProjectTrack() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false })
  const { role } = useRole()
  const isBidder = role === 'bidder'
  const isSupervisor = role === 'supervisor'
  const isTenderSide = ['tenderee', 'agent', 'admin'].includes(role)
  const queryProjectId = searchParams.projectId
  const [projectId, setProjectId] = useState(queryProjectId || '1')
  const [paid, setPaid] = useState(false)
  const [operationRecords, setOperationRecords] = useState([])

  const projectOptions = useMemo(() => {
    const stored = projectStore.getProjects().slice(0, 20)
    // 基线 mock 项目（含邀请询比价样例）+ projectStore 新建/变更项目，同 id 以 store 为准
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

  // 采购方式分流（add-purchase-method-flow-20260717）：纯邀请询比价项目无开标/评标节点
  const invitedRfq = isInvitedRfqProject(currentProject)

  const deadline = currentProject.deadline || (currentProject.packages?.[0]?.bidEnd)
  const isDeadlinePassed = deadline ? new Date() > new Date(deadline) : false

  useEffect(() => {
    setPaid(false)
  }, [projectId])

  const iconMap = {
    CheckCircleOutlined,
    EditOutlined,
    UploadOutlined,
    PlayCircleOutlined,
    StarOutlined,
    TrophyOutlined,
    CheckSquareOutlined,
    WalletOutlined
  }

  // 节点 key 与 ProjectList 的 PURCHASE_METHOD_FLOW_MAP 口径一致
  const allNodes = [
    { key: 'requirement', title: '创建采购需求', desc: '招标人创建需求并提交审核', time: '2026-07-01 10:00', color: 'green', icon: 'CheckCircleOutlined' },
    { key: 'doc', title: '编制招标文件', desc: '代理机构编制招标文件、配置评标办法', time: '2026-07-02 14:00', color: 'green', icon: 'EditOutlined' },
    { key: 'notice', title: '发布招标公告', desc: '招标公告已发布至门户，供应商可报名', time: '2026-07-03 09:00', color: 'green', icon: 'CheckCircleOutlined' },
    {
      key: 'register',
      title: '投标报名与缴费',
      desc: isBidder
        ? (paid ? '供应商报名并通过审核、已缴纳费用' : '供应商报名并通过审核、等待缴纳费用')
        : '供应商报名中，等待缴费完成',
      time: paid ? '2026-07-05 16:00' : '进行中',
      color: paid ? 'green' : 'blue',
      icon: 'WalletOutlined',
      action: isBidder && !paid ? '去缴纳' : undefined,
      path: `/admin/bid-payment?projectId=${projectId}`
    },
    {
      key: 'bid',
      title: '上传投标文件',
      desc: isBidder ? '供应商上传加密投标文件并报价' : '等待供应商上传加密投标文件并报价',
      time: paid ? '进行中' : '待进行',
      color: paid ? 'blue' : 'gray',
      icon: 'UploadOutlined',
      action: isBidder && paid ? '去上传' : undefined,
      path: `/admin/bid-upload?projectId=${projectId}`
    },
    { key: 'opening', title: '线上开标', desc: '开标大厅完成签到、解密、唱标', time: '待进行', color: 'gray', icon: 'PlayCircleOutlined' },
    { key: 'evaluation', title: '线上评标', desc: '专家评分、生成评标报告', time: '待进行', color: 'gray', icon: 'StarOutlined' },
    { key: 'award', title: '定标公示', desc: '确认中标人并发布结果公示', time: '待进行', color: 'gray', icon: 'TrophyOutlined' },
    { key: 'contract', title: '合同归档', desc: '上传合同，项目结束', time: '待进行', color: 'gray', icon: 'CheckSquareOutlined' }
  ]

  // 邀请询比价（清单 20）：时间线剔除开标/评标节点，报价后直接进入定标/采购结果；
  // 定标节点对招标方给出「前往定标」入口（项目中心按钮联动）
  const nodes = (invitedRfq
    ? allNodes.filter((node) => !OPENING_EVALUATION_NODE_KEYS.includes(node.key))
    : allNodes
  ).map((node) =>
    node.key === 'award' && invitedRfq && isTenderSide
      ? {
          ...node,
          desc: '邀请询比价无开标/评标环节，报价截止后直接确认成交供应商并发布结果公示',
          action: '前往定标',
          path: `/admin/award-confirm?projectId=${projectId}`
        }
      : node
  )

  const go = (path) => navigate({ to: path })

  const addOperationRecord = (action, detail) => {
    setOperationRecords((prev) => [
      {
        id: Date.now(),
        action,
        detail,
        time: new Date().toLocaleString()
      },
      ...prev
    ])
  }

  const currentNode = paid ? '上传投标文件' : '投标报名与缴费'
  const currentStatus = isBidder
    ? (paid ? '已缴费，等待上传投标文件' : '报名中，等待缴纳文件费')
    : (paid ? '供应商已缴费，等待上传投标文件' : '供应商报名中，等待缴纳文件费')
  const nextStepLabel = isBidder
    ? (paid ? '下一步：上传投标文件' : '下一步：缴纳文件费')
    : (paid ? '下一步：等待供应商上传投标文件' : '下一步：等待供应商缴纳文件费')
  // 招标方/监督不展示投标人动作按钮，仅查看进度
  const nextStepAction = isBidder
    ? (paid
        ? { label: '去上传', path: `/admin/bid-upload?projectId=${projectId}` }
        : { label: '去缴纳', path: `/admin/bid-payment?projectId=${projectId}` })
    : null

  const togglePaid = () => {
    setPaid((prev) => {
      const next = !prev
      if (next) {
        addOperationRecord('缴纳文件费', '供应商已完成文件费缴纳，流程进入投标文件上传阶段')
      } else {
        addOperationRecord('重置缴费状态', '演示：已重置文件费缴纳状态')
      }
      return next
    })
  }

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

        <Card size="small" title="当前状态与下一步" style={{ marginBottom: 20, background: '#f6ffed' }}>
          <Descriptions column={2}>
            <Descriptions.Item label="当前节点">{currentNode}</Descriptions.Item>
            <Descriptions.Item label="截止时间">{deadline}</Descriptions.Item>
            <Descriptions.Item label="当前状态">
              <Tag color={paid ? 'success' : 'processing'}>{currentStatus}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="下一步">
              {isDeadlinePassed ? (
                <span style={{ color: '#ff4d4f' }}>已截止，无法报名</span>
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
              title="阻断原因：报名截止时间已过，当前项目不再接受新的报名或缴费。"
              type="error"
              showIcon
              closable={false}
              style={{ marginTop: 12 }}
            />
          )}
        </Card>

        {isBidder ? (
          <Alert
            title="演示：点击“去缴纳”模拟完成文件费缴纳，缴纳后流程节点动态更新。"
            type="warning"
            showIcon
            closable={false}
            style={{ marginBottom: 20 }}
            action={
              <Button size="small" onClick={togglePaid}>
                {paid ? '重置缴费状态' : '模拟已缴费'}
              </Button>
            }
          />
        ) : (
          <Alert
            title={isSupervisor
              ? '当前为监督视角，仅可查看项目进度，不可执行操作。'
              : isTenderSide
                ? '当前为招标方视角，缴纳费用、上传投标文件等投标人动作由供应商在其工作台完成。'
                : '当前角色仅可查看项目进度，不可执行投标人动作。'}
            type="info"
            showIcon
            closable={false}
            style={{ marginBottom: 20 }}
          />
        )}

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
          items={nodes.map((node, idx) => {
            const Icon = iconMap[node.icon]
            return {
              key: idx,
              color: node.color,
              dot: Icon ? <Icon /> : null,
              content: (
                <>
                  <h4>{node.title}</h4>
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
          })}
        />

        {operationRecords.length > 0 && (
          <>
            <h3 style={{ marginTop: 24 }}>操作记录</h3>
            <Timeline
              items={operationRecords.map((record) => ({
                key: record.id,
                color: 'blue',
                content: (
                  <div>
                    <strong>{record.action}</strong>
                    <span style={{ color: '#999', marginLeft: 12, fontSize: 12 }}>{record.time}</span>
                    <p style={{ margin: '4px 0 0', color: '#666' }}>{record.detail}</p>
                  </div>
                )
              }))}
            />
          </>
        )}
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
