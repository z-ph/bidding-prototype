import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Button, Card, Divider, Form, Input, Steps, Table, Tabs, Tag, message } from 'antd'
import StatusTag from '../components/StatusTag.jsx'

export default function SupervisorHall() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('opening')
  const [comment, setComment] = useState('')

  const openingAttendees = [
    { role: '招标人', name: '张三', status: '已签到', time: '2026-07-08 14:50' },
    { role: '招标代理', name: '李四', status: '已签到', time: '2026-07-08 14:52' },
    { role: '投标人', name: 'A科技有限公司', status: '已签到', time: '2026-07-08 14:55' },
    { role: '监督人', name: '王监督', status: '已签到', time: '2026-07-08 14:53' }
  ]

  const openingBids = [
    { name: 'A科技有限公司', price: 820, delivery: '60天', quality: '3年' },
    { name: 'B实业有限公司', price: 845, delivery: '55天', quality: '2年' },
    { name: 'C股份有限公司', price: 798, delivery: '65天', quality: '3年' }
  ]

  const evaluationExperts = [
    { name: '专家甲', field: '电子信息', status: '已签到', scoreStatus: '已提交' },
    { name: '专家乙', field: '机械设备', status: '已签到', scoreStatus: '已提交' },
    { name: '专家丙', field: '工程造价', status: '已签到', scoreStatus: '待提交' }
  ]

  const evaluationScores = [
    { name: 'C股份有限公司', business: 28, tech: 36, price: 29, total: 93, recommend: '推荐中标' },
    { name: 'A科技有限公司', business: 27, tech: 34, price: 28, total: 89, recommend: '备选' },
    { name: 'B实业有限公司', business: 26, tech: 31, price: 27, total: 84, recommend: '备选' }
  ]

  const recordAbnormal = () => {
    if (!comment.trim()) {
      message.warning('请先填写异常描述')
      return
    }
    message.warning('异常记录已保存，将同步至日志')
    setComment('')
  }

  const submitComment = () => {
    if (!comment.trim()) {
      message.warning('请先填写监督意见')
      return
    }
    message.success('监督意见已提交')
    setComment('')
  }

  const attendeeColumns = [
    { title: '角色', dataIndex: 'role' },
    { title: '姓名/企业', dataIndex: 'name' },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status) => (
        <StatusTag label={status} status={status === '已签到' ? 'completed' : 'pending'} />
      )
    },
    { title: '时间', dataIndex: 'time' }
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
    {
      title: '签到状态',
      dataIndex: 'status',
      render: (status) => (
        <StatusTag label={status} status={status === '已签到' ? 'completed' : 'pending'} />
      )
    },
    {
      title: '评分状态',
      dataIndex: 'scoreStatus',
      render: (scoreStatus) => (
        <StatusTag label={scoreStatus} status={scoreStatus === '已提交' ? 'completed' : 'processing'} />
      )
    }
  ]

  const scoreColumns = [
    { title: '投标人', dataIndex: 'name' },
    { title: '商务', dataIndex: 'business' },
    { title: '技术', dataIndex: 'tech' },
    { title: '价格', dataIndex: 'price' },
    { title: '总分', dataIndex: 'total' },
    { title: '推荐意见', dataIndex: 'recommend' }
  ]

  const tabItems = [
    {
      key: 'opening',
      label: '开标监督',
      children: (
        <>
          <Steps
            current={4}
            items={[
              { title: '签到' },
              { title: '启动' },
              { title: '解密' },
              { title: '唱标' },
              { title: '结束' }
            ]}
          />
          <h3>签到情况</h3>
          <Table
            columns={attendeeColumns}
            dataSource={openingAttendees}
            rowKey={(row) => `${row.role}-${row.name}`}
            bordered
            pagination={false}
            style={{ width: '100%' }}
          />
          <h3>唱标结果</h3>
          <Table
            columns={bidColumns}
            dataSource={openingBids}
            rowKey="name"
            bordered
            pagination={false}
            style={{ width: '100%' }}
          />
        </>
      )
    },
    {
      key: 'evaluation',
      label: '评标监督',
      children: (
        <>
          <h3>评标委员会</h3>
          <Table
            columns={expertColumns}
            dataSource={evaluationExperts}
            rowKey="name"
            bordered
            pagination={false}
            style={{ width: '100%' }}
          />
          <h3>评分汇总</h3>
          <Table
            columns={scoreColumns}
            dataSource={evaluationScores}
            rowKey="name"
            bordered
            pagination={false}
            style={{ width: '100%' }}
          />
        </>
      )
    }
  ]

  return (
    <div className="supervisor-hall">
      <Card
        title={
          <div className="card-header">
            <span>监督大厅</span>
            <div className="header-tags">
              <Tag color="error" style={{ fontSize: 14, padding: '4px 12px' }}>监督模式：只读</Tag>
              <Tag>监督人员：王监督</Tag>
            </div>
          </div>
        }
      >
        <Alert
          message="您当前以监督人员身份进入，可查看开标、评标全过程及操作日志，但不可修改任何业务数据。"
          type="info"
          showIcon
          closable={false}
          style={{ marginBottom: 20 }}
        />

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
              <Button onClick={() => navigate('/admin/supervisor-logs')}>查看完整操作日志</Button>
            </div>
          </Card>
        </div>
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
