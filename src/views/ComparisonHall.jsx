import { useMemo, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Alert, Button, Card, Descriptions, Result, Steps, Table, Tag, Timeline, message } from 'antd'
import { useRole } from '../hooks/useRole.js'
import { projectStore } from '../data/projects.js'
import { quoteStore } from '../data/quoteStore.js'
import { BASELINE_PROJECTS, getPurchaseModeText, isInquiryFamily } from './ProjectList.jsx'
import StatusTag from '../components/StatusTag.jsx'
import ProjectEntryGuard from '../components/ProjectEntryGuard.jsx'

// 比价大厅（hall-purchase-method-mapping-20260721）：询比族项目（公开询比价/邀请询比价）的大厅。
// 询比族供应商提交的是报价（quoteStore），无 CA 解密/唱标仪式，环节简化为：报价汇总 → 报价比较 → 比价完成。
// 评标对所有项目开放：比价完成后携带 projectId 进入评标大厅。

// 无报价种子时的演示兜底（与 EvaluationHall FALLBACK 同口径：真实数据优先）
const FALLBACK_QUOTES = [
  { name: 'A科技有限公司', totalPrice: 128, deliveryPeriod: '合同签订后 15 个日历日', warrantyPeriod: '3 年', savedAt: '2026-07-19 10:00' },
  { name: 'B实业有限公司', totalPrice: 132, deliveryPeriod: '合同签订后 10 个日历日', warrantyPeriod: '3 年', savedAt: '2026-07-19 11:30' },
  { name: 'C股份有限公司', totalPrice: 125, deliveryPeriod: '合同签订后 20 个日历日', warrantyPeriod: '2 年', savedAt: '2026-07-19 14:20' }
]

