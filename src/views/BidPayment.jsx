import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Col, Descriptions, Form, Input, Radio, Row, Tag, Upload, message } from 'antd'

export default function BidPayment() {
  const navigate = useNavigate()

  const [feeType, setFeeType] = useState('doc')
  const [amount, setAmount] = useState('')
  const [payMode, setPayMode] = useState('online')
  const [fileList, setFileList] = useState([])

  const submit = () => {
    message.success('缴纳申请已提交，等待代理机构审核')
    navigate('/admin/bidder-projects')
  }

  return (
    <div className="bid-payment">
      <Card
        title={
          <div className="card-header">
            <span>费用缴纳</span>
            <Tag color="warning">项目：XX市轨道交通设备采购项目</Tag>
          </div>
        }
      >
        <Row gutter={20}>
          <Col span={16}>
            <Form labelCol={{ flex: '0 0 120px' }} wrapperCol={{ flex: 'auto' }}>
              <Form.Item label="缴纳项目">
                <Radio.Group value={feeType} onChange={(e) => setFeeType(e.target.value)}>
                  <Radio value="doc">招标文件费</Radio>
                  <Radio value="deposit">投标保证金</Radio>
                  <Radio value="platform">平台使用费</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="缴纳金额">
                <Input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="请输入金额"
                  addonAfter="元"
                />
              </Form.Item>
              <Form.Item label="缴纳方式">
                <Radio.Group value={payMode} onChange={(e) => setPayMode(e.target.value)}>
                  <Radio value="online">在线支付</Radio>
                  <Radio value="offline">线下转账</Radio>
                </Radio.Group>
              </Form.Item>
              {payMode === 'offline' && (
                <Form.Item label="转账凭证">
                  <Upload
                    fileList={fileList}
                    onChange={({ fileList: next }) => setFileList(next)}
                    beforeUpload={() => false}
                  >
                    <Button type="primary">上传凭证</Button>
                  </Upload>
                </Form.Item>
              )}
              <Form.Item>
                <Button type="primary" onClick={submit}>提交缴纳</Button>
                <Button style={{ marginLeft: 8 }} onClick={() => navigate('/admin/bidder-invoices')}>
                  申请发票
                </Button>
              </Form.Item>
            </Form>
          </Col>
          <Col span={8}>
            <Card className="fee-summary">
              <h4>费用明细</h4>
              <Descriptions column={1} bordered>
                <Descriptions.Item label="招标文件费">500 元</Descriptions.Item>
                <Descriptions.Item label="投标保证金">50,000 元</Descriptions.Item>
                <Descriptions.Item label="平台使用费">0 元</Descriptions.Item>
                <Descriptions.Item label="已缴纳">0 元</Descriptions.Item>
                <Descriptions.Item label="待缴纳">50,500 元</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>
      </Card>

      <style>{`
        .bid-payment {
          max-width: 1100px;
          margin: 0 auto;
        }
        .bid-payment .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
        }
        .bid-payment .fee-summary h4 {
          margin-bottom: 16px;
        }
      `}</style>
    </div>
  )
}
