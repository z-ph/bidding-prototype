import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Alert, Button, Card, Form, Input, Radio, Steps, Table, Tag, message, Modal } from 'antd'

export default function AwardConfirm() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState('')

  const candidates = [
    { rank: 1, name: 'C股份有限公司', total: 93, price: 798, recommend: '综合得分最高，推荐为第一中标候选人' },
    { rank: 2, name: 'A科技有限公司', total: 89, price: 820, recommend: '推荐为第二中标候选人' },
    { rank: 3, name: 'B实业有限公司', total: 84, price: 845, recommend: '推荐为第三中标候选人' }
  ]

  const [form, setForm] = useState({
    opinion: '经公示无异议，确定第一中标候选人 C股份有限公司 为中标人。'
  })

  const confirm = () => {
    if (!selected) {
      message.warning('请先选择中标人')
      return
    }
    Modal.confirm({
      title: '确认中标人',
      content: `确定将 ${selected} 确认为本项目中标人吗？确认后将进入中标结果公示环节。`,
      okText: '确认中标',
      cancelText: '取消',
      onOk: () => {
        message.success(`已确认中标人：${selected}`)
        navigate({ to: '/admin/award-notice' })
      }
    })
  }

  const columns = [
    { title: '排名', dataIndex: 'rank', width: 80 },
    { title: '投标人', dataIndex: 'name', minWidth: 200 },
    { title: '综合得分', dataIndex: 'total', width: 120 },
    { title: '投标报价（万元）', dataIndex: 'price', width: 160 },
    { title: '评标委员会推荐意见', dataIndex: 'recommend', minWidth: 200 },
    {
      title: '选择',
      width: 120,
      render: (_, row) => (
        <Radio
          checked={selected === row.name}
          onChange={() => setSelected(row.name)}
        >
          选择
        </Radio>
      )
    }
  ]

  return (
    <div className="award-confirm">
      <Card
        title={
          <div className="card-header">
            <span>确认中标人</span>
            <Tag color="warning">项目：XX市轨道交通设备采购项目</Tag>
          </div>
        }
      >
        <Steps
          current={2}
          style={{ marginBottom: 24 }}
          items={[
            { title: '评标结束' },
            { title: '候选人公示' },
            { title: '确认中标人' },
            { title: '结果公示' },
            { title: '发送通知书' }
          ]}
        />
        <Alert
          title="公示期结束后，招标人在此处确认最终中标人。确认后将进入中标结果公示和中标通知书发送环节。"
          type="info"
          showIcon
          closable={false}
          style={{ marginBottom: 20 }}
        />
        <h3>中标候选人排名</h3>
        <Table
          columns={columns}
          dataSource={candidates}
          rowKey="name"
          bordered
          pagination={false}
          style={{ width: '100%' }}
        />
        <Form layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item label="定标意见">
            <Input.TextArea
              rows={4}
              placeholder="请填写定标意见..."
              value={form.opinion}
              onChange={(e) => setForm((prev) => ({ ...prev, opinion: e.target.value }))}
            />
          </Form.Item>
        </Form>
        <div className="actions">
          <Button type="primary" size="large" onClick={confirm}>
            确认中标人
          </Button>
          <Button size="large" onClick={() => navigate({ to: '/admin/award-notice' })}>
            下一步：发送中标通知书
          </Button>
        </div>
      </Card>

      <style>{`
        .award-confirm {
          max-width: 1100px;
          margin: 0 auto;
        }
        .award-confirm .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
        }
        .award-confirm .actions {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-top: 24px;
        }
      `}</style>
    </div>
  )
}