export default function ComparisonHall() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false })
  const projectId = searchParams.projectId
  const { role, roleName, userName } = useRole()

  const project = useMemo(
    () =>
      projectStore.getProjectById(projectId) ||
      BASELINE_PROJECTS.find((p) => String(p.id) === String(projectId)) ||
      null,
    [projectId]
  )
  // 大厅归属门禁：比价大厅仅服务询比族；招标族项目引导至开标大厅
  const inquiryFamily = isInquiryFamily(project)

  const [currentStage, setCurrentStage] = useState(0)
  const [operationRecords, setOperationRecords] = useState([])

  // 招标人/招标代理可主持比价；监督人员只读；投标人只能查看自己的报价
  const isHost = ['tenderee', 'agent'].includes(role)
  const isBidder = role === 'bidder'
  const roleTagColor = isHost ? 'warning' : 'default'

  const quotes = useMemo(() => {
    const all = quoteStore.getQuotes()
    const rows = Object.entries(all)
      .filter(([key]) => key.startsWith(`${projectId}::`))
      .map(([key, value]) => ({
        name: key.split('::')[1],
        totalPrice: value?.quote?.totalPrice ?? '-',
        deliveryPeriod: value?.quote?.deliveryPeriod ?? '-',
        warrantyPeriod: value?.quote?.warrantyPeriod ?? '-',
        savedAt: value?.savedAt ?? '-'
      }))
    if (rows.length > 0) return rows
    return FALLBACK_QUOTES
  }, [projectId])

  // 按总价升序排名（报价最低者优先，数字异常排末尾）
  const rankedQuotes = useMemo(() => {
    return [...quotes].sort((a, b) => {
      const pa = Number(a.totalPrice)
      const pb = Number(b.totalPrice)
      if (Number.isNaN(pa)) return 1
      if (Number.isNaN(pb)) return -1
      return pa - pb
    })
  }, [quotes])

  // 投标人视角：仅展示本人报价行
  const visibleQuotes = useMemo(() => {
    if (isBidder) return rankedQuotes.filter((q) => q.name === userName)
    return rankedQuotes
  }, [rankedQuotes, isBidder, userName])

  const lowest = rankedQuotes[0]

  const addOperationRecord = (action, detail) => {
    setOperationRecords((prev) => [
      {
        id: `${action}-${prev.length}-${detail}`,
        action,
        detail,
        operator: userName || '-',
        time: new Date().toLocaleString()
      },
      ...prev
    ])
  }

  const nextStage = () => {
    setCurrentStage((prev) => {
      const next = Math.min(prev + 1, 2)
      if (next !== prev && next === 1) {
        addOperationRecord('报价比较', `已按总价升序生成报价比较表，共 ${quotes.length} 家供应商`)
      }
      return next
    })
  }

  const prevStage = () => {
    setCurrentStage((prev) => Math.max(prev - 1, 0))
  }

  const finishComparison = () => {
    setCurrentStage(2)
    addOperationRecord('比价完成', `比价结果已生成（推荐：${lowest?.name || '-'}，报价 ${lowest?.totalPrice ?? '-'} 万元），可进入评标大厅`)
    message.success('比价完成，比价结果已生成，请进入评标大厅')
  }

  const goEvaluate = () => {
    navigate({ to: '/admin/evaluation-hall', search: { projectId } })
  }

  const quoteColumns = [
    {
      title: '排名',
      key: 'rank',
      width: 80,
      render: (_, row) => {
        const idx = rankedQuotes.findIndex((q) => q.name === row.name)
        return <Tag color={idx === 0 ? 'success' : 'default'}>{idx + 1}</Tag>
      }
    },
    { title: '供应商', dataIndex: 'name', minWidth: 180 },
    { title: '报价（万元）', dataIndex: 'totalPrice', width: 130 },
    { title: '交货期', dataIndex: 'deliveryPeriod', minWidth: 180 },
    { title: '质保期', dataIndex: 'warrantyPeriod', width: 100 },
    { title: '报价时间', dataIndex: 'savedAt', width: 170 }
  ]

  const summaryColumns = [
    { title: '供应商', dataIndex: 'name', minWidth: 180 },
    { title: '报价状态', key: 'status', width: 120, render: () => <StatusTag label="已报价" status="completed" /> },
    { title: '报价时间', dataIndex: 'savedAt', width: 170 }
  ]

  const stageLabels = ['报价汇总', '报价比较', '比价完成']

  // 入口守卫（所有 hooks 之后）：无 projectId 时阻断并引导从项目进入
  if (!projectId) {
    return <ProjectEntryGuard />
  }

  // 大厅归属门禁：招标族项目（公开招标/邀请招标）请在开标大厅操作
  if (!inquiryFamily) {
    return (
      <div className="comparison-hall" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Card>
          <Result
            status="info"
            title="招标族项目请在开标大厅操作"
            subTitle={
              <>
                <p style={{ margin: 0 }}>
                  {project?.name || `项目ID：${projectId}`}（采购方式：{getPurchaseModeText(project)}）
                </p>
                <p style={{ margin: '8px 0 0' }}>
                  公开招标、邀请招标项目需在开标大厅完成签到、解密、唱标。
                </p>
              </>
            }
            extra={[
              <Button
                key="opening"
                type="primary"
                onClick={() => navigate({ to: '/admin/opening-hall', search: { projectId } })}
              >
                前往开标大厅
              </Button>,
              <Button key="back" onClick={() => navigate({ to: role === 'bidder' ? '/admin/bidder-projects' : role === 'supervisor' ? '/admin/supervisor-hall' : '/admin/projects' })}>
                返回
              </Button>
            ]}
          />
          <Alert
            type="info"
            showIcon
            closable={false}
            title="口径说明：开标大厅服务招标族（公开招标、邀请招标），比价大厅服务询比族（公开询比价、邀请询比价），评标大厅对所有项目开放（2026-07-21 需求）。"
          />
        </Card>
      </div>
    )
  }

  return (
    <div className="comparison-hall">
      <Card
        title={
          <div className="hall-header">
            <div>
              <h2>比价大厅</h2>
              <p className="subtitle">{project?.name || '-'} · 采购方式：{getPurchaseModeText(project)} · 项目ID：{projectId}</p>
            </div>
            <div className="hall-meta">
              <Tag color="purple" style={{ fontSize: 14, padding: '4px 12px' }}>
                询比族项目
              </Tag>
              <Tag color={roleTagColor} style={{ fontSize: 14, padding: '4px 12px' }}>
                {roleName}
              </Tag>
            </div>
          </div>
        }
      >
        <Steps
          current={currentStage}
          items={[
            { title: '报价汇总', description: '确认各供应商报价响应' },
            { title: '报价比较', description: '按总价/交货期/质保期比较' },
            { title: '比价完成', description: '生成比价结果，进入评标' }
          ]}
        />

        <Card size="small" title="当前状态与下一步" style={{ marginTop: 24, marginBottom: 24, background: '#f6ffed' }}>
          <Descriptions column={2}>
            <Descriptions.Item label="当前阶段">{stageLabels[currentStage]}</Descriptions.Item>
            <Descriptions.Item label="供应商数量">{quotes.length} 家</Descriptions.Item>
            <Descriptions.Item label="当前状态">
              <Tag color={currentStage === 2 ? 'success' : 'processing'}>
                {currentStage === 2 ? '比价完成' : '进行中'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="下一步">
              {currentStage === 2 ? (
                <>
                  <span style={{ marginRight: 12 }}>进入评标大厅</span>
                  <Button type="primary" size="small" onClick={goEvaluate}>去评标</Button>
                </>
              ) : currentStage === 0 ? (
                <span>确认各供应商报价已汇总</span>
              ) : (
                <span>比较各供应商报价并生成比价结果</span>
              )}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <div className="stage-panel">
          {/* 阶段0：报价汇总 */}
          {currentStage === 0 && (
            <div className="stage-content">
              <h3>报价汇总</h3>
              <p className="tip">汇总各供应商在报价截止前提交的报价，确认响应情况后进入报价比较。</p>
              {!isHost && (
                <Alert
                  type="info"
                  showIcon
                  closable={false}
                  title={`您当前以 ${roleName} 身份进入，${isBidder ? '仅可查看本人报价' : '仅可查看比价过程'}。`}
                  style={{ marginBottom: 16 }}
                />
              )}
              <Table
                columns={summaryColumns}
                dataSource={visibleQuotes}
                rowKey="name"
                pagination={false}
                style={{ width: '100%' }}
              />
              <div className="stage-action">
                {isHost && (
                  <Button type="primary" size="large" onClick={nextStage}>
                    报价已汇总，进入报价比较
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* 阶段1：报价比较 */}
          {currentStage === 1 && (
            <div className="stage-content">
              <h3>报价比较</h3>
              <p className="tip">按报价总价升序排列，综合比较交货期、质保期等要素（报价最低者排名第 1）。</p>
              <Table
                columns={quoteColumns}
                dataSource={visibleQuotes}
                rowKey="name"
                pagination={false}
                style={{ width: '100%' }}
              />
              <div className="stage-action">
                {isHost && <Button onClick={prevStage}>返回</Button>}
                {isHost && (
                  <Button type="primary" size="large" onClick={finishComparison}>
                    比价完成
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* 阶段2：比价完成 */}
          {currentStage === 2 && (
            <div className="stage-content">
              <Result
                status="success"
                title="比价完成"
                subTitle={`比价结果已生成：${lowest?.name || '-'} 报价最低（${lowest?.totalPrice ?? '-'} 万元）。评标对所有项目开放，请进入评标大厅完成评审。`}
                extra={[
                  <Button key="evaluate" type="primary" onClick={goEvaluate}>
                    进入评标大厅
                  </Button>,
                  isHost && (
                    <Button key="replay" onClick={() => setCurrentStage(0)}>
                      重新演示
                    </Button>
                  )
                ].filter(Boolean)}
              />
            </div>
          )}
        </div>

        {operationRecords.length > 0 && (
          <Card size="small" title="操作记录" style={{ marginTop: 24 }}>
            <Timeline
              items={operationRecords.map((record) => ({
                key: record.id,
                color: 'blue',
                content: (
                  <div>
                    <strong>{record.action}</strong>
                    <span style={{ color: '#999', marginLeft: 12, fontSize: 12 }}>{record.time}</span>
                    <p style={{ margin: '4px 0 0', color: '#666' }}>{record.detail}</p>
                    <p style={{ margin: 0, color: '#999', fontSize: 12 }}>操作人：{record.operator}</p>
                  </div>
                )
              }))}
            />
          </Card>
        )}
      </Card>

      <style>{`
        .comparison-hall {
          max-width: 1100px;
          margin: 0 auto;
        }
        .comparison-hall .hall-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }
        .comparison-hall .hall-header h2 {
          margin: 0;
        }
        .comparison-hall .subtitle {
          color: #666;
          margin: 8px 0 0;
        }
        .comparison-hall .hall-meta {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .comparison-hall .stage-panel {
          margin-top: 30px;
          padding: 20px;
          background: #f9fafc;
          border-radius: 8px;
        }
        .comparison-hall .stage-content h3 {
          margin-bottom: 8px;
        }
        .comparison-hall .tip {
          color: #666;
          margin-bottom: 16px;
        }
        .comparison-hall .stage-action {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-top: 24px;
        }
      `}</style>
    </div>
  )
}
