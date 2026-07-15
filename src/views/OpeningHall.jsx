import { useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Alert, Button, Card, Descriptions, Result, Steps, Table, Tag, Timeline, message, Modal } from 'antd'
import { useRole } from '../hooks/useRole.js'
import StatusTag from '../components/StatusTag.jsx'

export default function OpeningHall() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false })
  const projectId = searchParams.projectId || '1'
  const { role, roleName, userName } = useRole()

  const [currentStage, setCurrentStage] = useState(0)
  const [operationRecords, setOperationRecords] = useState([])
  const [deadline] = useState('2026-07-08 15:00')

  // 主持人：招标人/招标代理可操作开标流程；监督人员只读；投标人只能签到/解密自己
  const isHost = ['tenderee', 'agent'].includes(role)
  const isBidder = role === 'bidder'
  const roleTagColor = isHost ? 'warning' : 'default'

  const [attendees, setAttendees] = useState([
    { role: '招标人', name: '张三', status: '未签到', time: '-', self: role === 'tenderee' && userName === '张三' },
    { role: '招标代理', name: '李四', status: '未签到', time: '-', self: role === 'agent' && userName === '李四' },
    { role: '投标人', name: 'A科技有限公司', status: '未签到', time: '-', self: role === 'bidder' && userName === 'A科技有限公司' },
    { role: '投标人', name: 'B实业有限公司', status: '未签到', time: '-', self: false },
    { role: '投标人', name: 'C股份有限公司', status: '未签到', time: '-', self: false },
    { role: '监督人', name: '王监督', status: '未签到', time: '-', self: role === 'supervisor' && userName === '王监督' }
  ])

  const [bidders, setBidders] = useState([
    { name: 'A科技有限公司', files: 3, status: '未解密', time: '-' },
    { name: 'B实业有限公司', files: 3, status: '未解密', time: '-' },
    { name: 'C股份有限公司', files: 3, status: '未解密', time: '-' }
  ])

  const bids = [
    { rank: 1, name: 'A科技有限公司', price: 820, delivery: '60天', quality: '3年' },
    { rank: 2, name: 'B实业有限公司', price: 845, delivery: '55天', quality: '2年' },
    { rank: 3, name: 'C股份有限公司', price: 798, delivery: '65天', quality: '3年' }
  ]

  const allCheckedIn = attendees.every((a) => a.status === '已签到')
  const missingAttendees = attendees.filter((a) => a.status !== '已签到').map((a) => `${a.role}：${a.name}`)
  const allDecrypted = bidders.every((b) => b.status === '已解密')

  const stageLabels = [
    '身份核验',
    '开标启动',
    '文件解密',
    '唱标公示',
    '开标结束'
  ]

  const stageActions = [
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
    setAttendees((prev) =>
      prev.map((a) => (a.name === row.name ? { ...a, status: '已签到', time } : a))
    )
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
      const next = Math.min(prev + 1, 4)
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
    addOperationRecord('开标结束', '唱标结束，开标记录已生成，可进入评标大厅')
    message.success('唱标结束，开标记录已生成，请进入评标大厅')
  }

  const refresh = () => {
    message.success('状态已刷新')
  }

  const goEvaluate = () => {
    navigate({ to: '/admin/evaluation-hall' })
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
              <Tag color={currentStage === 4 ? 'success' : 'processing'}>
                {currentStage === 4 ? '开标结束' : '进行中'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="下一步">
              {currentStage === 4 ? (
                <>
                  <span style={{ marginRight: 12 }}>进入评标大厅</span>
                  <Button type="primary" size="small" onClick={goEvaluate}>去评标</Button>
                </>
              ) : (
                <span>{stageActions[currentStage]}</span>
              )}
            </Descriptions.Item>
          </Descriptions>
          {currentStage < 4 && !allCheckedIn && currentStage === 0 && (
            <Alert
              title={`阻断原因：尚有 ${missingAttendees.length} 人未签到，所有人签到后方可进入开标启动阶段。`}
              type="warning"
              showIcon
              closable={false}
              style={{ marginTop: 12 }}
            />
          )}
          {currentStage === 2 && !allDecrypted && (
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
          {/* 阶段1：身份核验 */}
          {currentStage === 0 && (
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
                dataSource={attendees}
                rowKey="name"
                pagination={false}
                style={{ width: '100%' }}
              />
              <div className="stage-action">
                {isHost && (
                  <Button type="primary" size="large" onClick={enterOpening}>
                    {allCheckedIn ? '所有人签到完成，进入开标' : `尚有 ${missingAttendees.length} 人未签到，确认进入开标`}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* 阶段2：开标启动 */}
          {currentStage === 1 && (
            <div className="stage-content">
              <h3>开标启动</h3>
              <p className="tip">招标人宣读开标纪律并确认投标人名单</p>
              <Descriptions column={2} bordered>
                <Descriptions.Item label="项目名称">XX市轨道交通设备采购项目</Descriptions.Item>
                <Descriptions.Item label="标段">标段一：主设备</Descriptions.Item>
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
          {currentStage === 2 && (
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

          {/* 阶段4：唱标公示 */}
          {currentStage === 3 && (
            <div className="stage-content">
              <h3>唱标公示</h3>
              <p className="tip">按递交文件顺序公开投标报价与工期等核心信息</p>
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
          {currentStage === 4 && (
            <div className="stage-content">
              <Result
                status="success"
                title="开标结束"
                subTitle="开标记录已生成，可进入评标环节"
                extra={[
                  isHost && (
                    <Button key="evaluate" type="primary" onClick={goEvaluate}>
                      进入评标大厅
                    </Button>
                  ),
                  isHost && (
                    <Button key="replay" onClick={() => setCurrentStage(0)}>
                      重新演示
                    </Button>
                  )
                ]}
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
