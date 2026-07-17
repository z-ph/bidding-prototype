import { useMemo, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Alert, Button, Card, Descriptions, Empty, Form, Input, Modal, Radio, Result, Table, Tabs, Tag, Timeline, message } from 'antd'
import { useRole } from '../hooks/useRole.js'
import { evaluationStore } from '../data/evaluationStore.js'
import { expertStore } from '../data/expertStore.js'
import { projectStore } from '../data/projects.js'
import { BASELINE_PROJECTS, getPurchaseModeText, isInvitedRfqProject } from './ProjectList.jsx'

// 演示回退数据：evaluationStore / expertStore 均无记录时兜底，真实数据优先
const FALLBACK_EXPERTS = ['专家甲', '专家乙', '专家丙']

const FALLBACK_SUMMARY = [
  { rank: 1, name: 'C股份有限公司', business: 28, tech: 36, price: 29, total: 93, recommend: '推荐中标' },
  { rank: 2, name: 'A科技有限公司', business: 27, tech: 34, price: 28, total: 89, recommend: '备选' },
  { rank: 3, name: 'B实业有限公司', business: 26, tech: 31, price: 27, total: 84, recommend: '备选' }
]

const FALLBACK_REJECTED = [
  { name: 'D有限公司', reason: '未按要求加盖电子签章，投标文件无效。' }
]

const STATUS_MAP = {
  evaluating: { label: '评标中', color: 'processing' },
  submitted: { label: '评标结果已提交', color: 'success' },
  confirmed: { label: '评标结果已确认', color: 'success' }
}

