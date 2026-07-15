import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Alert, Button, Card, Col, DatePicker, Form, Input, Row, Steps, Tag, Upload, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'

export default function ContractArchive() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    code: '',
    amount: '',
    signDate: null,
    endDate: null,
    remark: ''
  })

  const [fileList, setFileList] = useState([])

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const archive = () => {
    message.success('合同归档完成，项目已结束')
    navigate('/admin/projects')
  }

  return (
    <div className="contract-archive">
      <Card
        title={
          <div className="card-header">
            <span>合同归档</span>
            <Tag color="blue">项目：XX市轨道交通设备采购项目</Tag>
          </div>
        }
      >
        <Steps
          current={5}
          style={{ marginBottom: 24 }}
          items={[
            { title: '评标结束' },
            { title: '候选人公示' },
            { title: '确认中标人' },
            { title: '发送通知书' },
            { title: '合同归档' }
          ]}
        />
        <Alert
          message="上传签订后的中标合同，填写合同信息，完成项目全流程归档。归档后项目状态变更为“已完成”。"
          type="success"
          showIcon
          closable={false}
          style={{ marginBottom: 20 }}
        />
        <Form layout="horizontal" labelCol={{ flex: '120px' }}>
          <Row gutter={20}>
            <Col span={12}>
              <Form.Item label="合同编号" required>
                <Input
                  placeholder="请输入合同编号"
                  value={form.code}
                  onChange={(e) => updateField('code', e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="合同金额" required>
                <Input
                  placeholder="请输入合同金额"
                  addonAfter="万元"
                  value={form.amount}
                  onChange={(e) => updateField('amount', e.target.value)}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={20}>
            <Col span={12}>
              <Form.Item label="签订日期" required>
                <DatePicker
                  style={{ width: '100%' }}
                  value={form.signDate}
                  onChange={(value) => updateField('signDate', value)}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="履约截止日期" required>
                <DatePicker
                  style={{ width: '100%' }}
                  value={form.endDate}
                  onChange={(value) => updateField('endDate', value)}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="合同文件" required>
            <Upload.Dragger
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
              multiple
              style={{ width: '100%' }}
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined style={{ fontSize: 40 }} />
              </p>
              <p className="ant-upload-text">
                拖拽合同文件到此处或 <em>点击上传</em>
              </p>
            </Upload.Dragger>
          </Form.Item>
          <Form.Item label="备注">
            <Input.TextArea
              rows={3}
              placeholder="其他需要归档说明的内容"
              value={form.remark}
              onChange={(e) => updateField('remark', e.target.value)}
            />
          </Form.Item>
        </Form>
        <div className="actions">
          <Button type="primary" size="large" onClick={archive}>
            完成归档
          </Button>
          <Button size="large" onClick={() => navigate('/admin/projects')}>
            返回项目列表
          </Button>
        </div>
      </Card>

      <style>{`
        .contract-archive {
          max-width: 1000px;
          margin: 0 auto;
        }
        .contract-archive .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
        }
        .contract-archive .actions {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-top: 24px;
        }
      `}</style>
    </div>
  )
}
