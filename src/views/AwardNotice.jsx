import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Alert, Button, Card, Form, Input, Select, Steps, Tag, message, Modal } from 'antd'
import { CheckOutlined, LockOutlined } from '@ant-design/icons'
import { projectStore } from '../data/projects.js'
import { evaluationStore } from '../data/evaluationStore.js'
import { STAGE_LABELS, stageIndex, resolveAwardStage as resolveAwardStageBase } from '../utils/awardFlow.js'
import ProjectEntryGuard from '../components/ProjectEntryGuard.jsx'
import { useRole } from '../hooks/useRole.js'

// 定标阶段推导统一走 utils/awardFlow.js（fix-award-step-regression-20260721），
// 与 AwardConfirm 同一口径，避免重复实现漂移导致步骤回退。
// hall-purchase-method-mapping-20260721 后所有项目（含询比族）均走评标，不再传询比短路分支
const resolveAwardStage = (projectId, project) =>
  resolveAwardStageBase(projectId, project, evaluationStore, null)

export default function AwardNotice() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false })
  const { role } = useRole()
  const projectIdFromQuery = searchParams.projectId

  const [projectId, setProjectId] = useState(String(projectIdFromQuery))

  const [form, setForm] = useState({
    title: '',
    bidder: '',
    amount: '',
    content: '',
    signed: false
  })

  const projectOptions = useMemo(() => {
    const stored = projectStore.getProjects().slice(0, 20)
    const map = new Map()
    stored.forEach((p) => map.set(String(p.id), p.name))
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }))
  }, [])

  const project = useMemo(
    () => projectStore.getProjectById(projectId) || null,
    [projectId]
  )
  const projectName =
    project?.name || projectOptions.find((p) => p.value === projectId)?.label || '-'

  const stage = resolveAwardStage(projectId, project)
  const sent = stage === 'notice-sent'
  // 中标人是否已确认：早于 winner-confirmed 阶段时通知书不可编辑/发送（fix-award-step-regression-20260721）
  const confirmed = stageIndex(stage) >= stageIndex('winner-confirmed')

  // 切换/刷新项目时按所选项目渲染
  useEffect(() => {
    const record = projectStore.getProjectById(projectId)
    const notice = record?.notice
    const winner = record?.winner
    const name = record?.name || '-'
    if (notice) {
      setForm({ ...notice })
    } else {
      setForm({
        title: `${name}中标通知书`,
        bidder: winner?.name || '',
        amount: winner?.price ? `${winner.price} 万元` : '',
        content: `贵司参与的 ${name} 经评标委员会评审、招标人确认，被确定为中标人。请于收到通知书后 30 日内与招标人签订合同。`,
        signed: false
      })
    }
  }, [projectId])

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const sign = () => {
    message.success('演示环境 · 电子签章仅作展示')
    updateField('signed', true)
  }

  const preview = () => {
    message.success('演示环境 · 打开中标通知书预览')
  }

  const send = () => {
    Modal.confirm({
      title: '发送中标通知书',
      content: `确定将「${projectName}」的中标通知书发送给中标人 ${form.bidder} 吗？`,
      okText: '确认发送',
      cancelText: '取消',
      onOk: () => {
        message.success('演示环境 · 中标通知书已发送')
      }
    })
  }

  const isBidder = role === 'bidder'

  const stepsCurrent = {
    evaluating: 0,
    'evaluation-done': 2,
    'winner-confirmed': 4,
    'notice-sent': 5
  }[stage]

  // 入口守卫（所有 hooks 之后）：无 projectId 时阻断并引导从项目进入；
  // 同路由无参→有参导航复用组件实例，hooks 数量必须保持不变
  if (!projectIdFromQuery) {
    return <ProjectEntryGuard />
  }

  return (
    <div className="award-notice">
      <Card
        title={
          <div className="card-header">
            <span>发送中标通知书</span>
            <span>
              <Tag color="warning">项目：{projectName}</Tag>
              <Tag color={!sent ? 'processing' : 'default'}>{STAGE_LABELS[stage]}</Tag>
              {form.bidder && <Tag color="success">中标人：{form.bidder}</Tag>}
            </span>
          </div>
        }
      >
        <div className="project-bar">
          <span className="project-bar-label">选择项目</span>
          <Select
            style={{ minWidth: 320 }}
            value={projectId}
            options={projectOptions}
            onChange={(value) => setProjectId(String(value))}
          />
        </div>
        <Steps
          current={stepsCurrent}
          style={{ marginBottom: 24 }}
          items={[
            { title: '评标结束' },
            { title: '候选人公示' },
            { title: '确认中标人' },
            { title: '结果公示' },
            { title: '发送通知书' }
          ]}
        />
        {!confirmed && (
          <Alert
            title={`当前项目阶段：${STAGE_LABELS[stage]}。需先在「确认中标人」页面完成中标人确认后，才能发送中标通知书。`}
            type="warning"
            showIcon
            icon={<LockOutlined />}
            closable={false}
            style={{ marginBottom: 20 }}
          />
        )}
        {confirmed && !sent && (
          <Alert
            title="根据模板生成中标通知书，支持在线编辑、签章后发送给中标人。发送后中标人可在工作台查看。"
            type="info"
            showIcon
            closable={false}
            style={{ marginBottom: 20 }}
          />
        )}
        {sent && (
          <Alert
            title={`中标通知书已于 ${project?.notice?.sentAt ? new Date(project.notice.sentAt).toLocaleString() : '-'} 发送给中标人 ${form.bidder}，项目定标流程已完成。`}
            type="success"
            showIcon
            closable={false}
            style={{ marginBottom: 20 }}
          />
        )}
        <Form layout="horizontal" labelCol={{ flex: '120px' }}>
          <Form.Item label="通知书标题" required>
            <Input
              value={form.title}
              disabled={sent || !confirmed}
              onChange={(e) => updateField('title', e.target.value)}
            />
          </Form.Item>
          <Form.Item label="中标人" required>
            <Input value={form.bidder || '（待确认中标人）'} disabled />
          </Form.Item>
          <Form.Item label="中标金额" required>
            <Input
              value={form.amount}
              disabled={sent || !confirmed}
              onChange={(e) => updateField('amount', e.target.value)}
            />
          </Form.Item>
          <Form.Item label="通知书正文" required>
            <Input.TextArea
              rows={10}
              value={form.content}
              disabled={sent || !confirmed}
              onChange={(e) => updateField('content', e.target.value)}
            />
          </Form.Item>
          <Form.Item label="电子签章">
            <Button type="primary" ghost disabled={sent || !confirmed} onClick={sign}>
              点击进行电子签章
            </Button>
            {form.signed && (
              <span style={{ color: '#67C23A', marginLeft: 12 }}>
                <CheckOutlined /> 已签章
              </span>
            )}
          </Form.Item>
        </Form>
        <div className="actions">
          {isBidder ? (
            <Alert type="info" message="您以投标人身份查看中标通知书，发送操作仅限招标人/招标代理。" showIcon />
          ) : (
            <>
              {confirmed && !sent && (
                <Button type="primary" size="large" onClick={send}>
                  发送中标通知书
                </Button>
              )}
              <Button size="large" onClick={preview}>预览</Button>
            </>
          )}
        </div>
      </Card>

      <style>{`
        .award-notice {
          max-width: 1000px;
          margin: 0 auto;
        }
        .award-notice .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
        }
        .award-notice .project-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        .award-notice .project-bar-label {
          font-weight: 500;
        }
        .award-notice .actions {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-top: 24px;
        }
      `}</style>
    </div>
  )
}
