import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Button, Card, Descriptions, Result, Steps, Table, Tag, message } from 'antd'
import { useRole } from '../hooks/useRole.js'
import StatusTag from '../components/StatusTag.jsx'

export default function OpeningHall() {
  const navigate = useNavigate()
  const { role, roleName } = useRole()

  const [currentStage, setCurrentStage] = useState(0)

  // 主持人：招标人/招标代理可操作开标流程；监督人员只读；投标人只能解密
  const canOperate = ['tenderee', 'agent'].includes(role)
  const roleTagColor = canOperate ? 'warning' : 'default'

  const [attendees, setAttendees] = useState([
    { role: '招标人', name: '张三', status: '已签到', time: '2026-07-08 14:50' },
    { role: '招标代理', name: '李四', status: '已签到', time: '2026-07-08 14:52' },
    { role: '投标人', name: 'A科技有限公司', status: '未签到', time: '-' },
    { role: '投标人', name: 'B实业有限公司', status: '未签到', time: '-' },
    { role: '监督人', name: '王监督', status: '未签到', time: '-' }
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
  const allDecrypted = bidders.every((b) => b.status === '已解密')

  function canDecrypt(row) {
    // 演示环境：投标人只能解密自己的；主持人可代演示解密
    if (role === 'bidder') {
      return row.name === 'A科技有限公司'
    }
    return canOperate
  }

  const checkIn = (row) => {
    const time = new Date().toLocaleString()
    setAttendees((prev) =>
      prev.map((a) => (a.name === row.name ? { ...a, status: '已签到', time } : a))
    )
    message.success(`${row.name} 签到成功`)
  }

  const decrypt = (row) => {
    const time = new Date().toLocaleString()
    setBidders((prev) =>
      prev.map((b) => (b.name === row.name ? { ...b, status: '已解密', time } : b))
    )
    message.success(`${row.name} 投标文件解密成功`)
  }

  const nextStage = () => {
    setCurrentStage((prev) => Math.min(prev + 1, 4))
  }

  const prevStage = () => {
    setCurrentStage((prev) => Math.max(prev - 1, 0))
  }

  const finishOpening = () => {
    nextStage()
    message.success('唱标结束，开标记录已生成')
  }

  const refresh = () => {
    message.success('状态已刷新')
  }

  const goEvaluate = () => {
    navigate('/admin/evaluation-hall')
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
    ...(canOperate
      ? [
          {
            title: '操作',
            width: 120,
            render: (_, row) =>
              row.status !== '已签到' ? (
                <Button type="primary" size="small" onClick={() => checkIn(row)}>
                  签到
                </Button>
              ) : null
          }
        ]
      : [])
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
              <p className="subtitle">XX市轨道交通设备采购项目 · 标段一：主设备</p>
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

        <div className="stage-panel">
          {/* 阶段1：身份核验 */}
          {currentStage === 0 && (
            <div className="stage-content">
              <h3>在线签到</h3>
              <p className="tip">请插入 CA 证书完成身份核验</p>
              {!canOperate && (
                <Alert
                  type="info"
                  showIcon
                  closable={false}
                  message={`您当前以 ${roleName} 身份进入，仅可查看开标过程。`}
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
                {canOperate && (
                  <Button type="primary" size="large" disabled={!allCheckedIn} onClick={nextStage}>
                    {allCheckedIn ? '所有人签到完成，进入开标' : '尚有人员未签到'}
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
                {canOperate && <Button onClick={prevStage}>返回</Button>}
                {canOperate && (
                  <Button type="primary" size="large" onClick={nextStage}>
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
              <p className="tip">各投标人使用各自 CA 私钥解密投标文件；解密失败可视为废标</p>
              <Table
                columns={bidderColumns}
                dataSource={bidders}
                rowKey="name"
                pagination={false}
                style={{ width: '100%' }}
              />
              <div className="stage-action">
                {canOperate && <Button onClick={prevStage}>返回</Button>}
                {canOperate && (
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
                {canOperate && <Button onClick={prevStage}>返回</Button>}
                {canOperate && (
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
                  canOperate && (
                    <Button key="evaluate" type="primary" onClick={goEvaluate}>
                      进入评标大厅
                    </Button>
                  ),
                  canOperate && (
                    <Button key="replay" onClick={() => setCurrentStage(0)}>
                      重新演示
                    </Button>
                  )
                ]}
              />
            </div>
          )}
        </div>
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
