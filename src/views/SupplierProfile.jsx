import { useState } from 'react'
import { Button, Card, Col, DatePicker, Form, Input, Row, Upload, message } from 'antd'
import dayjs from 'dayjs'

export default function SupplierProfile() {
  const [form, setForm] = useState({
    name: 'A科技有限公司',
    creditCode: '91440300MA5GXXXXXX',
    capital: '5000',
    foundDate: dayjs('2018-05-20'),
    businessScope: '计算机软硬件、电子设备的研发、销售及技术服务；系统集成；网络工程等。'
  })

  const [fileList, setFileList] = useState([
    { uid: '1', name: '营业执照.pdf', status: 'done' },
    { uid: '2', name: 'ISO9001证书.pdf', status: 'done' }
  ])

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
          <Form.Item label="资质证书">
            <Upload
              fileList={fileList}
              onChange={({ fileList: next }) => setFileList(next)}
              beforeUpload={() => false}
              multiple
            >
              <Button type="primary">上传资质</Button>
            </Upload>
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
