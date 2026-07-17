import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Card, Table, Button, Empty, Alert, Tag, Modal, Input, message } from 'antd'
import { StarOutlined } from '@ant-design/icons'
import { expertStore } from '../data/expertStore.js'
import { evaluationStore, isEvalExpired, formatDeadline } from '../data/evaluationStore.js'
import { useRole } from '../hooks/useRole.js'
import StatusTag from '../components/StatusTag.jsx'

const PROJECT_NAMES = {
  '1': 'XX市轨道交通设备采购项目',
  '2': '办公桌椅采购项目',
  '3': '软件开发服务项目'
}

export default function ExpertTasks() {
  const navigate = useNavigate()
  const { userName } = useRole()
  // 无订阅机制：操作后通过 refreshKey 触发重读 store
  const [refreshKey, setRefreshKey] = useState(0)
  const [declineTarget, setDeclineTarget] = useState(null)
  const [declineReason, setDeclineReason] = useState('')

  const tasks = useMemo(() => {
    void refreshKey
    return expertStore.getTasksForExpert(userName).map((t) => {
      const evalData = evaluationStore.getEval(t.projectId)
      return { ...t, deadline: evalData.deadline, expired: isEvalExpired(evalData.deadline) }
    })
  }, [userName, refreshKey])

  const refresh = () => setRefreshKey((k) => k + 1)

  const confirmJoin = (row) => {
    Modal.confirm({
      title: '确认参加评标',
      content: `确认参加「${PROJECT_NAMES[row.projectId] || `项目 ${row.projectId}`}」的评标工作吗？确认后请在截止时间前提交评分。`,
      okText: '确认参加',
      cancelText: '取消',
      onOk: () => {
        expertStore.respondToTask(row.projectId, userName, 'confirm')
        message.success('已确认参加，可进入评标')
        refresh()
      }
    })
  }

  const submitDecline = () => {
    if (!declineTarget) return
    expertStore.respondToTask(declineTarget.projectId, userName, 'decline', declineReason.trim())
    message.success('已拒绝参加，系统将从备选名单递补专家')
    setDeclineTarget(null)
    setDeclineReason('')
    refresh()
  }

  const enterEvaluation = (row) => {
    if (row.expired) {
      Modal.warning({
        title: '任务已过期',
        content: `该项目评标已于 ${formatDeadline(row.deadline)} 截止，过期任务不可进入评标。`
      })
      return
    }
    if (row.confirmStatus === 'declined') {
      message.warning('您已拒绝参加该项目评标')
      return
    }
    if (row.confirmStatus !== 'confirmed') {
      message.warning('请先在列表中「确认参加」后再进入评标')
      return
    }
    navigate({ to: '/admin/expert-project', search: { projectId: row.projectId } })
  }

  const feedbackRender = (_, row) => {
    if (row.confirmStatus === 'confirmed') {
      return (
        <Tag color="success">
          已确认参加{row.promotedAt ? '（备选递补）' : ''}
        </Tag>
      )
    }
    if (row.confirmStatus === 'declined') {
      return <Tag>已拒绝{row.declineReason ? `：${row.declineReason}` : ''}</Tag>
    }
    return <Tag color="warning">待确认</Tag>
  }

  const columns = [
    {
      title: '项目名称',
      dataIndex: 'projectId',
      render: (id) => PROJECT_NAMES[id] || `项目 ${id}`
    },
    {
      title: '评标截止时间',
      dataIndex: 'deadline',
      width: 190,
      render: (deadline, row) => (
        <span style={row.expired ? { color: '#999' } : undefined}>
          {formatDeadline(deadline)}
          {row.expired && <Tag color="default" style={{ marginLeft: 8 }}>已过期</Tag>}
        </span>
      )
    },
    { title: '通知时间', dataIndex: 'confirmedAt', width: 170 },
    {
      title: '确认反馈',
      key: 'feedback',
      width: 140,
      render: feedbackRender
    },
    {
      title: '任务状态',
      key: 'status',
      width: 110,
      render: (_, row) =>
        row.expired
          ? <StatusTag label="已过期" status="completed" />
          : <StatusTag label="待评标" status="processing" />
    },
    {
      title: '操作',
      key: 'action',
      width: 260,
      render: (_, row) => (
        <span style={{ display: 'inline-flex', gap: 8 }}>
          {row.confirmStatus === 'pending' && !row.expired && (
            <>
              <Button type="primary" ghost size="small" onClick={() => confirmJoin(row)}>
                确认参加
              </Button>
              <Button danger size="small" onClick={() => { setDeclineTarget(row); setDeclineReason('') }}>
                拒绝
              </Button>
            </>
          )}
          <Button
            type={row.expired || row.confirmStatus !== 'confirmed' ? 'default' : 'primary'}
            size="small"
            icon={<StarOutlined />}
            disabled={row.confirmStatus === 'declined'}
            style={row.expired ? { color: '#999', borderColor: '#d9d9d9', background: '#f5f5f5' } : undefined}
            onClick={() => enterEvaluation(row)}
          >
            进入评标
          </Button>
        </span>
      )
    }
  ]

  return (
    <div className="expert-tasks">
      <Card title={<span><StarOutlined /> 我的评标任务</span>}>
        <Alert
          title="此处展示您被抽取并授权参与评标的任务，任务来源于招标人/代理在“专家抽取”中的确认结果。评标为限时提交制：在评标截止时间前可随时进入并提交评分，无需全程在线（流程性质按评审条目 1415-003 的口径落地，待产品最终确认）；过期任务不可进入评标。被抽中后请先“确认参加”，无法参加可拒绝，系统将从备选名单递补专家。"
          type="info"
          showIcon
          closable={false}
          style={{ marginBottom: 20 }}
        />
        {tasks.length > 0 ? (
          <Table
            rowKey="projectId"
            dataSource={tasks}
            columns={columns}
            pagination={false}
            rowClassName={(row) => (row.expired ? 'task-row-expired' : '')}
          />
        ) : (
          <Empty description="暂无评标任务，任务分配后将在此显示" />
        )}
      </Card>

      <Modal
        title="拒绝参加评标"
        open={!!declineTarget}
        okText="确认拒绝"
        cancelText="取消"
        onOk={submitDecline}
        onCancel={() => setDeclineTarget(null)}
      >
        <p>拒绝后系统将从备选名单中递补专家，该操作会反馈给招标人/代理。</p>
        <Input.TextArea
          rows={3}
          placeholder="请填写拒绝原因（选填）"
          value={declineReason}
          onChange={(e) => setDeclineReason(e.target.value)}
        />
      </Modal>

      <style>{`
        .expert-tasks { max-width: 1100px; margin: 0 auto; }
        .expert-tasks .task-row-expired { color: #999; background: #fafafa; }
      `}</style>
    </div>
  )
}
