import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Alert, Button, Card, Col, Form, Input, Row, Steps, Table, Tag, message } from 'antd'
import { InfoCircleFilled } from '@ant-design/icons'

export default function BidQuote() {
  const navigate = useNavigate()

  const [quote, setQuote] = useState({
    totalPrice: '',
    delivery: '',
    quality: '',
    payment: ''
  })

  const [items, setItems] = useState([
    { name: '主设备 A 型', spec: '详见技术参数', quantity: 10, unit: '台', price: '' },
    { name: '辅材 B 型', spec: '详见技术参数', quantity: 50, unit: '套', price: '' }
  ])

  const updateQuote = (key, value) => {
    setQuote((prev) => ({ ...prev, [key]: value }))
  }

  const updatePrice = (index, value) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, price: value } : item)))
  }

  const saveQuote = () => {
    message.success('报价已保存，请继续上传投标文件')
  }

  const columns = [
    { title: '分项名称', dataIndex: 'name', key: 'name' },
    { title: '规格', dataIndex: 'spec', key: 'spec' },
    { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 120 },
    { title: '单位', dataIndex: 'unit', key: 'unit', width: 100 },
    {
      title: '单价（元）',
      key: 'price',
      width: 180,
      render: (_, row, index) => (
        <Input
          value={row.price}
          onChange={(e) => updatePrice(index, e.target.value)}
          placeholder="单价"
        />
      )
    },
    {
      title: '小计（元）',
      key: 'subtotal',
      width: 150,
      render: (_, row) => row.quantity * (Number(row.price) || 0)
    }
  ]

  return (
    <div className="bid-quote">
      <Card
        title={
          <div className="card-header">
            <span>在线报价</span>
            <Tag color="error">距投标截止：2 天 5 小时</Tag>
          </div>
        }
      >
        <Steps
          size="small"
          current={3}
          style={{ marginBottom: 24 }}
          items={['报名通过', '下载文件', '编制标书', '填写报价', '上传并加密'].map((title) => ({ title }))}
        />
        <Alert
          title="请按招标文件要求填写开标一览表和分项报价，提交后投标截止前可修改。"
          type="warning"
          showIcon
          closable={false}
          style={{ marginBottom: 20 }}
        />

        <h3>开标一览表</h3>
        <Form labelCol={{ flex: '0 0 140px' }} wrapperCol={{ flex: 'auto' }} className="quote-form">
          <Row gutter={20}>
            <Col span={12}>
              <Form.Item label="投标报价（万元）" required>
                <Input
                  value={quote.totalPrice}
                  onChange={(e) => updateQuote('totalPrice', e.target.value)}
                  placeholder="请输入总报价"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="交货期" required>
                <Input
                  value={quote.delivery}
                  onChange={(e) => updateQuote('delivery', e.target.value)}
                  placeholder="例如：60天"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={20}>
            <Col span={12}>
              <Form.Item label="质保期" required>
                <Input
                  value={quote.quality}
                  onChange={(e) => updateQuote('quality', e.target.value)}
                  placeholder="例如：3年"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="付款方式" required>
                <Input
                  value={quote.payment}
                  onChange={(e) => updateQuote('payment', e.target.value)}
                  placeholder="例如：3-6-1"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>

        <h3>分项报价</h3>
        <Table
          columns={columns}
          dataSource={items}
          rowKey="name"
          pagination={false}
          style={{ width: '100%', marginBottom: 20 }}
        />

        <div className="quote-tips">
          <p><InfoCircleFilled /> 报价将用于开标唱标，请确保与上传的报价文件一致。</p>
        </div>

        <div className="actions">
          <Button type="primary" size="large" onClick={saveQuote}>保存报价</Button>
          <Button size="large" onClick={() => navigate({ to: '/admin/bid-upload' })}>下一步：上传投标文件</Button>
        </div>
      </Card>

      <style>{`
        .bid-quote {
          max-width: 1100px;
          margin: 0 auto;
        }
        .bid-quote .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
        }
        .bid-quote .quote-form {
          margin: 20px 0;
        }
        .bid-quote .quote-tips {
          color: #E6A23C;
          margin-bottom: 20px;
        }
        .bid-quote .actions {
          display: flex;
          justify-content: center;
          gap: 16px;
        }
      `}</style>
    </div>
  )
}
