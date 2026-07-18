import { useMemo, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Alert, Button, Card, Divider, Empty, Form, Input, Table, Tabs, Tag, message } from 'antd'
import dayjs from 'dayjs'
import StatusTag from '../components/StatusTag.jsx'
import { useRole } from '../hooks/useRole.js'
import { projectStore } from '../data/projects.js'
import { evaluationStore, formatDeadline } from '../data/evaluationStore.js'
import { expertStore } from '../data/expertStore.js'
import { quoteStore } from '../data/quoteStore.js'
import { supervisorStore } from '../data/supervisorStore.js'
import { PROJECT_STATUS_MAP } from './ProjectList.jsx'

// 开标时间兼容 ISO 串与 'YYYY-MM-DD HH:mm'
const fmtTime = (v) => {
  if (!v) return '-'
  const d = dayjs(v)
  return d.isValid() ? d.format('YYYY-MM-DD HH:mm') : String(v)
}

const CONFIRM_STATUS_MAP = {
  confirmed: { text: '已确认', color: 'success' },
  pending: { text: '待确认', color: 'warning' },
  declined: { text: '已拒绝', color: 'error' }
}

export default function SupervisorHall() {
  const navigate = useNavigate()
  const { userName } = useRole()
  const search = useSearch({ strict: false })
  const projectId = search?.projectId ? String(search.projectId) : ''
  const [activeTab, setActiveTab] = useState('opening')
  const [comment, setComment] = useState('')

  // 无 projectId：今日开标/评标场次列表（真实项目数据）
  const projects = useMemo(() => projectStore.getProjects(), [])

  // 有 projectId：项目监督视图数据（均无记录时 Empty，不回退演示假数据）
  const project = projectId ? projectStore.getProjectById(projectId) : undefined
  const projectName = project?.name || (projectId ? `项目 ${projectId}` : '')
  const projectCode = project?.code || '-'

  // 唱标结果：quoteStore 按 projectId 前缀匹配
  const bids = useMemo(() => {
    if (!projectId) return []
    return Object.entries(quoteStore.getQuotes())
      .filter(([key]) => key.startsWith(`${projectId}::`))
      .map(([key, value]) => ({
        name: key.split('::')[1],
        price: value?.quote?.totalPrice ?? '-',
        delivery: value?.quote?.delivery ?? '-',
        quality: value?.quote?.quality ?? '-'
      }))
  }, [projectId])

  // 评标委员会：expertStore 抽取结果
  const committee = useMemo(
    () => (projectId ? expertStore.getResult(projectId) : null),
    [projectId]
  )
  const committeeExperts = committee?.experts || []

  // 评分汇总：evaluationStore 实时汇总每个专家的 scores 与 submitted 状态
  const scoreSummary = useMemo(() => {
    const expertEntries = Object.entries(evaluationStore.getEval(projectId).experts || {})
    if (!projectId || expertEntries.length === 0) return { experts: [], rows: [] }
    const bidderSet = new Set()
    expertEntries.forEach(([, data]) => {
      Object.keys(data?.scores || {}).forEach((b) => bidderSet.add(b))
    })
    const experts = expertEntries.map(([name, data]) => ({ name, submitted: !!data?.submitted }))
    const rows = [...bidderSet].map((bidder) => {
      const totals = expertEntries.map(([name, data]) => {
        const items = data?.scores?.[bidder]
        if (!items) return null
        const total = Object.values(items).reduce((sum, v) => sum + (Number(v) || 0), 0)
        return { name, total }
      })
      const valid = totals.filter(Boolean)
      const average = valid.length
        ? Math.round((valid.reduce((s, t) => s + t.total, 0) / valid.length) * 100) / 100
        : null
      return { bidder, totals, average }
    })
    rows.sort((a, b) => (b.average ?? -1) - (a.average ?? -1))
    rows.forEach((row, idx) => {
      row.rank = row.average == null ? '-' : idx + 1
    })
    return { experts, rows }
  }, [projectId])

  const recordAbnormal = () => {
    if (!comment.trim()) {
      message.warning('请先填写异常描述')
      return
    }
    supervisorStore.addRecord({
      projectId,
      project: projectName,
      type: '监督记录',
      desc: comment.trim(),
      source: 'hall'
    })
    message.success('异常已登记，可在「异常登记」页面查看')
    setComment('')
  }

  const submitComment = () => {
    if (!comment.trim()) {
      message.warning('请先填写监督意见')
      return
    }
    supervisorStore.addRecord({
      projectId,
      project: projectName,
      type: '监督意见',
      desc: comment.trim(),
      source: 'hall'
    })
    message.success('监督意见已提交，可在「异常登记」页面查看')
    setComment('')
  }

  const sessionColumns = [
    { title: '项目名称', dataIndex: 'name', minWidth: 220 },
    { title: '项目编号', dataIndex: 'code', width: 160 },
    { title: '开标时间', dataIndex: 'openTime', width: 160, render: (v) => fmtTime(v) },
    {
      title: '评标截止时间',
      key: 'evalDeadline',
      width: 160,
      render: (_, row) => formatDeadline(evaluationStore.getEval(row.id).deadline)
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 110,
      render: (status) => {
        const s = PROJECT_STATUS_MAP[status] || { text: status || '未知', color: 'default' }
        return <Tag color={s.color}>{s.text}</Tag>
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 110,
      render: (_, row) => (
        <Button
          type="link"
          onClick={() => navigate({ to: '/admin/supervisor-hall', search: { projectId: String(row.id) } })}
        >
          进入监督
        </Button>
      )
    }
  ]

  const bidColumns = [
    { title: '投标人', dataIndex: 'name' },
    { title: '投标报价（万元）', dataIndex: 'price' },
    { title: '交货期', dataIndex: 'delivery' },
    { title: '质保期', dataIndex: 'quality' }
  ]

  const expertColumns = [
    { title: '专家', dataIndex: 'name' },
    { title: '专业', dataIndex: 'field' },
    { title: '所属单位', dataIndex: 'org' },
    {
      title: '确认状态',
      dataIndex: 'confirmStatus',
      render: (confirmStatus, row) => {
        const s = CONFIRM_STATUS_MAP[confirmStatus] || { text: confirmStatus || '待确认', color: 'default' }
        return (
          <>
            <Tag color={s.color}>{s.text}</Tag>
            {row.promotedAt && <Tag>递补</Tag>}
          </>
        )
      }
    }
  ]

  const scoreColumns = [
    { title: '投标人', dataIndex: 'bidder' },
    ...scoreSummary.experts.map((expert, idx) => ({
      title: (
        <>
          {expert.name}
          <div style={{ fontWeight: 'normal', fontSize: 12 }}>
            <StatusTag
              label={expert.submitted ? '已提交' : '待提交'}
              status={expert.submitted ? 'completed' : 'pending'}
            />
          </div>
        </>
      ),
      key: `expert-${expert.name}`,
      render: (_, row) => row.totals[idx]?.total ?? '-'
    })),
    {
      title: '平均分',
      dataIndex: 'average',
      render: (average) => (average == null ? '-' : average)
    },
    { title: '排名', dataIndex: 'rank' }
  ]

  const tabItems = [
    {
      key: 'opening',
      label: '开标监督',
      children: (
        <>
          <h3>签到情况</h3>
          <Empty description="该项目暂无开标签到记录" />
          <h3>唱标结果</h3>
          {bids.length > 0 ? (
            <Table
              columns={bidColumns}
              dataSource={bids}
              rowKey="name"
              bordered
              pagination={false}
              style={{ width: '100%' }}
            />
          ) : (
            <Empty description="该项目暂无唱标报价记录" />
          )}
        </>
      )
    },
    {
      key: 'evaluation',
      label: '评标监督',
      children: (
        <>
          <h3>评标委员会</h3>
          {committeeExperts.length > 0 ? (
            <Table
              columns={expertColumns}
              dataSource={committeeExperts}
              rowKey="name"
              bordered
              pagination={false}
              style={{ width: '100%' }}
            />
          ) : (
            <Empty description="该项目暂未抽取评标专家" />
          )}
          <h3>评分汇总</h3>
          {scoreSummary.rows.length > 0 ? (
            <Table
              columns={scoreColumns}
              dataSource={scoreSummary.rows}
              rowKey="bidder"
              bordered
              pagination={false}
              style={{ width: '100%' }}
            />
          ) : (
            <Empty description="该项目暂无专家评分记录" />
          )}
        </>
      )
    }
  ]

  const headerTags = (
    <div className="header-tags">
      <Tag color="error" style={{ fontSize: 14, padding: '4px 12px' }}>监督模式：只读</Tag>
      <Tag>监督人员：{userName}</Tag>
      {projectId && <Tag color="blue">项目：{projectName}</Tag>}
      {projectId && <Tag>编号：{projectCode}</Tag>}
    </div>
  )

  return (
    <div className="supervisor-hall">
      <Card
        title={
          <div className="card-header">
            <span>监督大厅</span>
            {headerTags}
          </div>
        }
      >
        <Alert
          title="您当前以监督人员身份进入，可查看开标、评标全过程及操作日志，但不可修改任何业务数据。"
          type="info"
          showIcon
          closable={false}
          style={{ marginBottom: 20 }}
        />

        {!projectId && (
          projects.length > 0 ? (
            <Table
              columns={sessionColumns}
              dataSource={projects}
              rowKey={(row) => String(row.id)}
              bordered
              pagination={false}
              style={{ width: '100%' }}
            />
          ) : (
            <Empty description="暂无项目，待招标人创建项目后可监督" />
          )
        )}

        {projectId && (
          <>
            <Tabs
              type="card"
              activeKey={activeTab}
              onChange={setActiveTab}
              items={tabItems}
            />

            <Divider />

            <div className="supervisor-actions">
              <Card
                className="action-card"
                title={<span>监督专属操作</span>}
              >
                <Form layout="vertical">
                  <Form.Item label="异常/意见记录">
                    <Input.TextArea
                      rows={3}
                      placeholder="如发现异常情况，请在此记录监督意见"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </Form.Item>
                </Form>
                <div className="action-btns">
                  <Button
                    style={{ color: '#fff', background: '#E6A23C', borderColor: '#E6A23C' }}
                    onClick={recordAbnormal}
                  >
                    记录异常
                  </Button>
                  <Button type="primary" onClick={submitComment}>提交监督意见</Button>
                  <Button onClick={() => navigate({ to: '/admin/supervisor-logs' })}>查看完整操作日志</Button>
                </div>
              </Card>
            </div>
          </>
        )}
      </Card>

      <style>{`
        .supervisor-hall {
          max-width: 1100px;
          margin: 0 auto;
        }
        .supervisor-hall .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
          width: 100%;
        }
        .supervisor-hall .header-tags {
          display: flex;
          gap: 12px;
        }
        .supervisor-hall .supervisor-actions {
          margin-top: 10px;
        }
        .supervisor-hall .action-card {
          background: #fafafa;
        }
        .supervisor-hall .action-btns {
          display: flex;
          justify-content: center;
          gap: 16px;
        }
        .supervisor-hall h3 {
          margin: 20px 0 12px;
          font-size: 16px;
        }
      `}</style>
    </div>
  )
}
