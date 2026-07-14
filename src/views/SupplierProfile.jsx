import { useState } from 'react'
import { Button, Card, Col, DatePicker, Form, Input, Row, Upload, message, Tag } from 'antd'
import dayjs from 'dayjs'

const qualificationTypes = [
  { key: '营业执照', label: '营业执照' },
  { key: 'ISO9001认证', label: 'ISO9001认证' },
  { key: '安全生产许可证', label: '安全生产许可证' },
  { key: '特定行业资质', label: '特定行业资质' }
]

export default function SupplierProfile() {
  const [form, setForm] = useState({
    name: 'A科技有限公司',
    creditCode: '91440300MA5GXXXXXX',
    capital: '5000',
    foundDate: dayjs('2018-05-20'),
    businessScope: '计算机软硬件、电子设备的研发、销售及技术服务；系统集成；网络工程等。'
  })

  const [qualificationFiles, setQualificationFiles] = useState({
    营业执照: [{ uid: '1', name: '营业执照.pdf', status: 'done' }],
    ISO9001认证: [{ uid: '2', name: 'ISO9001证书.pdf', status: 'done' }]
  })

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const saveProfile = () => {
    message.success('企业档案已保存')
  }

  return (
    <div className="supplier-profile">
      <Card
        title={
          <div className="card-header">
            <span>企业档案与资质</span>
            <Button type="primary" onClick={saveProfile}>保存</Button>
          </div>
        }
      >
        <Form labelCol={{ flex: '0 0 140px' }} wrapperCol={{ flex: 'auto' }}>
          <Row gutter={20}>
            <Col span={12}>
              <Form.Item label="企业名称">
                <Input value={form.name} disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="统一社会信用代码">
                <Input
                  value={form.creditCode}
                  onChange={(e) => updateField('creditCode', e.target.value)}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={20}>
            <Col span={12}>
              <Form.Item label="注册资本（万元）">
                <Input
                  value={form.capital}
                  onChange={(e) => updateField('capital', e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="成立日期">
                <DatePicker
                  style={{ width: '100%' }}
                  value={form.foundDate}
                  onChange={(value) => updateField('foundDate', value)}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="经营范围">
            <Input.TextArea
              rows={3}
              value={form.businessScope}
              onChange={(e) => updateField('businessScope', e.target.value)}
            />
          </Form.Item>
          <Form.Item label="资质文件">
            <div style={{ marginBottom: 12 }}>
              <Tag color="blue">按资质类型上传</Tag>
              <span style={{ color: '#666', marginLeft: 8 }}>报名时将按项目要求自动检测是否齐全</span>
            </div>
            <Row gutter={[20, 20]}>
              {qualificationTypes.map((q) => (
                <Col span={12} key={q.key}>
                  <Card size="small" title={q.label}>
                    <Upload
                      fileList={qualificationFiles[q.key] || []}
                      onChange={({ fileList: next }) => setQualificationFiles((prev) => ({ ...prev, [q.key]: next }))}
                      beforeUpload={() => false}
                      multiple={false}
                    >
                      <Button type="primary">上传 {q.label}</Button>
                    </Upload>
                  </Card>
                </Col>
              ))}
            </Row>
          </Form.Item>
        </Form>
      </Card>

      <style>{`
        .supplier-profile {
          max-width: 1000px;
          margin: 0 auto;
        }
        .supplier-profile .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
        }
      `}</style>
    </div>
  )
}
