import { useState } from 'react'
import { Button, Card, Col, Form, Input, Row, Select, message } from 'antd'

export default function ExpertProfile() {
  const [form, setForm] = useState({
    name: '专家甲',
    idCard: '11010119800101XXXX',
    field: '电子信息',
    title: '高级工程师',
    company: 'XX研究院',
    avoidCompanies: []
  })

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const saveProfile = () => {
    message.success('专家信息已保存')
  }

  return (
    <div className="expert-profile">
      <Card
        title={
          <div className="card-header">
            <span>专家库 / 个人信息</span>
            <Button type="primary" onClick={saveProfile}>保存</Button>
          </div>
        }
      >
        <Form labelCol={{ flex: '0 0 120px' }} wrapperCol={{ flex: 'auto' }}>
          <Row gutter={20}>
            <Col span={12}>
              <Form.Item label="专家姓名">
                <Input
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="身份证号">
                <Input
                  value={form.idCard}
                  onChange={(e) => updateField('idCard', e.target.value)}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={20}>
            <Col span={12}>
              <Form.Item label="专业领域">
                <Select
                  style={{ width: '100%' }}
                  value={form.field}
                  onChange={(value) => updateField('field', value)}
                  options={[
                    { label: '电子信息', value: '电子信息' },
                    { label: '机械设备', value: '机械设备' },
                    { label: '工程造价', value: '工程造价' }
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="职称">
                <Input
                  value={form.title}
                  onChange={(e) => updateField('title', e.target.value)}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="工作单位">
            <Input
              value={form.company}
              onChange={(e) => updateField('company', e.target.value)}
            />
          </Form.Item>
          <Form.Item label="回避单位">
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              value={form.avoidCompanies}
              onChange={(value) => updateField('avoidCompanies', value)}
              options={[
                { label: 'A科技有限公司', value: 'A科技有限公司' },
                { label: 'B实业有限公司', value: 'B实业有限公司' }
              ]}
            />
          </Form.Item>
        </Form>
      </Card>

      <style>{`
        .expert-profile {
          max-width: 1000px;
          margin: 0 auto;
        }
        .expert-profile .card-header {
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
