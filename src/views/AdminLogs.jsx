import { useState } from 'react'
import { Alert, Button, Card, Col, Input, Row, Select, Table, Tag, message } from 'antd'

export default function AdminLogs() {
  const [search, setSearch] = useState({ operator: '', type: undefined })
  const [logs] = useState([
    { time: '2026-07-08 10:00:00', type: '系统操作', operator: 'admin', action: '登录系统', ip: '192.168.1.1', result: '成功' },
    { time: '2026-07-08 10:05:22', type: '关键业务', operator: '张三', action: '创建采购需求', ip: '192.168.1.10', result: '成功' },
    { time: '2026-07-08 10:30:11', type: '短信发送', operator: '系统', action: '向专家甲发送评标通知短信', ip: '-', result: '成功' },
    { time: '2026-07-08 11:00:45', type: '关键业务', operator: '李四', action: '发布招标公告', ip: '192.168.1.11', result: '成功' }
  ])

  const load = () => message.success('查询日志')
  const exportLogs = () => message.success('导出系统日志')

  const columns = [
    { title: '时间', dataIndex: 'time', width: 180 },
    { title: '类型', dataIndex: 'type', width: 120 },
    { title: '操作人', dataIndex: 'operator', width: 150 },
    { title: '操作内容', dataIndex: 'action', minWidth: 300 },
    { title: 'IP', dataIndex: 'ip', width: 140 },
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
    <div className="admin-logs">
      <Card
        title={
          <div className="card-header">
            <span>系统日志审计</span>
            <Button type="primary" onClick={exportLogs}>导出日志</Button>
          </div>
        }
      >
        <Alert
          message="记录系统操作、短信/邮件发送、关键业务操作日志，满足合规审计要求。"
          type="info"
          showIcon
          closable={false}
          style={{ marginBottom: 20 }}
        />
        <Row gutter={20} style={{ marginBottom: 20 }}>
          <Col span={6}>
            <Input
              placeholder="操作人"
              allowClear
              value={search.operator}
              onChange={(e) => setSearch((prev) => ({ ...prev, operator: e.target.value }))}
            />
          </Col>
          <Col span={6}>
            <Select
              placeholder="日志类型"
              allowClear
              style={{ width: '100%' }}
              value={search.type}
              onChange={(value) => setSearch((prev) => ({ ...prev, type: value }))}
              options={[
                { label: '系统操作', value: 'system' },
                { label: '短信发送', value: 'sms' },
                { label: '邮件发送', value: 'email' },
                { label: '关键业务', value: 'business' }
              ]}
            />
          </Col>
          <Col span={6}>
            <Button type="primary" onClick={load}>查询</Button>
          </Col>
        </Row>
        <Table
          columns={columns}
          dataSource={logs}
          rowKey={(row) => `${row.time}-${row.operator}`}
          pagination={false}
          style={{ width: '100%' }}
        />
      </Card>

      <style>{`
        .admin-logs {
          max-width: 1200px;
          margin: 0 auto;
        }
        .admin-logs .card-header {
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