export default function EvaluationHall() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false })
  const projectId = searchParams.projectId || '1'
  const { role, roleName, userName } = useRole()

  // 采购方式门禁（add-purchase-method-flow-20260717）：项目/标段均为邀请询比价时无评标环节
  const project = useMemo(
    () =>
      projectStore.getProjectById(projectId) ||
      BASELINE_PROJECTS.find((p) => String(p.id) === String(projectId)) ||
      null,
    [projectId]
  )
  const invitedRfq = isInvitedRfqProject(project)

  // evaluationStore 无订阅机制：本地保存快照，操作后/手动刷新时重读
  const [evalData, setEvalData] = useState(() => evaluationStore.getEval(projectId))
  const [submitInfo, setSubmitInfo] = useState(() => evaluationStore.getSubmittedInfo(projectId))
  const reload = () => {
    setEvalData(evaluationStore.getEval(projectId))
    setSubmitInfo(evaluationStore.getSubmittedInfo(projectId))
  }

  // 评标委员会名单：专家抽取结果 ∪ evaluationStore 已有记录，空则回退演示名单（口径与 ExpertProject 一致）
  const roster = useMemo(() => {
    const names = []
    const extracted = expertStore.getResult(projectId)?.experts || []
    extracted.forEach((e) => {
      if (e?.name && !names.includes(e.name)) names.push(e.name)
    })
    Object.keys(evalData.experts || {}).forEach((n) => {
      if (!names.includes(n)) names.push(n)
    })
    if (names.length === 0) names.push(...FALLBACK_EXPERTS)
    return names
  }, [evalData, projectId])

  // 组长以 evaluationStore.leader 为准；未推选时回退演示组长（与 ExpertProject 回退口径一致）
  const leaderName = evalData.leader || (roster.includes('专家甲') ? '专家甲' : roster[0])

  // 角色拆分（2052-008）：组长=唯一可操作角色（汇总/否决/报告/提交结果），其余角色全部只读
  const isExpert = role === 'expert'
  const isLeader = isExpert && userName === leaderName
  const isTenderee = role === 'tenderee'
  const isAgent = role === 'agent'
  const isSupervisor = role === 'supervisor'

  const statusInfo = STATUS_MAP[evalData.status] || STATUS_MAP.evaluating
  const deadline = evalData.deadline || '2026-07-15 18:00'

  const [activeTab, setActiveTab] = useState(isLeader ? 'summary' : 'progress')
  const [operationRecords, setOperationRecords] = useState([])
  const [reportForm, setReportForm] = useState(() => ({
    opinion: evalData.report?.content || '经评标委员会评审，C股份有限公司综合得分最高，技术方案满足招标文件要求，报价合理，推荐为中标候选人。',
    recommend: evalData.report?.candidates?.[0] || 'C股份有限公司'
  }))

  // 专家提交进度：名单来自抽取结果/演示名单，提交状态来自 evaluationStore 真实记录
  const progressRows = useMemo(() => roster.map((name) => {
    const rec = evalData.experts?.[name]
    return {
      name,
      isLeader: name === leaderName,
      me: name === userName,
      submitted: !!rec?.submitted,
      submittedAt: rec?.submittedAt || '-',
      signed: !!rec?.signed
    }
  }), [roster, evalData, leaderName, userName])

  const pendingNames = progressRows.filter((r) => !r.submitted).map((r) => r.name)

  // 评分汇总：有专家真实评分（已提交）时按评分项求均值，否则回退演示数据
  const summaryData = useMemo(() => {
    const submittedExperts = Object.values(evalData.experts || {}).filter((e) => e?.submitted && e?.scores)
    if (submittedExperts.length === 0) {
      return {
        real: false,
        items: [
          { key: 'business', title: '商务标（30）' },
          { key: 'tech', title: '技术标（40）' },
          { key: 'price', title: '价格标（30）' }
        ],
        rows: FALLBACK_SUMMARY
      }
    }
    const itemKeys = [...new Set(submittedExperts.flatMap((e) => Object.values(e.scores).flatMap((items) => Object.keys(items || {}))))]
    const bidderNames = [...new Set(submittedExperts.flatMap((e) => Object.keys(e.scores)))]
    const rows = bidderNames.map((name) => {
      const row = { name }
      let total = 0
      itemKeys.forEach((key) => {
        const values = submittedExperts
          .map((e) => Number(e.scores?.[name]?.[key]))
          .filter((v) => !Number.isNaN(v))
        const avg = values.length ? Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 10) / 10 : 0
        row[key] = avg
        total += avg
      })
      row.total = Math.round(total * 10) / 10
      return row
    })
    rows.sort((a, b) => b.total - a.total)
    rows.forEach((row, idx) => {
      row.rank = idx + 1
      row.recommend = idx === 0 ? '推荐中标' : '备选'
    })
    return { real: true, items: itemKeys.map((key) => ({ key, title: `${key}（均值）` })), rows }
  }, [evalData])

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

  // 评标报告持久化到 evaluationStore.report（契约结构：id/version/content/candidates/createdAt/createdBy/archived）
  const saveReport = () => {
    evaluationStore.updateEval(projectId, (draft) => {
      draft.report = {
        id: draft.report?.id || `RPT-${projectId}`,
        version: draft.report?.version || 'V1.0',
        content: reportForm.opinion,
        candidates: reportForm.recommend ? [reportForm.recommend] : [],
        createdAt: new Date().toLocaleString(),
        createdBy: userName,
        archived: false
      }
    })
    reload()
    addOperationRecord('保存报告', '评标委员会意见及推荐中标候选人已保存')
    message.success('评标报告已保存')
  }

  // 2052-003/2052-009：提交仅组长可用，需全部专家提交（evaluationStore.getSubmittedInfo 真实数据），Modal 二次确认
  const submitResult = () => {
    if (!submitInfo.allSubmitted) return
    Modal.confirm({
      title: '提交评标结果确认',
      content: `共 ${submitInfo.total} 名专家均已提交评分。提交后评标结果将进入中标公示流程，确认提交吗？`,
      okText: '确认提交',
      cancelText: '取消',
      onOk: () => {
        evaluationStore.updateEval(projectId, (draft) => {
          draft.status = 'submitted'
        })
        reload()
        addOperationRecord('提交评标结果', '评标结果已提交，进入中标公示流程')
        message.success('评标结果已提交，进入中标公示流程')
      }
    })
  }

  const goExpertProject = () => {
    navigate({ to: '/admin/expert-project', search: { projectId } })
  }

  const summaryColumns = [
    { title: '排名', dataIndex: 'rank', width: 80 },
    { title: '投标人', dataIndex: 'name', minWidth: 200 },
    ...summaryData.items.map((item) => ({ title: item.title, dataIndex: item.key, width: 130 })),
    {
      title: '总分',
      dataIndex: 'total',
      width: 100,
      render: (total) => <strong style={{ color: '#409EFF' }}>{total}</strong>
    },
    {
      title: '推荐意见',
      dataIndex: 'recommend',
      width: 120,
      render: (recommend) => (
        <Tag color={recommend === '推荐中标' ? 'success' : 'default'}>{recommend}</Tag>
      )
    }
  ]

  const progressColumns = [
    {
      title: '专家',
      dataIndex: 'name',
      render: (name, row) => (
        <>
          {name}
          {row.isLeader && <Tag color="gold" style={{ marginLeft: 8 }}>组长</Tag>}
          {row.me && <Tag color="processing" style={{ marginLeft: 8 }}>我</Tag>}
        </>
      )
    },
    {
      title: '提交状态',
      dataIndex: 'submitted',
      width: 120,
      render: (submitted) => (
        <Tag color={submitted ? 'success' : 'warning'}>{submitted ? '已提交' : '待提交'}</Tag>
      )
    },
    { title: '提交时间', dataIndex: 'submittedAt', width: 200 },
    {
      title: '签名',
      dataIndex: 'signed',
      width: 100,
      render: (signed) => (signed ? <Tag color="success">已签名</Tag> : <Tag>未签名</Tag>)
    }
  ]

  const summaryTab = {
    key: 'summary',
    label: '评分汇总',
    children: (
      <>
        {!summaryData.real && (
          <Alert
            type="info"
            showIcon
            closable={false}
            title="当前为演示汇总数据：尚无专家提交真实评分，提交后此处自动切换为评分项均值汇总。"
            style={{ marginBottom: 16 }}
          />
        )}
        <Table
          columns={summaryColumns}
          dataSource={summaryData.rows}
          rowKey="name"
          bordered
          pagination={false}
          style={{ width: '100%' }}
        />
        <div className="chart-mock">
          <h4>得分对比</h4>
          <div className="bars">
            {summaryData.rows.map((item) => (
              <div key={item.name} className="bar-item">
                <span className="bar-name">{item.name}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${item.total}%` }} />
                </div>
                <span className="bar-value">{item.total}</span>
              </div>
            ))}
          </div>
        </div>
      </>
    )
  }

  const progressTab = {
    key: 'progress',
    label: '评审进度',
    children: (
      <>
        <Descriptions column={3} style={{ marginBottom: 16 }}>
          <Descriptions.Item label="评标组长">{leaderName}</Descriptions.Item>
          <Descriptions.Item label="专家人数">{roster.length}</Descriptions.Item>
          <Descriptions.Item label="已提交">
            {submitInfo.submitted}/{submitInfo.total || roster.length}
          </Descriptions.Item>
        </Descriptions>
        <Table
          columns={progressColumns}
          dataSource={progressRows}
          rowKey="name"
          bordered
          pagination={false}
          style={{ width: '100%' }}
        />
      </>
    )
  }

  const rejectTab = {
    key: 'reject',
    label: '否决投标',
    children:
      FALLBACK_REJECTED.length === 0 ? (
        <Empty description="暂无否决投标" />
      ) : (
        FALLBACK_REJECTED.map((item, idx) => (
          <Alert
            key={idx}
            title={`${item.name}：${item.reason}`}
            type="error"
            closable={false}
            style={{ marginBottom: 12 }}
          />
        ))
      )
  }

  const reportEditTab = {
    key: 'report',
    label: '评标报告',
    children: (
      <Form layout="vertical">
        <Form.Item label="评标委员会意见">
          <Input.TextArea
            rows={6}
            placeholder="汇总评标委员会整体意见..."
            value={reportForm.opinion}
            onChange={(e) => setReportForm((prev) => ({ ...prev, opinion: e.target.value }))}
          />
        </Form.Item>
        <Form.Item label="推荐中标候选人">
          <Radio.Group
            value={reportForm.recommend}
            onChange={(e) => setReportForm((prev) => ({ ...prev, recommend: e.target.value }))}
          >
            {summaryData.rows.map((item) => (
              <Radio key={item.name} value={item.name}>
                {item.name}（{item.total}分）
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={saveReport}>
            保存报告
          </Button>
        </Form.Item>
      </Form>
    )
  }

  const reportReadonlyTab = {
    key: 'report',
    label: '评标报告',
    children: evalData.report ? (
      <Descriptions column={1} bordered>
        <Descriptions.Item label="报告编号">{evalData.report.id}</Descriptions.Item>
        <Descriptions.Item label="版本">{evalData.report.version}</Descriptions.Item>
        <Descriptions.Item label="评标委员会意见">{evalData.report.content}</Descriptions.Item>
        <Descriptions.Item label="推荐中标候选人">
          {(evalData.report.candidates || []).join('、') || '—'}
        </Descriptions.Item>
        <Descriptions.Item label="生成信息">
          {evalData.report.createdBy} · {evalData.report.createdAt}
        </Descriptions.Item>
      </Descriptions>
    ) : (
      <Empty description="评标报告尚未生成" />
    )
  }

  // 角色视图拆分（2052-008）：组长可编辑报告；专家成员仅进度+汇总；招标人/代理/监督全只读
  const tabItems = isLeader
    ? [summaryTab, progressTab, rejectTab, reportEditTab]
    : isExpert
      ? [progressTab, summaryTab]
      : [progressTab, summaryTab, rejectTab, reportReadonlyTab]

  // 顶部角色引导提示
  const renderRoleGuide = () => {
    if (isLeader) {
      return submitInfo.allSubmitted ? (
        <Alert
          type="success"
          showIcon
          closable={false}
          title={`全部 ${submitInfo.total} 名专家已提交评分，可提交评标结果。`}
          style={{ marginBottom: 20 }}
        />
      ) : (
        <Alert
          type="warning"
          showIcon
          closable={false}
          title="您是评标组长，可在全部专家提交后提交评标结果"
          description={`未提交专家：${pendingNames.join('、') || '—'}。`}
          style={{ marginBottom: 20 }}
        />
      )
    }
    if (isExpert) {
      return (
        <Alert
          type="info"
          showIcon
          closable={false}
          title="您是评标委员会成员，本页仅可查看评标进度与本人提交状态"
          description={
            <>
              <span style={{ marginRight: 12 }}>评分与签名请在「评标项目」中完成。</span>
              <Button type="primary" size="small" onClick={goExpertProject}>
                前往评分
              </Button>
            </>
          }
          style={{ marginBottom: 20 }}
        />
      )
    }
    if (isTenderee) {
      return (
        <Alert
          type="info"
          showIcon
          closable={false}
          title="招标人只读视图：可查看评标进度、评分汇总与评标报告，无操作权限。"
          style={{ marginBottom: 20 }}
        />
      )
    }
    if (isAgent) {
      return (
        <Alert
          type="info"
          showIcon
          closable={false}
          title="招标代理只读视图：可查看评标进度与评分汇总；提交评标结果由评标组长完成。"
          style={{ marginBottom: 20 }}
        />
      )
    }
    if (isSupervisor) {
      return (
        <Alert
          type="info"
          showIcon
          closable={false}
          title="监督人员只读视图：全程监督评标过程，不参与评分与提交。"
          style={{ marginBottom: 20 }}
        />
      )
    }
    return null
  }

  // 「下一步」按角色渲染（2052-008/2052-010）
  const renderNextStep = () => {
    if (isLeader) {
      if (evalData.status === 'submitted' || evalData.status === 'confirmed') {
        return <span>评标结果已提交，进入中标公示流程</span>
      }
      if (submitInfo.allSubmitted) {
        return (
          <>
            <span style={{ marginRight: 12 }}>提交评标结果</span>
            <Button type="primary" size="small" onClick={submitResult}>
              提交结果
            </Button>
          </>
        )
      }
      return <span>等待所有专家完成评分并提交</span>
    }
    if (isExpert) {
      return (
        <>
          <span style={{ marginRight: 12 }}>前往「评标项目」完成本人评分</span>
          <Button type="primary" size="small" onClick={goExpertProject}>
            去评分
          </Button>
        </>
      )
    }
    if (evalData.status === 'submitted' || evalData.status === 'confirmed') {
      return <span>评标结果已提交，进入中标公示流程</span>
    }
    return <span>等待评标委员会完成评审（只读）</span>
  }

  // 页面级门禁（清单 20）：邀请询比价项目无评标环节，阻断评标操作区并引导前往定标/采购结果
  if (invitedRfq) {
    return (
      <div className="evaluation-hall" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Card>
          <Result
            status="info"
            title="邀请询比价项目无需评标"
            subTitle={
              <>
                <p style={{ margin: 0 }}>
                  {project?.name || `项目ID：${projectId}`}（采购方式：{getPurchaseModeText(project)}）
                </p>
                <p style={{ margin: '8px 0 0' }}>
                  邀请询比价项目无需开标/评标，报价截止后直接进入采购结果。
                </p>
              </>
            }
            extra={[
              <Button
                key="award"
                type="primary"
                onClick={() => navigate({ to: '/admin/award-confirm', search: { projectId } })}
              >
                前往定标
              </Button>,
              <Button key="back" onClick={() => navigate({ to: '/admin/projects' })}>
                返回项目列表
              </Button>
            ]}
          />
          <Alert
            type="info"
            showIcon
            closable={false}
            title="口径说明：公开招标、邀请招标、公开询比价、邀请询比价四种采购方式环节一致，唯邀请询比价不用开标和评标（2026-07-17 需求确认清单 20）。"
          />
        </Card>
      </div>
    )
  }

  return (
    <div className="evaluation-hall">
      <Card
        title={
          <div className="hall-header">
            <div>
              <h2>评标大厅</h2>
              <p className="subtitle">XX市轨道交通设备采购项目 · 标段一：主设备 · 项目ID：{projectId}</p>
            </div>
            <div className="hall-meta">
              <Tag color={statusInfo.color} style={{ fontSize: 14, padding: '4px 12px' }}>
                {statusInfo.label}
              </Tag>
              <Tag color={isLeader ? 'gold' : 'default'} style={{ fontSize: 14, padding: '4px 12px' }}>
                {roleName}
                {isLeader ? '（组长）' : ''}
              </Tag>
              <Button onClick={reload}>刷新状态</Button>
              {/* 2052-009：提交按钮仅组长渲染；2052-003：未全部提交时禁用 */}
              {isLeader && evalData.status !== 'submitted' && evalData.status !== 'confirmed' && (
                <Button type="primary" disabled={!submitInfo.allSubmitted} onClick={submitResult}>
                  提交评标结果
                </Button>
              )}
            </div>
          </div>
        }
      >
        {renderRoleGuide()}

        <Card size="small" title="当前状态与下一步" style={{ marginBottom: 20, background: '#f6ffed' }}>
          <Descriptions column={2}>
            <Descriptions.Item label="当前阶段">{statusInfo.label}</Descriptions.Item>
            <Descriptions.Item label="评标截止">{deadline}</Descriptions.Item>
            <Descriptions.Item label="专家提交进度">
              {submitInfo.submitted}/{submitInfo.total || roster.length} 已提交
            </Descriptions.Item>
            <Descriptions.Item label="下一步">{renderNextStep()}</Descriptions.Item>
          </Descriptions>
          {!submitInfo.allSubmitted && (
            <Alert
              title={`阻断原因：尚有 ${pendingNames.length} 名专家评分未提交（${pendingNames.join('、')}），需所有专家提交后方可发布评标结果。`}
              type="warning"
              showIcon
              closable={false}
              style={{ marginTop: 12 }}
            />
          )}
        </Card>

        <Tabs
          type="card"
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />

        {operationRecords.length > 0 && (
          <Card size="small" title="操作记录" style={{ marginTop: 20 }}>
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
          </Card>
        )}
      </Card>

      <style>{`
        .evaluation-hall {
          max-width: 1100px;
          margin: 0 auto;
        }
        .evaluation-hall .hall-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }
        .evaluation-hall .hall-header h2 {
          margin: 0;
        }
        .evaluation-hall .subtitle {
          color: #666;
          margin: 8px 0 0;
        }
        .evaluation-hall .hall-meta {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .evaluation-hall .chart-mock {
          margin-top: 24px;
          padding: 20px;
          background: #f9fafc;
          border-radius: 8px;
        }
        .evaluation-hall .chart-mock h4 {
          margin-bottom: 16px;
        }
        .evaluation-hall .bars {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .evaluation-hall .bar-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .evaluation-hall .bar-name {
          width: 160px;
          font-size: 14px;
          color: #333;
        }
        .evaluation-hall .bar-track {
          flex: 1;
          height: 20px;
          background: #e4e7ed;
          border-radius: 10px;
          overflow: hidden;
        }
        .evaluation-hall .bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #409EFF, #67C23A);
          border-radius: 10px;
          transition: width 0.5s;
        }
        .evaluation-hall .bar-value {
          width: 40px;
          text-align: right;
          font-weight: bold;
        }
      `}</style>
    </div>
  )
}
