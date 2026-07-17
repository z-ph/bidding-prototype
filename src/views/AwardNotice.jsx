import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Alert, Button, Card, Form, Input, Select, Steps, Tag, message, Modal } from 'antd'
import { CheckOutlined, LockOutlined } from '@ant-design/icons'
import { projectStore } from '../data/projects.js'
import { evaluationStore } from '../data/evaluationStore.js'

// 定标阶段（按推进顺序）：评标中 → 评标完成 → 已确认中标人 → 中标通知书已发出
const AWARD_STAGES = ['evaluating', 'evaluation-done', 'winner-confirmed', 'notice-sent']
const STAGE_LABELS = {
  evaluating: '评标中',
  'evaluation-done': '评标完成',
  'winner-confirmed': '已确认中标人',
  'notice-sent': '中标通知书已发出'
}

// 内置演示项目（与项目跟踪等页面同一套默认 mock）
const DEFAULT_PROJECTS = [
  { id: '1', name: 'XX市轨道交通设备采购项目' },
  { id: '2', name: '办公桌椅采购项目' }
]

// 现状可用的阶段判定（按优先级）：
// 1. 项目记录上的 awardStage —— 定标侧操作回写，最优先；
// 2. evaluationStore 评标状态 submitted/confirmed —— 评标环节已提交评标报告，视为「评标完成」；
// 3. 内置 1 号演示项目按历史演示口径默认处于「评标完成」（候选人已公示、待确认中标人），
//    其余项目默认「评标中」（evaluationStore 暂无其他页面写入，见实施报告说明）。
function resolveAwardStage(projectId, project) {
  if (project?.awardStage) return project.awardStage
  const evalStatus = evaluationStore.getEval(projectId).status
  if (evalStatus === 'submitted' || evalStatus === 'confirmed') return 'evaluation-done'
  if (String(projectId) === '1') return 'evaluation-done'
  return 'evaluating'
}

const stageIndex = (stage) => AWARD_STAGES.indexOf(stage)

export default function AwardNotice() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false })
  const [projectId, setProjectId] = useState(String(searchParams.projectId || '1'))
  // localStorage 无订阅机制：操作后递增 refreshTick 触发重读
  const [refreshTick, setRefreshTick] = useState(0)

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
    DEFAULT_PROJECTS.forEach((p) => map.set(String(p.id), p.name))
    stored.forEach((p) => map.set(String(p.id), p.name))
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }))
  }, [refreshTick])

  const project = useMemo(
    () => projectStore.getProjectById(projectId) || null,
    [projectId, refreshTick]
  )
  const projectName =
    project?.name || projectOptions.find((p) => p.value === projectId)?.label || '-'

  const stage = resolveAwardStage(projectId, project)
  // 阶段门禁：发送中标通知书需项目「已确认中标人」
  const canSend = stageIndex(stage) >= stageIndex('winner-confirmed')
  const sent = stage === 'notice-sent'

  // 切换/刷新项目时按所选项目渲染：已发出的回显通知书，已确认的按中标人信息预填
  useEffect(() => {
    const record = projectStore.getProjectById(projectId)
    const notice = record?.notice
    const winner = record?.winner
    const name =
      record?.name || DEFAULT_PROJECTS.find((p) => String(p.id) === String(projectId))?.name || '-'
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
  }, [projectId, refreshTick])

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const sign = () => {
    message.success('电子签章成功')
    updateField('signed', true)
  }

  const preview = () => {
    message.success('打开中标通知书预览')
  }

  const send = () => {
    Modal.confirm({
      title: '发送中标通知书',
      content: `确定将「${projectName}」的中标通知书发送给中标人 ${form.bidder} 吗？发送后中标人可在工作台查看，项目定标流程完成。`,
      okText: '确认发送',
      cancelText: '取消',
      onOk: () => {
        projectStore.saveProject({
          ...(project || {}),
          id: projectId,
          name: projectName,
          awardStage: 'notice-sent',
          notice: { ...form, sentAt: new Date().toISOString() }
        })
        setRefreshTick((t) => t + 1)
        message.success('中标通知书已发送给中标人')
      }
    })
  }

  const stepsCurrent = {
    evaluating: 0,
    'evaluation-done': 2,
    'winner-confirmed': 4,
    'notice-sent': 5
  }[stage]

  return (
    <div className="award-notice">
      <Card
        title={
          <div className="card-header">
            <span>发送中标通知书</span>
            <span>
              <Tag color="warning">项目：{projectName}</Tag>
              <Tag color={canSend ? 'processing' : 'default'}>{STAGE_LABELS[stage]}</Tag>
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
        {!canSend && (
          <Alert
            title={`当前项目阶段：${STAGE_LABELS[stage]}。需先在「确认中标人」页面完成中标人确认后，才能发送中标通知书。`}
            type="warning"
            showIcon
            icon={<LockOutlined />}
            closable={false}
            style={{ marginBottom: 20 }}
          />
        )}
        {canSend && !sent && (
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
              disabled={!canSend || sent}
              onChange={(e) => updateField('title', e.target.value)}
            />
          </Form.Item>
          <Form.Item label="中标人" required>
            <Input value={form.bidder || '（待确认中标人）'} disabled />
          </Form.Item>
          <Form.Item label="中标金额" required>
            <Input
              value={form.amount}
              disabled={!canSend || sent}
              onChange={(e) => updateField('amount', e.target.value)}
            />
          </Form.Item>
          <Form.Item label="通知书正文" required>
            <Input.TextArea
              rows={10}
              value={form.content}
              disabled={!canSend || sent}
              onChange={(e) => updateField('content', e.target.value)}
            />
          </Form.Item>
          <Form.Item label="电子签章">
            <Button type="primary" ghost disabled={!canSend || sent} onClick={sign}>
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
          <Button type="primary" size="large" disabled={!canSend || sent} onClick={send}>
            发送中标通知书
          </Button>
          <Button size="large" disabled={!canSend} onClick={preview}>
            预览
          </Button>
          {!canSend && (
            <Button
              size="large"
              onClick={() => navigate({ to: '/admin/award-confirm', search: { projectId } })}
            >
              前往确认中标人
            </Button>
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
