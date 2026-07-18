import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate, useSearch } from '@tanstack/react-router'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Steps,
  Table,
  Tabs,
  Tag,
  Timeline,
  message
} from 'antd'
import { DownloadOutlined, EditOutlined, FileTextOutlined, QuestionCircleOutlined, ReadOutlined } from '@ant-design/icons'
import StatusTag from '../components/StatusTag.jsx'
import { tenderDocStore } from '../data/tenderDocStore.js'
import { expertStore } from '../data/expertStore.js'
import { evaluationStore, isEvalExpired, formatDeadline } from '../data/evaluationStore.js'
import { projectStore } from '../data/projects.js'
import { useRole } from '../hooks/useRole.js'

// 项目名/编号兜底映射：EvaluationDetail 头部与签到/报告展示依赖（原 evaluationProjects
// mock 列表已随无参态 ProjectTaskList 一并删除，0718-ux-006）
const PROJECT_INFO = {
  '1': { id: '1', name: 'XX市轨道交通设备采购项目', code: 'ZB20260701001' },
  '2': { id: '2', name: '办公桌椅采购项目', code: 'ZB20260702002' },
  '3': { id: '3', name: '软件开发服务项目', code: 'ZB20260703003' }
}

// 演示投标人名单（开标结果 mock）
const BIDDERS = ['A科技有限公司', 'B实业有限公司', 'C股份有限公司']

export default function ExpertProject() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false })
  const projectId = searchParams.projectId
  const { userName } = useRole()

  // 统一入口：无 projectId 空载进入时重定向到真实任务列表「我的评标任务」，
  // 评分详情只能从任务列表携带 projectId 进入（0718-ux-006）
  if (!projectId) {
    return <Navigate to="/admin/expert-tasks" replace />
  }

  return <EvaluationDetail projectId={String(projectId)} userName={userName} onBack={() => navigate({ to: '/admin/expert-tasks' })} />
}

// 版本号递增：V1.0 -> V1.1
function bumpVersion(v) {
  const m = /^V(\d+)\.(\d+)$/.exec(v || '')
  if (!m) return 'V1.0'
  return `V${m[1]}.${Number(m[2]) + 1}`
}

