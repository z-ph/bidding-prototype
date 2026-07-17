import { useMemo, useState } from 'react'
import { useSearch } from '@tanstack/react-router'
import { Card, Select, InputNumber, Form, Button, Table, Tag, Alert, message, Modal, Empty, DatePicker } from 'antd'
import { TeamOutlined, ReloadOutlined, CheckCircleOutlined, DownloadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { expertStore } from '../data/expertStore.js'
import { evaluationStore, formatDeadline } from '../data/evaluationStore.js'

const PROJECT_OPTIONS = [
  { id: '1', name: 'XX市轨道交通设备采购项目', fields: ['电子信息', '机械设备'] },
  { id: '3', name: '软件开发服务项目', fields: ['软件工程'] }
]

const FIELD_OPTIONS = [
  { label: '电子信息', value: '电子信息' },
  { label: '机械设备', value: '机械设备' },
  { label: '工程造价', value: '工程造价' },
  { label: '软件工程', value: '软件工程' }
]

const BIDDER_ORGS = ['A科技有限公司', 'B实业有限公司', 'C股份有限公司', 'D集团有限公司']

const CONFIRM_STATUS = {
  pending: { text: '待确认', color: 'warning' },
  confirmed: { text: '已确认参加', color: 'success' },
  declined: { text: '已拒绝', color: 'error' }
}

function feedbackTag(e) {
  const s = CONFIRM_STATUS[e.confirmStatus] || CONFIRM_STATUS.pending
  return (
    <span>
      <Tag color={s.color}>{s.text}</Tag>
      {e.confirmStatus === 'declined' && e.declineReason && (
        <span style={{ color: '#999', fontSize: 12 }}>原因：{e.declineReason}</span>
      )}
    </span>
  )
}

function noteText(e) {
  if (e.promotedAt) return `备选递补 · 替换 ${e.promotedFor || '拒绝专家'} · ${e.promotedAt}`
  if (e.confirmAt) return `反馈于 ${e.confirmAt}`
  return ''
}

export default function ExpertExtraction() {
  const searchParams = useSearch({ strict: false })
  const initialProject = PROJECT_OPTIONS.find((p) => p.id === searchParams.projectId) || PROJECT_OPTIONS[0]
  const [projectId, setProjectId] = useState(initialProject.id)
  const [fields, setFields] = useState(initialProject.fields || [])
  const [count, setCount] = useState(3)
  const [benchCount, setBenchCount] = useState(2)
  const [avoidOrgs, setAvoidOrgs] = useState([])
  const [result, setResult] = useState(() => expertStore.getResult(initialProject.id))
  const [deadline, setDeadline] = useState(() => {
    const existing = evaluationStore.getEval(initialProject.id).deadline
    return existing ? dayjs(existing) : dayjs().add(5, 'day')
  })

  const currentDeadline = useMemo(() => evaluationStore.getEval(projectId).deadline, [projectId, result])

  const onProjectChange = (id) => {
    setProjectId(id)
    const p = PROJECT_OPTIONS.find((x) => x.id === id)
    setFields(p?.fields || [])
    setResult(expertStore.getResult(id))
    const existing = evaluationStore.getEval(id).deadline
    setDeadline(existing ? dayjs(existing) : dayjs().add(5, 'day'))
  }

  const doExtract = () => {
    if (count < 1) {
      message.warning('抽取人数至少为 1')
      return
    }
    const r = expertStore.extract(projectId, { fields, count, avoidOrgs, benchCount })
    setResult({ ...r })
    message.success(`已随机抽取正式专家 ${r.experts.length} 名、备选专家 ${r.bench.length} 名`)
  }

  const confirm = () => {
    if (!result || result.experts.length === 0) {
      message.warning('请先抽取专家')
      return
    }
    if (!deadline) {
      message.warning('请设置评标截止时间')
      return
    }
    Modal.confirm({
      title: '确认专家名单',
      content: `确认后将通知相关专家参与评标，评标截止时间为 ${deadline.format('YYYY-MM-DD HH:mm')}。是否继续？`,
      okText: '确认并通知',
      cancelText: '取消',
      onOk: () => {
        const r = expertStore.confirmResult(projectId)
        // 写入评标截止时间，供 ExpertTasks 过期阻断与 ExpertProject 限时提交使用
        evaluationStore.updateEval(projectId, (d) => {
          d.deadline = deadline.toISOString()
        })
        setResult({ ...r })
        message.success('专家名单已确认并通知，专家可在“我的任务”中确认或拒绝')
      }
    })
  }

  const refreshFeedback = () => {
    setResult(expertStore.getResult(projectId))
    message.success('已刷新专家确认反馈')
  }

  const exportCsv = () => {
    if (!result) return
    const statusText = (e) => (CONFIRM_STATUS[e.confirmStatus] || CONFIRM_STATUS.pending).text
    const rows = [
      ['名单', '姓名', '专业领域', '所属单位', '联系方式', '确认状态', '反馈时间', '备注'],
      ...result.experts.map((e) => [
        '正式', e.name, e.field, e.org, e.phone,
        statusText(e), e.confirmAt || '',
        e.promotedAt ? `备选递补（替换${e.promotedFor || '拒绝专家'}）` : (e.declineReason ? `拒绝原因：${e.declineReason}` : '')
      ]),
      ...result.bench.map((e) => ['备选', e.name, e.field, e.org, e.phone, statusText(e), e.confirmAt || '', ''])
    ]
    const csv = rows
      .map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\r\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `专家抽取结果-项目${result.projectId}.csv`
    a.click()
    URL.revokeObjectURL(url)
    message.success('抽取结果已导出 CSV')
  }

  const baseColumns = [
    { title: '专家姓名', dataIndex: 'name', width: 110 },
    { title: '专业领域', dataIndex: 'field', render: (f) => <Tag color="blue">{f}</Tag>, width: 110 },
    { title: '所属单位', dataIndex: 'org' },
    { title: '联系方式', dataIndex: 'phone', width: 130 },
    { title: '确认反馈', key: 'feedback', width: 190, render: (_, e) => feedbackTag(e) },
    { title: '备注', key: 'note', render: (_, e) => <span style={{ color: '#999', fontSize: 12 }}>{noteText(e)}</span> }
  ]

  return (
    <div className="expert-extraction">
      <Card title={<span><TeamOutlined /> 专家随机抽取</span>}>
        <Alert
          title="按项目所需专业领域随机抽取评标专家。回避规则仅按单位执行（需求确认清单 40，不做地区/黑名单条件）；评分人员可指定也可抽取（清单 41），本页为随机抽取模式；候选专家账号由后台提前创建（清单 43）。支持备选名单：正式专家拒绝后自动按序递补；抽取结果可导出 CSV。"
          type="info"
          showIcon
          closable={false}
          style={{ marginBottom: 20 }}
        />
        <Form labelCol={{ flex: '0 0 120px' }} wrapperCol={{ flex: 'auto' }}>
          <Form.Item label="选择项目">
            <Select
              style={{ width: 360 }}
              value={projectId}
              onChange={onProjectChange}
              options={PROJECT_OPTIONS.map((p) => ({ label: p.name, value: p.id }))}
            />
          </Form.Item>
          <Form.Item label="专业领域">
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              value={fields}
              onChange={setFields}
              options={FIELD_OPTIONS}
              placeholder="选择项目所需专业领域"
            />
          </Form.Item>
          <Form.Item label="抽取人数">
            <InputNumber min={1} max={9} value={count} onChange={(v) => setCount(Number(v) || 1)} />
            <span style={{ marginLeft: 16, color: '#666' }}>备选人数</span>
            <InputNumber
              min={0}
              max={5}
              value={benchCount}
              onChange={(v) => setBenchCount(Number(v) || 0)}
              style={{ marginLeft: 8 }}
            />
          </Form.Item>
          <Form.Item label="回避单位">
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              value={avoidOrgs}
              onChange={setAvoidOrgs}
              options={BIDDER_ORGS.map((o) => ({ label: o, value: o }))}
              placeholder="选择需回避的投标人单位，关联单位专家将被排除"
            />
          </Form.Item>
          <Form.Item label="评标截止时间">
            <DatePicker
              showTime
              value={deadline}
              onChange={setDeadline}
              style={{ width: 260 }}
            />
            <span style={{ marginLeft: 12, color: '#999', fontSize: 12 }}>
              当前生效：{formatDeadline(currentDeadline)}（确认通知时写入，过期任务自动封锁）
            </span>
          </Form.Item>
          <Form.Item>
            <Button type="primary" icon={<ReloadOutlined />} onClick={doExtract}>
              {result ? '重新抽取' : '执行抽取'}
            </Button>
            {result && !result.confirmed && (
              <Button type="primary" ghost icon={<CheckCircleOutlined />} style={{ marginLeft: 12 }} onClick={confirm}>
                确认并通知
              </Button>
            )}
            {result && (
              <Button icon={<DownloadOutlined />} style={{ marginLeft: 12 }} onClick={exportCsv}>
                导出结果
              </Button>
            )}
            {result?.confirmed && (
              <Button style={{ marginLeft: 12 }} onClick={refreshFeedback}>
                刷新确认反馈
              </Button>
            )}
          </Form.Item>
        </Form>

        {result && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h4 style={{ margin: 0 }}>抽取结果 · 正式名单</h4>
              <Tag color={result.confirmed ? 'success' : 'processing'}>
                {result.confirmed ? `已确认通知 · ${result.confirmedAt}` : `待确认 · 抽取于 ${result.extractedAt}`}
              </Tag>
            </div>
            {result.experts.length > 0 ? (
              <Table rowKey="id" dataSource={result.experts} columns={baseColumns} pagination={false} size="small" bordered />
            ) : (
              <Empty description="未抽到符合条件的专家，请调整条件后重试" />
            )}
            <h4 style={{ margin: '20px 0 12px' }}>备选名单（正式专家拒绝后按序自动递补）</h4>
            {result.bench.length > 0 ? (
              <Table rowKey="id" dataSource={result.bench} columns={baseColumns} pagination={false} size="small" bordered />
            ) : (
              <Empty description="无备选专家（可在上方设置备选人数后重新抽取）" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </div>
        )}
      </Card>
      <style>{`
        .expert-extraction { max-width: 1100px; margin: 0 auto; }
      `}</style>
    </div>
  )
}
