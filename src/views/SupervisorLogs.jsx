import { Alert, Button, Card, Table, Tag, message } from 'antd'

export default function SupervisorLogs() {
  const logs = [
    { time: '2026-07-08 14:50:12', operator: '张三', role: '招标人', action: '进入开标大厅', ip: '192.168.1.10', result: '成功' },
    { time: '2026-07-08 14:55:33', operator: 'A科技有限公司', role: '投标人', action: '在线签到', ip: '192.168.1.21', result: '成功' },
    { time: '2026-07-08 15:02:18', operator: 'A科技有限公司', role: '投标人', action: 'CA 解密投标文件', ip: '192.168.1.21', result: '成功' },
    { time: '2026-07-08 15:10:05', operator: '李四', role: '招标代理', action: '执行唱标', ip: '192.168.1.11', result: '成功' },
    { time: '2026-07-08 15:30:22', operator: '专家甲', role: '评标专家', action: '提交评分', ip: '192.168.1.31', result: '成功' }
  ]

  const exportLogs = () => {
    message.success('操作日志导出中...')
  }

  const columns = [
    { title: '操作时间', dataIndex: 'time', width: 180 },
    { title: '操作人', dataIndex: 'operator', width: 150 },
    { title: '角色', dataIndex: 'role', width: 120 },
    { title: '操作内容', dataIndex: 'action', minWidth: 250 },
    { title: 'IP 地址', dataIndex: 'ip', width: 140 },
    {
      title: '结果',
      dataIndex: 'result',
      width: 100,
      render: (result) => (
        <Tag color={result === '成功' ? 'success' : 'error'}>{result}</Tag>
      )
    }
  ]

  return (
    <div className="supervisor-logs">
      <Card
        title={
          <div className="card-header">
            <span>操作日志</span>
            <Button type="primary" onClick={exportLogs}>导出日志</Button>
          </div>
        }
      >
        <Alert
          title="本页记录开标、评标过程中的关键操作，包括签到、解密、唱标、评分、签名等行为。"
          type="info"
          showIcon
          closable={false}
          style={{ marginBottom: 20 }}
        />
        <Table
          columns={columns}
          dataSource={logs}
          rowKey={(row) => `${row.time}-${row.operator}`}
          pagination={false}
          style={{ width: '100%' }}
        />
      </Card>

      <style>{`
        .supervisor-logs {
          max-width: 1100px;
          margin: 0 auto;
        }
        .supervisor-logs .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
          width: 100%;
        }
      `}</style>
    </div>
  )
}