function EvaluationDetail({ projectId, userName, onBack }) {
  const tenderDocVersion = tenderDocStore.getCurrentPublishedVersion(projectId)
  // 评标办法评分项由招标文件配置驱动，不再固定商务30/技术40/价格30
  const scoreItems = tenderDocStore.getPublishedScoreItems(projectId)
  const scoreWeightTotal = scoreItems.reduce((sum, item) => sum + (Number(item.weight) || 0), 0)
  const scoreColSpan = Math.max(4, Math.floor(24 / scoreItems.length))
  const projectInfo = PROJECT_INFO[projectId] || { name: 'XX市轨道交通设备采购项目', code: '-' }

  // 评标状态持久化：评分/意见/签名/提交/组长/报告全部落在 evaluationStore（localStorage），
  // 页面刷新后从 store 恢复（test-003）
  const [evalData, setEvalData] = useState(() => evaluationStore.getEval(projectId))
  const persist = (updater) => {
    const next = evaluationStore.updateEval(projectId, updater)
    setEvalData({ ...next })
  }

  // 委员会名单：优先取专家抽取结果（剔除已拒绝成员，含递补成员），无抽取记录时回退演示名单
  const committee = useMemo(() => {
    const result = expertStore.getResult(projectId)
    if (result?.experts?.length) {
      const active = result.experts.filter((e) => e.confirmStatus !== 'declined')
      if (active.length) {
        return active.map((e) => ({ name: e.name, field: e.field, promoted: !!e.promotedAt }))
      }
    }
    return [
      { name: '专家甲', field: '电子信息', promoted: false },
      { name: '专家乙', field: '机械设备', promoted: false },
      { name: '专家丙', field: '工程造价', promoted: false }
    ]
  }, [projectId])

  // 需要提交评分的成员 = 委员会名单 ∪ 当前登录专家
  const scoringNames = useMemo(
    () => [...new Set([...committee.map((m) => m.name), userName])],
    [committee, userName]
  )

  // 首次进入初始化：预置截止时间；为当前专家建立评分条目（默认分为权重 80%）；
  // 演示环境为单浏览器，为其他委员会成员预置 mock 提交，使「全部提交→汇总→报告」链路可演示
  useEffect(() => {
    const current = evaluationStore.getEval(projectId)
    const missing = scoringNames.filter((n) => !current.experts?.[n])
    if (current.deadline && missing.length === 0) return
    const now = new Date().toLocaleString()
    const next = evaluationStore.updateEval(projectId, (d) => {
      if (!d.deadline) {
        d.deadline = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
      }
      scoringNames.forEach((name) => {
        if (d.experts[name]) return
        const scores = {}
        BIDDERS.forEach((b) => {
          scores[b] = {}
          scoreItems.forEach((item) => {
            scores[b][item.id] = Math.round((Number(item.weight) || 0) * 0.8)
          })
        })
        if (name === userName) {
          d.experts[name] = {
            scores,
            comments: {},
            opinion: '',
            submitted: false,
            submittedAt: null,
            signed: false,
            signedAt: null,
            revoked: false,
            revokeReason: null,
            revokedAt: null
          }
        } else {
          d.experts[name] = {
            scores,
            comments: Object.fromEntries(BIDDERS.map((b) => [b, '（演示数据）方案满足招标文件要求。'])),
            opinion: '（演示数据）同意按汇总得分推荐中标候选人。',
            submitted: true,
            submittedAt: now,
            signed: true,
            signedAt: now,
            revoked: false,
            revokeReason: null,
            revokedAt: null
          }
        }
      })
    })
    setEvalData({ ...next })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, userName])

  const [activeStep, setActiveStep] = useState(0)
  const [declared, setDeclared] = useState(false)
  const [docsRead, setDocsRead] = useState(false)
  const [evidenceOpen, setEvidenceOpen] = useState(false)
  const [evidenceTab, setEvidenceTab] = useState('tender')
  const [revokeOpen, setRevokeOpen] = useState(false)
  const [revokeReason, setRevokeReason] = useState('')

  const myEntry = evalData.experts?.[userName] || {}
  const signed = !!myEntry.signed
  const submitLocked = !!myEntry.submitted
  const expired = isEvalExpired(evalData.deadline)
  // 签名或提交后评分/意见只读（test-005：签名即锁定）
  const scoresEditable = !signed && !submitLocked && !expired

  // 组长：初始不默认设定（null），由专家在推选步骤实时推选产生（test-002）
  const leader = evalData.leader || null
  const leaderElected = !!leader
  const isLeader = leader === userName

  const report = evalData.report || null

  const allScored = BIDDERS.every((b) =>
    scoreItems.every((item) => myEntry.scores?.[b]?.[item.id] !== null && myEntry.scores?.[b]?.[item.id] !== undefined) &&
    (myEntry.comments?.[b] || '').trim() !== ''
  )

  const pendingExperts = scoringNames.filter((n) => !evalData.experts?.[n]?.submitted)
  const allExpertsSubmitted = scoringNames.length > 0 && pendingExperts.length === 0

  // 评分汇总：基于 store 中各专家已提交评分实时计算（test-004 报告内容来源）
  const summary = useMemo(() => {
    const submittedNames = scoringNames.filter((n) => evalData.experts?.[n]?.submitted)
    return BIDDERS.map((bidder) => {
      const per = submittedNames.map((n) => ({
        expert: n,
        total: scoreItems.reduce((s, item) => s + (Number(evalData.experts[n].scores?.[bidder]?.[item.id]) || 0), 0)
      }))
      const average = per.length
        ? Math.round((per.reduce((s, p) => s + p.total, 0) / per.length) * 10) / 10
        : 0
      return { bidder, per, average }
    })
      .sort((a, b) => b.average - a.average)
      .map((r, i) => ({ ...r, rank: i + 1 }))
  }, [evalData, scoringNames, scoreItems])

  const updateScore = (bidder, itemId, value) => {
    if (!scoresEditable) return
    persist((d) => {
      const e = d.experts[userName]
      if (!e) return
      if (!e.scores) e.scores = {}
      if (!e.scores[bidder]) e.scores[bidder] = {}
      e.scores[bidder][itemId] = value
    })
  }

  const updateComment = (bidder, value) => {
    if (!scoresEditable) return
    persist((d) => {
      const e = d.experts[userName]
      if (!e) return
      if (!e.comments) e.comments = {}
      e.comments[bidder] = value
    })
  }

  const updateOpinion = (value) => {
    persist((d) => {
      const e = d.experts[userName]
      if (e) e.opinion = value
    })
  }

  const voteLeader = (row) => {
    if (report) {
      message.warning('评标报告已生成，组长不可再改选')
      return
    }
    persist((d) => {
      d.leader = row.name
    })
    message.success(`已推选 ${row.name} 为评标组长，可再次点击其他成员改选`)
  }

  const openEvidence = (tab) => {
    setEvidenceTab(tab)
    setEvidenceOpen(true)
  }

  const doSign = () => {
    if (signed || submitLocked) return
    if (expired) {
      message.warning('已超过评标截止时间，无法签名')
      return
    }
    if (!allScored) {
      message.warning('请先完成所有投标人的评分和评审意见再签名')
      return
    }
    persist((d) => {
      const e = d.experts[userName]
      if (!e) return
      e.signed = true
      e.signedAt = new Date().toLocaleString()
      e.revoked = false
      e.revokeReason = null
      e.revokedAt = null
    })
    message.success('电子签名完成，评分与意见已锁定')
  }

  // 撤销签名：签名后修改评分/意见的唯一入口，需填写原因并记录（test-005）
  const submitRevoke = () => {
    if (!revokeReason.trim()) {
      message.warning('请填写撤销原因')
      return
    }
    persist((d) => {
      const e = d.experts[userName]
      if (!e) return
      e.signed = false
      e.signedAt = null
      e.revoked = true
      e.revokeReason = revokeReason.trim()
      e.revokedAt = new Date().toLocaleString()
    })
    setRevokeOpen(false)
    setRevokeReason('')
    setActiveStep(4)
    message.success('签名已撤销，可返回修改评分与意见，修改后需重新签名')
  }

  const submitAll = () => {
    if (expired) {
      message.warning('已超过评标截止时间，无法提交评分')
      return
    }
    if (!allScored) {
      message.warning('请完成所有投标人的评分和评审意见')
      return
    }
    if (!signed) {
      message.warning('请先完成电子签名')
      return
    }
    Modal.confirm({
      title: '确认提交',
      content: '提交后评分结果将锁定，无法修改，是否继续？',
      okText: '确认提交',
      cancelText: '取消',
      onOk: () => {
        persist((d) => {
          const e = d.experts[userName]
          if (!e) return
          e.submitted = true
          e.submittedAt = new Date().toLocaleString()
          const allDone = scoringNames.every((n) => d.experts[n]?.submitted)
          if (allDone) d.status = 'submitted'
        })
        message.success('评分已提交，结果已锁定')
      }
    })
  }

  const buildReportContent = ({ id, version, now, summaryRows, opinions, signatures, candidates }) => {
    const lines = []
    lines.push('评 标 报 告')
    lines.push(`报告编号：${id}    版本：${version}`)
    lines.push(`项目名称：${projectInfo.name}    项目编号：${projectInfo.code}    项目ID：${projectId}`)
    lines.push(`生成时间：${now}    生成人：${userName}（评标组长）`)
    lines.push('流程说明：本项目评标采用限时提交制，专家在评标截止时间前随时提交评分，无需全程在线（评审条目 1415-003 口径，待产品最终确认）。')
    lines.push('')
    lines.push('一、评分汇总（各专家已提交评分的算术平均）')
    summaryRows.forEach((r) => lines.push(`  第 ${r.rank} 名  ${r.bidder}：${r.average} 分`))
    lines.push('')
    lines.push('二、各专家评审意见')
    opinions.forEach((o) => lines.push(`  ${o.expert}：${o.opinion || '（未填写）'}`))
    lines.push('')
    lines.push('三、推荐中标候选人')
    candidates.forEach((c) => lines.push(`  ${c}`))
    lines.push('')
    lines.push('四、评标委员会签名状态')
    signatures.forEach((s) => lines.push(`  ${s.name}：${s.signed ? `已签名（${s.signedAt}）` : '未签名'}`))
    return lines.join('\n')
  }

  // 生成评标报告：真实报告实体，含编号/版本/内容/签名状态/归档记录，
  // 生成后项目状态联动为「评标完成」（test-004）
  const generateReport = () => {
    if (!isLeader) {
      message.warning('仅评标组长可生成评标报告')
      return
    }
    if (!allExpertsSubmitted) {
      message.warning(`请等待所有专家提交评分（未提交：${pendingExperts.join('、') || '无'}）`)
      return
    }
    Modal.confirm({
      title: report ? '重新生成评标报告' : '生成评标报告',
      content: report
        ? '重新生成将递增版本号并保留全部归档记录，是否继续？'
        : '生成后项目状态将推进为「评标完成」并进入定标流程，是否继续？',
      okText: '确认生成',
      cancelText: '取消',
      onOk: () => {
        const now = new Date().toLocaleString()
        const next = evaluationStore.updateEval(projectId, (d) => {
          const existing = d.report
          const version = bumpVersion(existing?.version)
          const id = existing?.id || `PB-${projectId}-001`
          const summaryRows = summary.map(({ bidder, average, rank }) => ({ bidder, average, rank }))
          const candidates = summary.filter((r) => r.rank === 1).map((r) => r.bidder)
          const signatures = scoringNames.map((n) => ({
            name: n,
            signed: !!d.experts[n]?.signed,
            signedAt: d.experts[n]?.signedAt || null
          }))
          const opinions = scoringNames.map((n) => ({ expert: n, opinion: d.experts[n]?.opinion || '' }))
          d.report = {
            id,
            version,
            content: buildReportContent({ id, version, now, summaryRows, opinions, signatures, candidates }),
            candidates,
            createdAt: now,
            createdBy: userName,
            archived: true,
            signatures,
            summary: summaryRows,
            opinions,
            archiveLog: [
              ...(existing?.archiveLog || []),
              { action: existing ? '重新生成报告' : '生成评标报告并归档', time: now, operator: userName, version }
            ]
          }
          d.status = 'confirmed'
        })
        setEvalData({ ...next })
        // 项目状态联动：推进为「评标完成」
        const proj = projectStore.getProjectById(projectId)
        projectStore.saveProject({
          ...(proj || { id: projectId, name: projectInfo.name, code: projectInfo.code }),
          status: '评标完成',
          evaluationReportId: next.report.id,
          evalCompletedAt: now
        })
        message.success(`评标报告已生成（${next.report.id} ${next.report.version}），项目状态已推进为「评标完成」`)
      }
    })
  }

  const downloadReport = () => {
    if (!report) return
    const escape = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const html = [
      '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8">',
      `<title>评标报告 ${escape(report.id)}</title>`,
      '<style>body{font-family:"Microsoft YaHei",sans-serif;max-width:820px;margin:40px auto;line-height:1.9;color:#222}',
      'h1{text-align:center;letter-spacing:8px}pre{white-space:pre-wrap;font-family:inherit;font-size:14px}</style></head>',
      `<body><h1>评标报告</h1><pre>${escape(report.content)}</pre></body></html>`
    ].join('')
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `评标报告-${report.id}-${report.version}.html`
    a.click()
    URL.revokeObjectURL(url)
    message.success('评标报告已下载')
  }

  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      allowClose: true,
      overlayColor: 'rgba(0, 21, 41, 0.75)',
      steps: [
        {
          element: '#expert-steps',
          popover: {
            title: '评标流程',
            description: '评标共分为 6 步：回避声明 → 专家签到 → 推选组长 → 查阅资料 → 在线评分 → 电子签名。限时提交制：截止时间前可随时提交。',
            side: 'bottom',
            align: 'center'
          }
        },
        {
          element: '.step-content',
          popover: {
            title: '当前步骤',
            description: '按提示完成当前步骤操作，完成后点击底部按钮进入下一步。评分时可随时通过「查阅资料」对照招标/投标文件。',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '#expert-submit-btn',
          popover: {
            title: '提交评分',
            description: '完成评分与电子签名后，点击此处提交评标结果；提交后结果锁定。',
            side: 'bottom',
            align: 'center'
          }
        }
      ]
    })
    driverObj.drive()
  }

  const expertColumns = [
    {
      title: '专家姓名',
      dataIndex: 'name',
      render: (name, row) => (
        <span>
          {name}
          {name === leader && <Tag color="gold" style={{ marginLeft: 6 }}>组长</Tag>}
          {row.promoted && <Tag color="blue" style={{ marginLeft: 6 }}>备选递补</Tag>}
        </span>
      )
    },
    { title: '专业领域', dataIndex: 'field' },
    { title: '签到状态', render: () => '已签到' },
    {
      title: '操作',
      width: 180,
      render: (_, row) => (
        <Button
          type="primary"
          size="small"
          disabled={row.name === leader || !!report}
          onClick={() => voteLeader(row)}
        >
          {row.name === leader ? '已当选组长' : '推选为组长'}
        </Button>
      )
    }
  ]

  const docs = [
    { key: 'tender', name: tenderDocVersion ? `招标文件（${tenderDocVersion.versionNo}）` : '招标文件', color: '#409EFF' },
    { key: 'bid', name: '投标文件', color: '#67C23A' },
    { key: 'opening', name: '开标记录', color: '#E6A23C' }
  ]

  const bidderTabItems = BIDDERS.map((bidder) => ({
    key: bidder,
    label: bidder,
    children: (
      <Form labelCol={{ flex: '0 0 120px' }} wrapperCol={{ flex: 'auto' }}>
        <Row gutter={20}>
          {scoreItems.map((item) => (
            <Col span={scoreColSpan} key={item.id}>
              <Form.Item label={item.name}>
                <InputNumber
                  min={0}
                  max={Number(item.weight) || 100}
                  disabled={!scoresEditable}
                  value={myEntry.scores?.[bidder]?.[item.id]}
                  onChange={(value) => updateScore(bidder, item.id, value)}
                />
              </Form.Item>
            </Col>
          ))}
        </Row>
        <Form.Item label="评审意见">
          <Input.TextArea
            rows={3}
            placeholder="请填写评审意见"
            disabled={!scoresEditable}
            value={myEntry.comments?.[bidder] || ''}
            onChange={(e) => updateComment(bidder, e.target.value)}
          />
        </Form.Item>
      </Form>
    )
  }))

  const summaryColumns = [
    { title: '排名', dataIndex: 'rank', width: 70 },
    { title: '投标人', dataIndex: 'bidder' },
    ...scoringNames.map((n) => ({
      title: n,
      key: n,
      width: 90,
      render: (_, row) => row.per.find((p) => p.expert === n)?.total ?? '—'
    })),
    { title: '平均得分', dataIndex: 'average', width: 100, render: (v) => <strong>{v}</strong> }
  ]

  const renderCatalog = (nodes) => (
    <ul className="catalog-list">
      {(nodes || []).map((n) => (
        <li key={n.key}>
          <div className="catalog-title">{n.title}</div>
          {(!n.children || n.children.length === 0) && (
            <div className="catalog-content">
              {n.content?.trim()
                ? n.content
                : '（本章节正文为演示占位内容，正式环境展示招标文件真实文本。）'}
            </div>
          )}
          {n.children && renderCatalog(n.children)}
        </li>
      ))}
    </ul>
  )

  const evidenceItems = [
    {
      key: 'tender',
      label: '招标文件',
      children: (
        <div>
          <Descriptions column={1} size="small" bordered style={{ marginBottom: 16 }}>
            <Descriptions.Item label="文件版本">{tenderDocVersion?.versionNo || '未发布'}</Descriptions.Item>
            <Descriptions.Item label="发布时间">{tenderDocVersion?.publishedAt || tenderDocVersion?.updatedAt || '—'}</Descriptions.Item>
            <Descriptions.Item label="编制人">{tenderDocVersion?.creator || '—'}</Descriptions.Item>
          </Descriptions>
          <h4 style={{ margin: '12px 0 8px' }}>附件清单</h4>
          <Table
            rowKey="uid"
            size="small"
            pagination={false}
            dataSource={tenderDocVersion?.fileList || []}
            columns={[
              { title: '文件名', dataIndex: 'name' },
              { title: '大小', dataIndex: 'size', width: 110, render: (s) => `${(Number(s || 0) / 1024).toFixed(0)} KB` }
            ]}
          />
          <h4 style={{ margin: '16px 0 8px' }}>招标文件正文（章节目录）</h4>
          {renderCatalog(tenderDocVersion?.catalog)}
        </div>
      )
    },
    {
      key: 'bid',
      label: '投标文件',
      children: (
        <div>
          {BIDDERS.map((b) => (
            <Card key={b} size="small" title={b} style={{ marginBottom: 12 }}>
              <Table
                rowKey="name"
                size="small"
                pagination={false}
                dataSource={[
                  { name: '投标文件-商务册.pdf', size: '2.4 MB', time: '2026-07-08 10:12' },
                  { name: '投标文件-技术册.pdf', size: '5.1 MB', time: '2026-07-08 10:15' },
                  { name: '报价一览表.xlsx', size: '68 KB', time: '2026-07-08 10:18' }
                ]}
                columns={[
                  { title: '文件', dataIndex: 'name' },
                  { title: '大小', dataIndex: 'size', width: 90 },
                  { title: '上传时间', dataIndex: 'time', width: 150 }
                ]}
              />
              <div className="catalog-content" style={{ marginTop: 8 }}>
                （投标文件正文为演示占位内容，正式环境按文件格式在线预览真实文本。）
              </div>
            </Card>
          ))}
        </div>
      )
    },
    {
      key: 'opening',
      label: '开标记录',
      children: (
        <Table
          rowKey="name"
          size="small"
          pagination={false}
          dataSource={[
            { name: 'A科技有限公司', price: '798.00', decrypt: '已解密', time: '2026-07-10 09:30' },
            { name: 'B实业有限公司', price: '812.50', decrypt: '已解密', time: '2026-07-10 09:32' },
            { name: 'C股份有限公司', price: '785.20', decrypt: '已解密', time: '2026-07-10 09:35' }
          ]}
          columns={[
            { title: '投标人', dataIndex: 'name' },
            { title: '投标报价（万元）', dataIndex: 'price', width: 130 },
            { title: '解密状态', dataIndex: 'decrypt', width: 100 },
            { title: '唱标时间', dataIndex: 'time', width: 160 }
          ]}
        />
      )
    }
  ]

  return (
    <div className="expert-project">
      <Card
        title={
          <div className="hall-header">
            <div>
              <h2>评标项目</h2>
              <p className="subtitle">{projectInfo.name} · 项目编号：{projectInfo.code} · 项目ID：{projectId}</p>
            </div>
            <div className="hall-meta">
              <StatusTag
                label={report ? '评标完成' : submitLocked ? '已提交锁定' : expired ? '已截止' : '评标中'}
                status={report || submitLocked ? 'completed' : expired ? 'completed' : 'processing'}
              />
              <Tag color={expired ? 'default' : 'blue'}>评标截止：{formatDeadline(evalData.deadline)}</Tag>
              {!submitLocked && !expired && (
                <Button type="primary" ghost icon={<QuestionCircleOutlined />} onClick={startTour}>
                  评标引导
                </Button>
              )}
              <Button onClick={onBack}>返回列表</Button>
              {!submitLocked && !expired && (
                <Button id="expert-submit-btn" type="primary" onClick={submitAll}>
                  提交我的评分
                </Button>
              )}
              {submitLocked && <Button disabled>已提交</Button>}
              {expired && !submitLocked && <Button disabled>已过截止时间</Button>}
            </div>
          </div>
        }
      >
        <Alert
          type={expired ? 'error' : 'info'}
          showIcon
          style={{ marginBottom: 16 }}
          title={
            expired
              ? `本项目评标已于 ${formatDeadline(evalData.deadline)} 截止，评分、签名与提交功能已封锁。`
              : `限时提交制：评标截止时间为 ${formatDeadline(evalData.deadline)}，专家可在截止前随时进入并提交评分，无需全程在线。所有评分操作自动保存，刷新页面不丢失。`
          }
        />

        <div id="expert-steps" style={{ marginBottom: 24 }}>
          <Steps
            current={activeStep}
            items={[
              { title: '回避声明' },
              { title: '专家签到' },
              { title: '推选组长' },
              { title: '查阅资料' },
              { title: '在线评分' },
              { title: '电子签名' }
            ]}
          />
        </div>

        <div className="step-panel">
          {/* 步骤0：回避声明 */}
          {activeStep === 0 && (
            <div className="step-content">
              <h3>回避声明与评标纪律</h3>
              <p className="tip">请确认与投标人不存在利害关系，并承诺遵守评标纪律。</p>
              <Card className="declare-card" size="small">
                <p>1. 本人与本次招标项目的投标人及其利害关系人不存在任何利害关系；</p>
                <p>2. 本人将严格按照招标文件和评标办法独立、客观、公正地进行评审；</p>
                <p>3. 本人不会泄露评标过程中的任何商业秘密和投标人的保密信息。</p>
              </Card>
              <Checkbox
                checked={declared}
                onChange={(e) => setDeclared(e.target.checked)}
                style={{ marginTop: 16 }}
              >
                我已阅读并遵守上述回避声明和评标纪律
              </Checkbox>
              <div className="stage-action">
                <Button
                  type="primary"
                  size="large"
                  disabled={!declared}
                  onClick={() => setActiveStep((prev) => prev + 1)}
                >
                  {declared ? '下一步：专家签到' : '请先勾选回避声明'}
                </Button>
              </div>
            </div>
          )}

          {/* 步骤1：专家签到 */}
          {activeStep === 1 && (
            <div className="step-content">
              <h3>专家签到</h3>
              <p className="tip">请确认身份信息并完成在线签到，评标开始前需全部专家签到完毕。</p>
              <Descriptions column={2} bordered>
                <Descriptions.Item label="项目名称">{projectInfo.name}</Descriptions.Item>
                <Descriptions.Item label="评标地点">线上评标大厅</Descriptions.Item>
                <Descriptions.Item label="专家姓名">{userName}</Descriptions.Item>
                <Descriptions.Item label="评标截止时间">{formatDeadline(evalData.deadline)}</Descriptions.Item>
              </Descriptions>
              <div className="stage-action">
                <Button onClick={() => setActiveStep((prev) => prev - 1)}>返回</Button>
                <Button type="primary" size="large" onClick={() => { message.success('签到成功'); setActiveStep((prev) => prev + 1) }}>完成签到</Button>
              </div>
            </div>
          )}

          {/* 步骤2：推选组长 */}
          {activeStep === 2 && (
            <div className="step-content">
              <h3>推选评标组长</h3>
              <p className="tip">
                组长不默认设定，由评标委员会成员实时推选产生，可点击其他成员改选；组长负责汇总评分和生成报告。
                未推选出组长前，后续评分汇总与报告生成功能保持锁定。
              </p>
              <Table
                columns={expertColumns}
                dataSource={committee}
                rowKey="name"
                pagination={false}
                style={{ width: '100%' }}
              />
              <div className="stage-action">
                <Button onClick={() => setActiveStep((prev) => prev - 1)}>返回</Button>
                <Button
                  type="primary"
                  size="large"
                  disabled={!leaderElected}
                  onClick={() => setActiveStep((prev) => prev + 1)}
                >
                  {leaderElected ? `下一步：查阅资料（组长：${leader}）` : '请先推选组长'}
                </Button>
              </div>
            </div>
          )}

          {/* 步骤3：查阅资料 */}
          {activeStep === 3 && (
            <div className="step-content">
              <h3>查阅投标资料</h3>
              <p className="tip">请仔细查阅招标文件、投标文件、开标记录和报价一览表，为评分做准备。点击资料卡片可打开资料查阅侧栏。</p>
              <Row gutter={20}>
                {docs.map((doc) => (
                  <Col span={8} key={doc.key}>
                    <Card
                      hoverable
                      className="doc-card"
                      onClick={() => openEvidence(doc.key)}
                    >
                      <FileTextOutlined style={{ fontSize: 32, color: doc.color }} />
                      <p>{doc.name}</p>
                    </Card>
                  </Col>
                ))}
              </Row>
              <div className="stage-action">
                <Button onClick={() => setActiveStep((prev) => prev - 1)}>返回</Button>
                <Checkbox
                  checked={docsRead}
                  onChange={(e) => setDocsRead(e.target.checked)}
                  style={{ marginRight: 12 }}
                >
                  我已查阅全部投标资料
                </Checkbox>
                <Button
                  type="primary"
                  size="large"
                  disabled={!docsRead}
                  onClick={() => setActiveStep((prev) => prev + 1)}
                >
                  我已查阅，开始评分
                </Button>
              </div>
            </div>
          )}

          {/* 步骤4：在线评分 */}
          {activeStep === 4 && (
            <div className="step-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>在线评分</h3>
                <Button icon={<ReadOutlined />} onClick={() => openEvidence('tender')}>
                  查阅资料
                </Button>
              </div>
              <p className="tip">
                请按评分项独立打分，每个投标人满分 {scoreWeightTotal} 分（{scoreItems.map((i) => `${i.name} ${i.weight}`).join(' + ')}）。
                评分过程中可随时点击「查阅资料」对照招标文件与投标文件；评分与意见自动保存。
                {(signed || submitLocked) && ' 已完成电子签名，评分与意见已锁定；如需修改请先撤销签名。'}
              </p>
              <Tabs type="card" items={bidderTabItems} />
              <div className="stage-action">
                <Button onClick={() => setActiveStep((prev) => prev - 1)}>返回</Button>
                <Button
                  type="primary"
                  size="large"
                  disabled={submitLocked ? false : !allScored}
                  onClick={() => setActiveStep((prev) => prev + 1)}
                >
                  {submitLocked ? '下一步：查看签名与报告' : (allScored ? '提交评分并签名' : '请完成所有评分')}
                </Button>
              </div>
            </div>
          )}

          {/* 步骤5：电子签名 + 组长报告工作区 */}
          {activeStep === 5 && (
            <div className="step-content">
              <h3>电子签名确认</h3>
              <p className="tip">请使用 CA 证书对评分结果和评标报告进行电子签名，签名后不可修改；如需修改须先撤销签名并记录原因。</p>
              <Card className={`sign-area${signed ? ' signed' : ''}`} size="small">
                <div className="sign-placeholder" onClick={doSign} style={signed ? { cursor: 'default' } : undefined}>
                  <EditOutlined style={{ fontSize: 48, color: signed ? '#67C23A' : '#409EFF' }} />
                  <p>{signed ? '电子签名已完成' : '点击此处进行电子签名'}</p>
                  {signed && <p className="sign-time">签名时间：{myEntry.signedAt}</p>}
                </div>
                {signed && !submitLocked && (
                  <div style={{ textAlign: 'center', marginTop: 12 }}>
                    <Button danger size="small" onClick={() => { setRevokeReason(''); setRevokeOpen(true) }}>
                      撤销签名
                    </Button>
                  </div>
                )}
              </Card>

              {myEntry.revoked && !signed && !submitLocked && (
                <Alert
                  type="warning"
                  showIcon
                  style={{ marginTop: 16 }}
                  title={`签名已于 ${myEntry.revokedAt || ''} 撤销，原因：${myEntry.revokeReason}。修改评分后请重新签名并提交。`}
                />
              )}

              {/* 组长工作区：评分汇总 + 报告生成 */}
              {!leaderElected && (
                <Alert
                  type="warning"
                  showIcon
                  style={{ marginTop: 20 }}
                  title="尚未推选评标组长，评分汇总与报告生成功能已锁定，请先在「推选组长」步骤完成推选。"
                />
              )}
              {leaderElected && (
                <Card title={`组长工作区（当前组长：${leader}）`} size="small" style={{ marginTop: 20 }}>
                  {!allExpertsSubmitted && (
                    <Alert
                      type="info"
                      showIcon
                      style={{ marginBottom: 12 }}
                      title={`等待全部专家提交评分后可生成报告（已提交 ${scoringNames.length - pendingExperts.length}/${scoringNames.length}，未提交：${pendingExperts.join('、')}）`}
                    />
                  )}
                  {allExpertsSubmitted && (
                    <>
                      <h4 style={{ margin: '4px 0 12px' }}>评分汇总（各专家已提交评分）</h4>
                      <Table
                        rowKey="bidder"
                        dataSource={summary}
                        pagination={false}
                        size="small"
                        columns={summaryColumns}
                      />
                      {isLeader && !report && (
                        <Form style={{ marginTop: 16 }} labelCol={{ flex: '0 0 120px' }} wrapperCol={{ flex: 'auto' }}>
                          <Form.Item label="委员会报告意见">
                            <Input.TextArea
                              rows={3}
                              placeholder="请填写评标委员会报告意见（将写入评标报告）"
                              value={myEntry.opinion || ''}
                              onChange={(e) => updateOpinion(e.target.value)}
                            />
                          </Form.Item>
                        </Form>
                      )}
                      {!isLeader && !report && (
                        <p className="tip" style={{ marginTop: 12 }}>仅组长可生成评标报告。</p>
                      )}
                      {isLeader && (
                        <div className="stage-action">
                          <Button type="primary" onClick={generateReport}>
                            {report ? '重新生成评标报告' : '生成评标报告'}
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </Card>
              )}

              {/* 评标报告实体预览 */}
              {report && (
                <Card
                  title="评标报告"
                  size="small"
                  style={{ marginTop: 20 }}
                  extra={
                    <Button type="primary" ghost icon={<DownloadOutlined />} onClick={downloadReport}>
                      下载报告
                    </Button>
                  }
                >
                  <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
                    <Descriptions.Item label="报告编号">{report.id}</Descriptions.Item>
                    <Descriptions.Item label="版本">{report.version}</Descriptions.Item>
                    <Descriptions.Item label="生成时间">{report.createdAt}</Descriptions.Item>
                    <Descriptions.Item label="生成人">{report.createdBy}</Descriptions.Item>
                    <Descriptions.Item label="状态">
                      <Tag color="success">{report.archived ? '已归档' : '未归档'}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="推荐中标候选人">
                        {(report.candidates || []).map((c) => <Tag color="gold" key={c}>{c}</Tag>)}
                    </Descriptions.Item>
                  </Descriptions>

                  <h4 style={{ margin: '4px 0 8px' }}>评分汇总</h4>
                  <Table
                    rowKey="bidder"
                    size="small"
                    pagination={false}
                    dataSource={report.summary || []}
                    columns={[
                      { title: '排名', dataIndex: 'rank', width: 70 },
                      { title: '投标人', dataIndex: 'bidder' },
                      { title: '平均得分', dataIndex: 'average', width: 110, render: (v) => <strong>{v}</strong> }
                    ]}
                  />

                  <h4 style={{ margin: '16px 0 8px' }}>委员会签名状态</h4>
                  <Table
                    rowKey="name"
                    size="small"
                    pagination={false}
                    dataSource={report.signatures || []}
                    columns={[
                      { title: '专家', dataIndex: 'name' },
                      {
                        title: '签名状态',
                        dataIndex: 'signed',
                        width: 120,
                        render: (s) => (s ? <Tag color="success">已签名</Tag> : <Tag color="warning">未签名</Tag>)
                      },
                      { title: '签名时间', dataIndex: 'signedAt', render: (v) => v || '—' }
                    ]}
                  />

                  <h4 style={{ margin: '16px 0 8px' }}>报告内容</h4>
                  <pre className="report-content">{report.content}</pre>

                  <h4 style={{ margin: '16px 0 8px' }}>归档记录</h4>
                  <Timeline
                    items={(report.archiveLog || []).map((l) => ({
                      children: `${l.time}　${l.operator}　${l.action}（版本 ${l.version}）`
                    }))}
                  />
                </Card>
              )}

              <div className="stage-action">
                <Button
                  disabled={submitLocked}
                  onClick={() => {
                    if (signed) {
                      setRevokeReason('')
                      setRevokeOpen(true)
                    } else {
                      setActiveStep((prev) => prev - 1)
                    }
                  }}
                >
                  {signed ? '返回修改（需先撤销签名）' : '返回修改'}
                </Button>
                <Button
                  type="primary"
                  size="large"
                  disabled={!signed || submitLocked || expired}
                  onClick={submitAll}
                >
                  {submitLocked ? '已完成提交' : '完成签名并提交'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* 撤销签名弹窗：需填写原因并记录 */}
      <Modal
        title="撤销电子签名"
        open={revokeOpen}
        okText="确认撤销"
        cancelText="取消"
        onOk={submitRevoke}
        onCancel={() => setRevokeOpen(false)}
      >
        <p>撤销签名后评分与意见将解除锁定，可返回修改；撤销行为与原因将被记录。</p>
        <Input.TextArea
          rows={3}
          placeholder="请填写撤销原因（必填）"
          value={revokeReason}
          onChange={(e) => setRevokeReason(e.target.value)}
        />
      </Modal>

      {/* 评分佐证：资料查阅侧栏（1415-002） */}
      <Drawer
        title="资料查阅"
        placement="right"
        size={640}
        open={evidenceOpen}
        onClose={() => setEvidenceOpen(false)}
      >
        <Tabs activeKey={evidenceTab} onChange={setEvidenceTab} items={evidenceItems} />
      </Drawer>

      <style>{`
        .expert-project {
          max-width: 1100px;
          margin: 0 auto;
        }
        .expert-project .hall-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }
        .expert-project .hall-header h2 {
          margin: 0;
        }
        .expert-project .subtitle {
          color: #666;
          margin: 8px 0 0;
        }
        .expert-project .hall-meta {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .expert-project .step-content h3 {
          margin-bottom: 8px;
        }
        .expert-project .tip {
          color: #666;
          margin-bottom: 16px;
        }
        .expert-project .declare-card p {
          margin: 8px 0;
          line-height: 1.6;
          color: #333;
        }
        .expert-project .doc-card {
          text-align: center;
          cursor: pointer;
          transition: transform 0.3s;
        }
        .expert-project .doc-card:hover {
          transform: translateY(-4px);
        }
        .expert-project .doc-card p {
          margin-top: 8px;
        }
        .expert-project .sign-area {
          background: #f9fafc;
        }
        .expert-project .sign-area.signed {
          background: #f0f9eb;
        }
        .expert-project .sign-placeholder {
          height: 160px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 2px dashed #dcdfe6;
          border-radius: 8px;
          cursor: pointer;
        }
        .expert-project .sign-area.signed .sign-placeholder {
          border-color: #67C23A;
        }
        .expert-project .sign-time {
          color: #67C23A;
          font-size: 12px;
          margin-top: 8px;
        }
        .expert-project .stage-action {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          margin-top: 24px;
        }
        .expert-project .report-content {
          white-space: pre-wrap;
          background: #f7f8fa;
          border: 1px solid #eee;
          border-radius: 6px;
          padding: 16px;
          max-height: 320px;
          overflow: auto;
          font-size: 13px;
          line-height: 1.8;
        }
        .catalog-list {
          list-style: none;
          padding-left: 16px;
          margin: 0;
        }
        .catalog-list .catalog-title {
          font-weight: 600;
          margin: 8px 0 4px;
        }
        .catalog-list .catalog-content {
          color: #888;
          font-size: 12px;
          background: #fafafa;
          border-radius: 4px;
          padding: 8px 10px;
        }
      `}</style>
    </div>
  )
}
