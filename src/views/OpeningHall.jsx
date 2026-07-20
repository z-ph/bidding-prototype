import { useMemo, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Alert, AutoComplete, Button, Card, Descriptions, Result, Steps, Table, Tag, Timeline, message, Modal } from 'antd'
import { useRole } from '../hooks/useRole.js'
import { projectStore } from '../data/projects.js'
import { quoteStore } from '../data/quoteStore.js'
import { BASELINE_PROJECTS, getPurchaseModeText, isInvitedRfqProject } from './ProjectList.jsx'
import StatusTag from '../components/StatusTag.jsx'
import ProjectEntryGuard from '../components/ProjectEntryGuard.jsx'

// 开标准备配置（cal-003）：按项目持久化主持人/监督人指定结果
// 未新建 src/data/openingPrepStore.js（本次仅允许改动两个视图文件），存储逻辑内联在此
const PREP_STORAGE_KEY = 'bidding-opening-prep'

function loadPrepMap() {
  try {
    const raw = localStorage.getItem(PREP_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function loadPrep(projectId) {
  return loadPrepMap()[String(projectId)] || { host: '', supervisor: '' }
}

function savePrep(projectId, prep) {
  try {
    const all = loadPrepMap()
    all[String(projectId)] = prep
    localStorage.setItem(PREP_STORAGE_KEY, JSON.stringify(all))
  } catch {
    // ignore storage errors
  }
}

// 主持人/监督人候选（可选择也可手动输入）
const HOST_OPTIONS = [
  { value: '张三', label: '张三（招标人）' },
  { value: '李四', label: '李四（招标代理）' }
]
const SUPERVISOR_OPTIONS = [
  { value: '王监督', label: '王监督（监督办公室）' },
  { value: '赵监督', label: '赵监督（财政局监督科）' }
]

export default function OpeningHall() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false })
  const projectId = searchParams.projectId
  const { role, roleName, userName } = useRole()

  // 采购方式门禁（add-purchase-method-flow-20260717）：项目/标段均为邀请询比价时无开标环节
  const project = useMemo(
    () =>
      projectStore.getProjectById(projectId) ||
      BASELINE_PROJECTS.find((p) => String(p.id) === String(projectId)) ||
      null,
    [projectId]
  )
  const invitedRfq = isInvitedRfqProject(project)

  const [currentStage, setCurrentStage] = useState(0)
  const [operationRecords, setOperationRecords] = useState([])
  const [deadline] = useState('2026-07-08 15:00')

  // 主持人：招标人/招标代理可操作开标流程；监督人员只读；投标人只能签到/解密自己
  const isHost = ['tenderee', 'agent'].includes(role)
  const isBidder = role === 'bidder'
  const roleTagColor = isHost ? 'warning' : 'default'
  // 2052-010：招标人/代理/监督可进入评标大厅（tenderee 待基础设施在 permissions.js 放行后生效）
  const canViewEvaluation = ['tenderee', 'agent', 'supervisor'].includes(role)

  // cal-003：开标准备——指定主持人/监督人（localStorage 持久化，刷新保留）
  const [prep, setPrep] = useState(() => loadPrep(projectId))
  const [hostInput, setHostInput] = useState(prep.host)
  const [supervisorInput, setSupervisorInput] = useState(prep.supervisor)
  const prepReady = !!(prep.host && prep.supervisor)

  // 签到记录按「角色-姓名」键控，签到表人员名单与开标准备配置联动
  const [checkins, setCheckins] = useState({})

  const [bidders, setBidders] = useState([
    { name: 'A科技有限公司', files: 3, status: '未解密', time: '-' },
    { name: 'B实业有限公司', files: 3, status: '未解密', time: '-' },
    { name: 'C股份有限公司', files: 3, status: '未解密', time: '-' }
  ])

  const bids = useMemo(() => {
    const quotes = quoteStore.getQuotes()
    return Object.entries(quotes)
      .filter(([key]) => key.startsWith(`${projectId}::`))
      .map(([key, value], i) => ({
        rank: i + 1,
        name: key.split('::')[1],
        price: value?.quote?.totalPrice ?? '-',
        delivery: value?.quote?.deliveryPeriod ?? '-',
        quality: value?.quote?.warrantyPeriod ?? '-'
      }))
  }, [projectId])

  function isSelfAttendee(a) {
    if (a.role === '主持人') return isHost && userName === a.name
    if (a.role === '监督人') return role === 'supervisor' && userName === a.name
    if (a.role === '招标人') return role === 'tenderee' && userName === a.name
    if (a.role === '招标代理') return role === 'agent' && userName === a.name
    if (a.role === '投标人') return role === 'bidder' && userName === a.name
    return false
  }

  // 签到表（cal-003）：主持人/监督人来自开标准备配置，其余为项目参与方
  const attendeeList = useMemo(() => {
    const base = [
      { role: '主持人', name: prep.host || '（待指定）' },
      { role: '监督人', name: prep.supervisor || '（待指定）' },
      { role: '招标人', name: '张三' },
      { role: '招标代理', name: '李四' },
      { role: '投标人', name: 'A科技有限公司' },
      { role: '投标人', name: 'B实业有限公司' },
      { role: '投标人', name: 'C股份有限公司' }
    ]
    return base.map((a) => {
      const key = `${a.role}-${a.name}`
      const record = checkins[key]
      return {
        ...a,
        key,
        status: record?.status || '未签到',
        time: record?.time || '-',
        self: isSelfAttendee(a)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prep, checkins, role, userName])

  const allCheckedIn = attendeeList.every((a) => a.status === '已签到')
  const missingAttendees = attendeeList.filter((a) => a.status !== '已签到').map((a) => `${a.role}：${a.name}`)
  const allDecrypted = bidders.every((b) => b.status === '已解密')

  const stageLabels = [
    '开标准备',
    '身份核验',
    '开标启动',
    '文件解密',
    '唱标公示',
    '开标结束'
  ]

  const stageActions = [
    '指定主持人与监督人',
    '完成在线签到',
    '宣布开标纪律并启动开标',
    '投标人解密投标文件',
    '公开唱标并公示报价',
    '生成开标记录，进入评标'
  ]

  const addOperationRecord = (action, detail) => {
    setOperationRecords((prev) => [
      {
        id: Date.now(),
        action,
        detail,
        operator: userName || '-',
        time: new Date().toLocaleString()
      },
      ...prev
    ])
  }

  // cal-003：保存主持人/监督人指定结果（两个角色都必须指定才允许进入下一步）
  const savePrepConfig = () => {
    const host = hostInput.trim()
    const supervisor = supervisorInput.trim()
    if (!host || !supervisor) {
      message.warning('请先填写主持人与监督人')
      return
    }
    const next = { host, supervisor, updatedAt: new Date().toLocaleString() }
    savePrep(projectId, next)
    setPrep(next)
    setHostInput(host)
    setSupervisorInput(supervisor)
    addOperationRecord('开标准备', `已指定主持人：${host}；监督人：${supervisor}`)
    message.success('主持人/监督人已指定')
  }

  function canDecrypt(row) {
    // 投标人只能解密自己的投标文件；主持人/代理仅查看状态
    if (isBidder) {
      return row.name === userName
    }
    return false
  }

  const canCheckIn = (row) => {
    // 各参与方只能签到自己
    return row.self
  }

  const checkIn = (row) => {
    const time = new Date().toLocaleString()
    setCheckins((prev) => ({ ...prev, [row.key]: { status: '已签到', time } }))
    addOperationRecord('签到', `${row.role} ${row.name} 已完成签到`)
    message.success(`${row.name} 签到成功`)
  }

  const decrypt = (row) => {
    Modal.confirm({
      title: '解密确认',
      content: `确定对 ${row.name} 的投标文件执行 CA 解密吗？`,
      okText: '确认解密',
      cancelText: '取消',
      onOk: () => {
        const time = new Date().toLocaleString()
        setBidders((prev) =>
          prev.map((b) => (b.name === row.name ? { ...b, status: '已解密', time } : b))
        )
        addOperationRecord('文件解密', `${row.name} 的投标文件已完成 CA 解密`)
        message.success(`${row.name} 投标文件解密成功`)
      }
    })
  }

  const nextStage = () => {
    setCurrentStage((prev) => {
      const next = Math.min(prev + 1, 5)
      if (next !== prev) {
        addOperationRecord('阶段推进', `开标流程进入：${stageLabels[next]}`)
      }
      return next
    })
  }

  const prevStage = () => {
    setCurrentStage((prev) => Math.max(prev - 1, 0))
  }

  const enterOpening = () => {
    if (!allCheckedIn) {
      Modal.confirm({
        title: '尚有人员未签到',
        content: (
          <>
            <p>当前未签到人员：</p>
            <ul>
              {missingAttendees.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
            <p>是否仍要继续进入开标？</p>
          </>
        ),
        okText: '强制进入开标',
        cancelText: '取消',
        onOk: nextStage
      })
    } else {
      nextStage()
    }
  }

  const startDecrypt = () => {
    Modal.confirm({
      title: '启动解密',
      content: '即将进入投标文件解密阶段，请确认已宣读开标纪律。',
      okText: '确认启动',
      cancelText: '取消',
      onOk: nextStage
    })
  }

  const finishOpening = () => {
    nextStage()
    addOperationRecord('开标结束', `唱标结束，开标记录已生成（主持人：${prep.host}；监督人：${prep.supervisor}），可进入评标大厅`)
    message.success('唱标结束，开标记录已生成，请进入评标大厅')
  }

  const refresh = () => {
    message.success('状态已刷新')
  }

  const goEvaluate = () => {
    navigate({ to: '/admin/evaluation-hall', search: { projectId } })
  }

  const attendeeColumns = [
    { title: '角色', dataIndex: 'role', width: 120 },
    { title: '姓名/企业', dataIndex: 'name' },
    {
      title: '签到状态',
      dataIndex: 'status',
      width: 120,
      render: (status) => (
        <StatusTag label={status} status={status === '已签到' ? 'completed' : 'pending'} />
      )
    },
    { title: '签到时间', dataIndex: 'time', width: 180 },
    {
      title: '操作',
      width: 140,
      render: (_, row) => {
        if (row.status === '已签到') {
          return <span className="text-success">已签到</span>
        }
        if (canCheckIn(row)) {
          return (
            <Button type="primary" size="small" onClick={() => checkIn(row)}>
              签到
            </Button>
          )
        }
        return <span className="text-muted">待签到</span>
      }
    }
  ]

  const bidderColumns = [
    { title: '投标人', dataIndex: 'name' },
    { title: '文件数量', dataIndex: 'files', width: 100 },
    {
      title: '解密状态',
      dataIndex: 'status',
      width: 140,
      render: (status) => (
        <StatusTag label={status} status={status === '已解密' ? 'completed' : 'pending'} />
      )
    },
    { title: '解密时间', dataIndex: 'time', width: 180 },
    {
      title: '操作',
      width: 120,
      render: (_, row) => {
        if (row.status !== '已解密' && canDecrypt(row)) {
          return (
            <Button type="primary" size="small" onClick={() => decrypt(row)}>
              解密
            </Button>
          )
        }
        if (row.status === '已解密') {
          return <span className="text-success">已解密</span>
        }
        return <span className="text-muted">待解密</span>
      }
    }
  ]

  const bidColumns = [
    { title: '序号', dataIndex: 'rank', width: 80 },
    { title: '投标人', dataIndex: 'name' },
    { title: '投标报价（万元）', dataIndex: 'price', width: 160 },
    { title: '交货期', dataIndex: 'delivery', width: 140 },
    { title: '质保期', dataIndex: 'quality', width: 120 }
  ]

  // 入口守卫（所有 hooks 之后）：无 projectId 时阻断并引导从项目进入；
  // 同路由无参→有参导航复用组件实例，hooks 数量必须保持不变
  if (!projectId) {
    return <ProjectEntryGuard />
  }

  // 页面级门禁（清单 20）：邀请询比价项目无开标环节，阻断开标操作区并引导前往定标/采购结果
  if (invitedRfq) {
    return (
      <div className="opening-hall" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Card>
          <Result
            status="info"
            title="邀请询比价项目无需开标"
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
    <div className="opening-hall">
      <Card
        title={
          <div className="hall-header">
            <div>
              <h2>开标大厅</h2>
              <p className="subtitle">XX市轨道交通设备采购项目 · 标段一：主设备 · 项目ID：{projectId}</p>
            </div>
            <div className="hall-meta">
              <Tag color="error" style={{ fontSize: 14, padding: '4px 12px' }}>
                开标倒计时：00:12:35
              </Tag>
              <Tag color={roleTagColor} style={{ fontSize: 14, padding: '4px 12px' }}>
                {roleName}
              </Tag>
              <Button type="primary" onClick={refresh}>
                刷新状态
              </Button>
            </div>
          </div>
        }
      >
        <Steps
          current={currentStage}
          items={[
            { title: '开标准备', description: '指定主持人/监督人' },
            { title: '身份核验', description: '招标人/投标人/专家签到' },
            { title: '开标启动', description: '招标人宣布开标' },
            { title: '文件解密', description: '投标人CA解密投标文件' },
            { title: '唱标公示', description: '公开报价与核心信息' },
            { title: '开标结束', description: '生成开标记录' }
          ]}
        />

        <Card size="small" title="当前状态与下一步" style={{ marginTop: 24, marginBottom: 24, background: '#f6ffed' }}>
          <Descriptions column={2}>
            <Descriptions.Item label="当前阶段">{stageLabels[currentStage]}</Descriptions.Item>
            <Descriptions.Item label="截止时间">{deadline}</Descriptions.Item>
            <Descriptions.Item label="当前状态">
              <Tag color={currentStage === 5 ? 'success' : 'processing'}>
                {currentStage === 5 ? '开标结束' : '进行中'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="下一步">
              {currentStage === 5 ? (
                canViewEvaluation ? (
                  <>
                    <span style={{ marginRight: 12 }}>进入评标大厅</span>
                    <Button type="primary" size="small" onClick={goEvaluate}>去评标</Button>
                  </>
                ) : (
                  <span>开标结束，评标环节仅招标人/代理/监督可查看</span>
                )
              ) : (
                <span>{stageActions[currentStage]}</span>
              )}
            </Descriptions.Item>
          </Descriptions>
          {currentStage === 0 && !prepReady && (
            <Alert
              title="阻断原因：尚未指定主持人/监督人，指定后方可进入身份核验阶段。"
              type="warning"
              showIcon
              closable={false}
              style={{ marginTop: 12 }}
            />
          )}
          {currentStage === 1 && !allCheckedIn && (
            <Alert
              title={`阻断原因：尚有 ${missingAttendees.length} 人未签到，所有人签到后方可进入开标启动阶段。`}
              type="warning"
              showIcon
              closable={false}
              style={{ marginTop: 12 }}
            />
          )}
          {currentStage === 3 && !allDecrypted && (
            <Alert
              title="阻断原因：尚有投标文件未解密，所有文件解密后方可进入唱标公示阶段。"
              type="warning"
              showIcon
              closable={false}
              style={{ marginTop: 12 }}
            />
          )}
        </Card>

        <div className="stage-panel">
          {/* 阶段0：开标准备（cal-003，招标人/代理指定主持人与监督人） */}
          {currentStage === 0 && (
            <div className="stage-content">
              <h3>开标准备</h3>
              <p className="tip">开标前由招标人/招标代理指定主持人与监督人，指定后签到表与唱标环节将使用该名单。</p>
              {isHost ? (
                <>
                  <div className="prep-form">
                    <div className="prep-field">
                      <span className="prep-label">主持人</span>
                      <AutoComplete
                        style={{ width: 280 }}
                        placeholder="选择或手动输入主持人姓名"
                        options={HOST_OPTIONS}
                        value={hostInput}
                        onChange={setHostInput}
                      />
                    </div>
                    <div className="prep-field">
                      <span className="prep-label">监督人</span>
                      <AutoComplete
                        style={{ width: 280 }}
                        placeholder="选择或手动输入监督人姓名"
                        options={SUPERVISOR_OPTIONS}
                        value={supervisorInput}
                        onChange={setSupervisorInput}
                      />
                    </div>
                    <Button type="primary" onClick={savePrepConfig}>
                      保存指定
                    </Button>
                  </div>
                  {prepReady && (
                    <Alert
                      type="success"
                      showIcon
                      closable={false}
                      title={`已指定：主持人 ${prep.host}，监督人 ${prep.supervisor}（可修改后重新保存）`}
                      style={{ marginBottom: 16 }}
                    />
                  )}
                </>
              ) : (
                <>
                  <Alert
                    type="info"
                    showIcon
                    closable={false}
                    title={`您当前以 ${roleName} 身份进入，开标准备由招标人/招标代理完成。`}
                    style={{ marginBottom: 16 }}
                  />
                  <Descriptions column={2} bordered>
                    <Descriptions.Item label="主持人">{prep.host || '待指定'}</Descriptions.Item>
                    <Descriptions.Item label="监督人">{prep.supervisor || '待指定'}</Descriptions.Item>
                  </Descriptions>
                </>
              )}
              <div className="stage-action">
                {isHost && (
                  <Button type="primary" size="large" disabled={!prepReady} onClick={nextStage}>
                    {prepReady ? '准备完成，进入身份核验' : '请先指定主持人与监督人'}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* 阶段1：身份核验 */}
          {currentStage === 1 && (
            <div className="stage-content">
              <h3>在线签到</h3>
              <p className="tip">请各参与方使用各自账号完成身份核验签到，不能代他人签到。</p>
              {!isHost && (
                <Alert
                  type="info"
                  showIcon
                  closable={false}
                  title={`您当前以 ${roleName} 身份进入，仅可签到自己并查看开标过程。`}
                  style={{ marginBottom: 16 }}
                />
              )}
              {missingAttendees.length > 0 && isHost && (
                <Alert
                  type="warning"
                  showIcon
                  closable={false}
                  title={`尚有 ${missingAttendees.length} 人未签到：${missingAttendees.join('、')}`}
                  style={{ marginBottom: 16 }}
                />
              )}
              <Table
                columns={attendeeColumns}
                dataSource={attendeeList}
                rowKey="key"
                pagination={false}
                style={{ width: '100%' }}
              />
              <div className="stage-action">
                {isHost && <Button onClick={prevStage}>返回</Button>}
                {isHost && (
                  <Button type="primary" size="large" onClick={enterOpening}>
                    {allCheckedIn ? '所有人签到完成，进入开标' : `尚有 ${missingAttendees.length} 人未签到，确认进入开标`}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* 阶段2：开标启动 */}
          {currentStage === 2 && (
            <div className="stage-content">
              <h3>开标启动</h3>
              <p className="tip">招标人宣读开标纪律并确认投标人名单</p>
              <Descriptions column={2} bordered>
                <Descriptions.Item label="项目名称">XX市轨道交通设备采购项目</Descriptions.Item>
                <Descriptions.Item label="标段">标段一：主设备</Descriptions.Item>
                <Descriptions.Item label="主持人">{prep.host}</Descriptions.Item>
                <Descriptions.Item label="监督人">{prep.supervisor}</Descriptions.Item>
                <Descriptions.Item label="投标人数量">3 家</Descriptions.Item>
                <Descriptions.Item label="开标时间">2026-07-08 15:00</Descriptions.Item>
              </Descriptions>
              <div className="stage-action">
                {isHost && <Button onClick={prevStage}>返回</Button>}
                {isHost && (
                  <Button type="primary" size="large" onClick={startDecrypt}>
                    启动解密
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* 阶段3：文件解密 */}
          {currentStage === 3 && (
            <div className="stage-content">
              <h3>投标文件解密</h3>
              <p className="tip">各投标人使用各自 CA 私钥解密投标文件；主持人/代理仅可查看解密状态。</p>
              <Table
                columns={bidderColumns}
                dataSource={bidders}
                rowKey="name"
                pagination={false}
                style={{ width: '100%' }}
              />
              <div className="stage-action">
                {isHost && <Button onClick={prevStage}>返回</Button>}
                {isHost && (
                  <Button
                    type="primary"
                    size="large"
                    disabled={!allDecrypted}
                    onClick={nextStage}
                  >
                    {allDecrypted ? '解密完成，进入唱标' : '尚有投标文件未解密'}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* 阶段4：唱标公示（唱标人/监督人使用开标准备配置名单） */}
          {currentStage === 4 && (
            <div className="stage-content">
              <h3>唱标公示</h3>
              <p className="tip">按递交文件顺序公开投标报价与工期等核心信息</p>
              <Descriptions column={2} style={{ marginBottom: 16 }}>
                <Descriptions.Item label="唱标人（主持人）">{prep.host}</Descriptions.Item>
                <Descriptions.Item label="监督人">{prep.supervisor}</Descriptions.Item>
              </Descriptions>
              <Table
                columns={bidColumns}
                dataSource={bids}
                rowKey="rank"
                pagination={false}
                style={{ width: '100%' }}
              />
              <div className="stage-action">
                {isHost && <Button onClick={prevStage}>返回</Button>}
                {isHost && (
                  <Button type="primary" size="large" onClick={finishOpening}>
                    唱标结束
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* 阶段5：开标结束 */}
          {currentStage === 5 && (
            <div className="stage-content">
              <Result
                status="success"
                title="开标结束"
                subTitle={`开标记录已生成（主持人：${prep.host}；监督人：${prep.supervisor}），可进入评标环节`}
                extra={[
                  canViewEvaluation && (
                    <Button key="evaluate" type="primary" onClick={goEvaluate}>
                      进入评标大厅
                    </Button>
                  ),
                  isHost && (
                    <Button key="replay" onClick={() => setCurrentStage(0)}>
                      重新演示
                    </Button>
                  ),
                  isBidder && (
                    <span key="no-eval" className="text-muted">
                      评标环节仅招标人/代理/监督可查看
                    </span>
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
        .opening-hall {
          max-width: 1100px;
          margin: 0 auto;
        }
        .opening-hall .hall-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }
        .opening-hall .hall-header h2 {
          margin: 0;
        }
        .opening-hall .subtitle {
          color: #666;
          margin: 8px 0 0;
        }
        .opening-hall .hall-meta {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .opening-hall .stage-panel {
          margin-top: 30px;
          padding: 20px;
          background: #f9fafc;
          border-radius: 8px;
        }
        .opening-hall .stage-content h3 {
          margin-bottom: 8px;
        }
        .opening-hall .tip {
          color: #666;
          margin-bottom: 16px;
        }
        .opening-hall .stage-action {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-top: 24px;
        }
        .opening-hall .prep-form {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 16px;
        }
        .opening-hall .prep-field {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .opening-hall .prep-label {
          font-weight: 500;
          color: #333;
        }
        .opening-hall .text-success {
          color: #67C23A;
          font-size: 14px;
        }
        .opening-hall .text-muted {
          color: #909399;
          font-size: 14px;
        }
      `}</style>
    </div>
  )
}
