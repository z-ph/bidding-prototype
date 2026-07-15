import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Alert, Button, Card, Form, Input, Steps, Tag, message } from 'antd'
import { CheckOutlined } from '@ant-design/icons'

export default function AwardNotice() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: 'XX市轨道交通设备采购项目中标通知书',
    bidder: 'C股份有限公司',
    amount: '798 万元',
    content: '贵司参与的 XX市轨道交通设备采购项目 经评标委员会评审、招标人确认，被确定为中标人。请于收到通知书后 30 日内与招标人签订合同。',
    signed: false
  })

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const sign = () => {
    message.success('电子签章成功')
    updateField('signed', true)
  }

  const preview = () => {
    message.success('打开中标通知书预览')
  }

  const send = () => {
    message.success('中标通知书已发送给中标人')
    navigate('/admin/contract-archive')
  }

  return (
    <div className="award-notice">
      <Card
        title={
          <div className="card-header">
            <span>发送中标通知书</span>
            <Tag color="success">中标人：C股份有限公司</Tag>
          </div>
        }
      >
        <Steps
          current={4}
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
          message="根据模板生成中标通知书，支持在线编辑、签章后发送给中标人。发送后中标人可在工作台查看。"
          type="info"
          showIcon
          closable={false}
          style={{ marginBottom: 20 }}
        />
        <Form layout="horizontal" labelCol={{ flex: '120px' }}>
          <Form.Item label="通知书标题" required>
            <Input
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
            />
          </Form.Item>
          <Form.Item label="中标人" required>
            <Input value={form.bidder} disabled />
          </Form.Item>
          <Form.Item label="中标金额" required>
            <Input
              value={form.amount}
              onChange={(e) => updateField('amount', e.target.value)}
            />
          </Form.Item>
          <Form.Item label="通知书正文" required>
            <Input.TextArea
              rows={10}
              value={form.content}
              onChange={(e) => updateField('content', e.target.value)}
            />
          </Form.Item>
          <Form.Item label="电子签章">
            <Button type="primary" ghost onClick={sign}>
              点击进行电子签章
            </Button>
            {form.signed && (
              <span style={{ color: '#67C23A', marginLeft: 12 }}>
                <CheckOutlined /> 已签章
              </span>
            )}
          </Form.Item>
        </Form>
        <div className="actions">
          <Button type="primary" size="large" onClick={send}>
            发送中标通知书
          </Button>
          <Button size="large" onClick={preview}>
            预览
          </Button>
          <Button size="large" onClick={() => navigate('/admin/contract-archive')}>
            下一步：合同归档
          </Button>
        </div>
      </Card>

      <style>{`
        .award-notice {
          max-width: 1000px;
          margin: 0 auto;
        }
        .award-notice .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
        }
        .award-notice .actions {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-top: 24px;
        }
      `}</style>
    </div>
  )
}
