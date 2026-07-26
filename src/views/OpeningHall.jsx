// @ts-nocheck — TS 渐进迁移基线：解冻本文件时删除本行并修复类型（见 AGENTS.md 技术栈）
import { useMemo, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Alert, AutoComplete, Button, Card, Descriptions, Input, Radio, Result, Steps, Table, Tag, Timeline, message, Modal } from 'antd'
import { useRole } from '../hooks/useRole.js'
import { projectStore } from '../data/projects.js'
import { quoteStore } from '../data/quoteStore.js'
import { BASELINE_PROJECTS, getPurchaseModeText, isInquiryFamily } from './ProjectList.jsx'
import StatusTag from '../components/StatusTag.jsx'
import ProjectEntryGuard from '../components/ProjectEntryGuard.jsx'
import { exportCsv } from '../utils/exportCsv.js'

// 开启准备配置（cal-003）：按项目持久化主持人/监督人指定结果
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
  { value: '张三', label: '张三（采购单位）' },
  { value: '李四', label: '李四（采购代理）' }
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

  // 大厅归属门禁（hall-purchase-method-mapping-20260721）：开启大厅仅服务采购族，询比族项目引导至比价大厅
  const project = useMemo(
    () =>
      projectStore.getProjectById(projectId) ||
      BASELINE_PROJECTS.find((p) => String(p.id) === String(projectId)) ||
      null,
    [projectId]
  )
  const inquiryFamily = isInquiryFamily(project)

  const [currentStage, setCurrentStage] = useState(0)
  const [operationRecords, setOperationRecords] = useState([])
  const [deadline] = useState('2026-07-08 15:00')
  const [bidderConfirmed, setBidderConfirmed] = useState(false)
  const [bidderConfirmInfo, setBidderConfirmInfo] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmMethod, setConfirmMethod] = useState('seal')
  const [signName, setSignName] = useState('')

  // 主持人：采购单位/采购代理可操作开启流程；监督人员只读；响应单位只能签到/解密自己
  const isHost = ['tenderee', 'agent'].includes(role)
  const isBidder = role === 'bidder'
  const isExpert = role === 'expert'
  const roleTagColor = isHost ? 'warning' : 'default'
  // 2052-010：采购单位/代理/监督可进入评审大厅（tenderee 待基础设施在 permissions.js 放行后生效）
  const canViewEvaluation = ['tenderee', 'agent', 'supervisor'].includes(role)

  // cal-003：开启准备——指定主持人/监督人（localStorage 持久化，刷新保留）
  const [prep, setPrep] = useState(() => loadPrep(projectId))
  const [hostInput, setHostInput] = useState(prep.host)
  const [supervisorInput, setSupervisorInput] = useState(prep.supervisor)
  const prepReady = !!(prep.host && prep.supervisor)

  // 签到记录按「角色-姓名」键控，签到表人员名单与开启准备配置联动
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
    if (a.role === '采购单位') return role === 'tenderee' && userName === a.name
    if (a.role === '采购代理') return role === 'agent' && userName === a.name
    if (a.role === '响应单位') return role === 'bidder' && userName === a.name
    return false
  }

  // 签到表（cal-003）：主持人/监督人来自开启准备配置，其余为项目参与方
  const attendeeList = useMemo(() => {
    const base = [
      { role: '主持人', name: prep.host || '（待指定）' },
      { role: '监督人', name: prep.supervisor || '（待指定）' },
      { role: '采购单位', name: '张三' },
      { role: '采购代理', name: '李四' },
      { role: '响应单位', name: 'A科技有限公司' },
      { role: '响应单位', name: 'B实业有限公司' },
      { role: '响应单位', name: 'C股份有限公司' }
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
    '开启准备',
    '身份核验',
    '开启启动',
    '文件解密',
    '唱价公示',
    '开启结束'
  ]

  const stageActions = [
    '指定主持人与监督人',
    '完成在线签到',
    '宣布开启纪律并启动开启',
    '响应单位解密响应文件',
    '公开唱价并公示报价',
    '生成开启记录，进入评审'
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
    addOperationRecord('开启准备', `已指定主持人：${host}；监督人：${supervisor}`)
    message.success('主持人/监督人已指定')
  }

  function canDecrypt(row) {
    // 响应单位只能解密自己的响应文件；主持人/代理仅查看状态
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
      content: `确定对 ${row.name} 的响应文件执行解密吗？响应单位需使用上传时设置的解密密码。`,
      okText: '确认解密',
      cancelText: '取消',
      onOk: () => {
        const time = new Date().toLocaleString()
        setBidders((prev) =>
          prev.map((b) => (b.name === row.name ? { ...b, status: '已解密', time } : b))
        )
        addOperationRecord('文件解密', `${row.name} 的响应文件已完成解密`)
        message.success(`${row.name} 响应文件解密成功`)
      }
    })
  }

  const nextStage = () => {
    setCurrentStage((prev) => {
      const next = Math.min(prev + 1, 5)
      if (next !== prev) {
        addOperationRecord('阶段推进', `开启流程进入：${stageLabels[next]}`)
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
            <p>是否仍要继续进入开启？</p>
          </>
        ),
        okText: '强制进入开启',
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
      content: '即将进入响应文件解密阶段，请确认已宣读开启纪律。',
      okText: '确认启动',
      cancelText: '取消',
      onOk: nextStage
    })
  }

  const forceEnterBidding = () => {
    const undecrypted = bidders.filter((b) => b.status !== '已解密')
    Modal.confirm({
      title: '尚有响应文件未解密',
      content: (
        <>
          <p>当前未解密响应单位：</p>
          <ul>
            {undecrypted.map((b) => (
              <li key={b.name}>{b.name}</li>
            ))}
          </ul>
          <p>所有文件解密后方可进入唱价公示阶段。是否仍要强制进入唱价？（演示模式）</p>
        </>
      ),
      okText: '强制进入唱价',
      cancelText: '取消',
      onOk: nextStage
    })
  }

  const finishOpening = () => {
    nextStage()
    addOperationRecord('开启结束', `唱价结束，开启记录已生成（主持人：${prep.host}；监督人：${prep.supervisor}），可进入评审大厅`)
    message.success('唱价结束，开启记录已生成，请进入评审大厅')
  }

  const refresh = () => {
    message.success('状态已刷新')
  }

  const goEvaluate = () => {
    navigate({ to: '/admin/evaluation-hall', search: { projectId } })
  }

  // 唱价确认（2026-07-26 口径）：投标人须以电子签章或签名方式二次确认唱价内容
  const submitBidderConfirm = () => {
    if (confirmMethod === 'sign' && !signName.trim()) {
      message.warning('请输入签名人姓名')
      return
    }
    const time = new Date().toLocaleString()
    const methodLabel = confirmMethod === 'seal' ? '电子签章' : '签名'
    const name = confirmMethod === 'sign' ? signName.trim() : userName
    setBidderConfirmed(true)
    setBidderConfirmInfo({ methodLabel, name, time })
    setConfirmOpen(false)
    addOperationRecord('唱价确认', `${userName} 已通过${methodLabel}确认唱价内容（确认人：${name}）`)
    message.success(`唱价内容已通过${methodLabel}确认`)
  }

  // 唱价一览表导出（CSV）：唱价公示与开启结束后均可导出，响应单位/采购单位/代理/监督通用
  const exportBidTable = () => {
    if (bids.length === 0) {
      message.warning('暂无唱价数据可导出')
      return
    }
    const date = new Date().toISOString().slice(0, 10)
    exportCsv(
      `唱价一览表_${project?.name || projectId}_${date}.csv`,
      ['序号', '响应单位', '响应报价（万元）', '交货期', '质保期'],
      bids.map((b) => [b.rank, b.name, b.price, b.delivery, b.quality])
    )
    addOperationRecord('导出唱价一览表', `${userName || '-'} 导出了唱价一览表（${bids.length} 家响应单位）`)
    message.success('唱价一览表已导出')
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
    { title: '响应单位', dataIndex: 'name' },
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
    { title: '响应单位', dataIndex: 'name' },
    { title: '响应报价（万元）', dataIndex: 'price', width: 160 },
    { title: '交货期', dataIndex: 'delivery', width: 140 },
    { title: '质保期', dataIndex: 'quality', width: 120 }
  ]

  // 入口守卫（所有 hooks 之后）：无 projectId 时阻断并引导从项目进入；
  // 同路由无参→有参导航复用组件实例，hooks 数量必须保持不变
  if (!projectId) {
    return <ProjectEntryGuard />
  }

  // 页面级门禁（hall-purchase-method-mapping-20260721）：开启大厅仅服务采购族（阳光采购/邀请采购），
  // 询比族项目（公开询比/邀请询比）请在比价大厅操作
  if (inquiryFamily) {
    return (
      <div className="opening-hall" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Card>
          <Result
            status="info"
            title="询比族项目请在比价大厅操作"
            subTitle={
              <>
                <p style={{ margin: 0 }}>
                  {project?.name || `项目ID：${projectId}`}（采购方式：{getPurchaseModeText(project)}）
                </p>
                <p style={{ margin: '8px 0 0' }}>
                  公开询比、邀请询比项目无需开启，报价截止后在比价大厅比较各供应商报价。
                </p>
              </>
            }
            extra={[
              <Button
                key="comparison"
                type="primary"
                onClick={() => navigate({ to: '/admin/comparison-hall', search: { projectId } })}
              >
                前往比价大厅
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
            title="口径说明：开启大厅服务采购族（阳光采购、邀请采购），比价大厅服务询比族（公开询比、邀请询比），评审大厅对所有项目开放（2026-07-21 需求，废止 2026-07-17 清单 20 旧口径）。"
          />
        </Card>
      </div>
    )
  }

  // 专家角色不参与开启流程
  if (isExpert) {
    return (
      <div className="opening-hall" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Card>
          <Result
            status="info"
            title="评审专家不参与开启流程"
            subTitle="开启流程由采购单位、采购代理、响应单位和监督人员参与，评审专家无需参与开启环节。"
            extra={[
              <Button key="back" onClick={() => navigate({ to: '/admin/expert-tasks' })}>
                返回我的任务
              </Button>
            ]}
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
              <h2>开启大厅</h2>
              <p className="subtitle">XX市轨道交通设备采购项目 · 采购包一：主设备 · 项目ID：{projectId}</p>
            </div>
            <div className="hall-meta">
              <Tag color="error" style={{ fontSize: 14, padding: '4px 12px' }}>
                开启倒计时：00:12:35
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
            { title: '开启准备', description: '指定主持人/监督人' },
            { title: '身份核验', description: '采购单位/响应单位签到' },
            { title: '开启启动', description: '采购单位宣布开启' },
            { title: '文件解密', description: '响应单位解密响应文件' },
            { title: '唱价公示', description: '公开报价与核心信息' },
            { title: '开启结束', description: '生成开启记录' }
          ]}
        />

        <Card size="small" title="当前状态与下一步" style={{ marginTop: 24, marginBottom: 24, background: '#f6ffed' }}>
          <Descriptions column={2}>
            <Descriptions.Item label="当前阶段">{stageLabels[currentStage]}</Descriptions.Item>
            <Descriptions.Item label="截止时间">{deadline}</Descriptions.Item>
            <Descriptions.Item label="当前状态">
              <Tag color={currentStage === 5 ? 'success' : 'processing'}>
                {currentStage === 5 ? '开启结束' : '进行中'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="下一步">
              {currentStage === 5 ? (
                canViewEvaluation ? (
                  <>
                    <span style={{ marginRight: 12 }}>进入评审大厅</span>
                    <Button type="primary" size="small" onClick={goEvaluate}>去评审</Button>
                  </>
                ) : (
                  <span>开启结束，评审环节仅采购单位/代理/监督可查看</span>
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
              title={`阻断原因：尚有 ${missingAttendees.length} 人未签到，所有人签到后方可进入开启启动阶段。`}
              type="warning"
              showIcon
              closable={false}
              style={{ marginTop: 12 }}
            />
          )}
          {currentStage === 3 && !allDecrypted && (
            <Alert
              title="阻断原因：尚有响应文件未解密，所有文件解密后方可进入唱价公示阶段。"
              type="warning"
              showIcon
              closable={false}
              style={{ marginTop: 12 }}
            />
          )}
        </Card>

        <div className="stage-panel">
          {/* 阶段0：开启准备（cal-003，采购单位/代理指定主持人与监督人） */}
          {currentStage === 0 && (
            <div className="stage-content">
              <h3>开启准备</h3>
              <p className="tip">开启前由采购单位/采购代理指定主持人与监督人，指定后签到表与唱价环节将使用该名单。</p>
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
                    title={`您当前以 ${roleName} 身份进入，开启准备由采购单位/采购代理完成。`}
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
                  title={`您当前以 ${roleName} 身份进入，仅可签到自己并查看开启过程。`}
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
                    {allCheckedIn ? '所有人签到完成，进入开启' : `尚有 ${missingAttendees.length} 人未签到，确认进入开启`}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* 阶段2：开启启动 */}
          {currentStage === 2 && (
            <div className="stage-content">
              <h3>开启启动</h3>
              <p className="tip">采购单位宣读开启纪律并确认响应单位名单</p>
              <Descriptions column={2} bordered>
                <Descriptions.Item label="项目名称">XX市轨道交通设备采购项目</Descriptions.Item>
                <Descriptions.Item label="采购包">采购包一：主设备</Descriptions.Item>
                <Descriptions.Item label="主持人">{prep.host}</Descriptions.Item>
                <Descriptions.Item label="监督人">{prep.supervisor}</Descriptions.Item>
                <Descriptions.Item label="响应单位数量">3 家</Descriptions.Item>
                <Descriptions.Item label="开启时间">2026-07-08 15:00</Descriptions.Item>
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
              <h3>响应文件解密</h3>
              <p className="tip">各响应单位使用上传时设置的解密密码解密本企业响应文件；主持人/代理仅可查看解密状态。</p>
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
                    onClick={allDecrypted ? nextStage : forceEnterBidding}
                  >
                    {allDecrypted ? '解密完成，进入唱价' : '尚有响应文件未解密，强制进入唱价'}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* 阶段4：唱价公示（唱价人/监督人使用开启准备配置名单） */}
          {currentStage === 4 && (
            <div className="stage-content">
              <h3>唱价公示</h3>
              <p className="tip">按递交文件顺序公开响应报价与工期等核心信息</p>
              <Descriptions column={2} style={{ marginBottom: 16 }}>
                <Descriptions.Item label="唱价人（主持人）">{prep.host}</Descriptions.Item>
                <Descriptions.Item label="监督人">{prep.supervisor}</Descriptions.Item>
              </Descriptions>
              <Table
                columns={bidColumns}
                dataSource={bids}
                rowKey="rank"
                pagination={false}
                style={{ width: '100%' }}
              />

              {isBidder && !bidderConfirmed && (
                <div style={{ textAlign: 'center', marginTop: 16, marginBottom: 16 }}>
                  <Alert
                    type="info"
                    showIcon
                    closable={false}
                    title="请确认以上唱价内容与您的响应文件一致，确认需签字或盖章，确认后不可修改。"
                    style={{ marginBottom: 12 }}
                  />
                  <Button type="primary" size="large" onClick={() => { setSignName(userName || ''); setConfirmMethod('seal'); setConfirmOpen(true) }}>
                    签字/盖章确认唱价内容
                  </Button>
                </div>
              )}
              {isBidder && bidderConfirmed && bidderConfirmInfo && (
                <Alert
                  type="success"
                  showIcon
                  closable={false}
                  title={`您已于 ${bidderConfirmInfo.time} 通过${bidderConfirmInfo.methodLabel}确认唱价内容（确认人：${bidderConfirmInfo.name}），确认记录已存证。`}
                  style={{ marginTop: 16, marginBottom: 16 }}
                />
              )}

              <div className="stage-action">
                <Button onClick={exportBidTable}>导出唱价一览表</Button>
                {isHost && <Button onClick={prevStage}>返回</Button>}
                {isHost && (
                  <Button type="primary" size="large" onClick={finishOpening}>
                    唱价结束
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* 阶段5：开启结束 */}
          {currentStage === 5 && (
            <div className="stage-content">
              <Result
                status="success"
                title="开启结束"
                subTitle={`开启记录已生成（主持人：${prep.host}；监督人：${prep.supervisor}），可进入评审环节`}
                extra={[
                  <Button key="export" onClick={exportBidTable}>
                    导出唱价一览表
                  </Button>,
                  canViewEvaluation && (
                    <Button key="evaluate" type="primary" onClick={goEvaluate}>
                      进入评审大厅
                    </Button>
                  ),
                  isHost && (
                    <Button key="replay" onClick={() => setCurrentStage(0)}>
                      重新演示
                    </Button>
                  ),
                  isBidder && (
                    <span key="no-eval" className="text-muted">
                      评审环节仅采购单位/代理/监督可查看
                    </span>
                  )
                ].filter(Boolean)}
              />
            </div>
          )}
        </div>

        <Modal
          title="唱价内容确认"
          open={confirmOpen}
          onCancel={() => setConfirmOpen(false)}
          onOk={submitBidderConfirm}
          okText="确认"
          cancelText="取消"
        >
          <p style={{ marginBottom: 12 }}>请核对唱价一览表内容与您的响应文件一致，选择确认方式；确认后不可修改。</p>
          <Radio.Group value={confirmMethod} onChange={(e) => setConfirmMethod(e.target.value)}>
            <Radio value="seal">电子签章确认</Radio>
            <Radio value="sign">签名确认</Radio>
          </Radio.Group>
          {confirmMethod === 'seal' && (
            <div style={{ marginTop: 12, border: '1px dashed #409EFF', borderRadius: 4, padding: '16px 12px', textAlign: 'center', color: '#409EFF' }}>
              点击「确认」即视为加盖电子签章（演示环境模拟签章存证）
            </div>
          )}
          {confirmMethod === 'sign' && (
            <Input
              style={{ marginTop: 12 }}
              value={signName}
              onChange={(e) => setSignName(e.target.value)}
              placeholder="请输入签名人姓名"
            />
          )}
        </Modal>

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
