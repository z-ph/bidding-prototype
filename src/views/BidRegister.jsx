import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Button, Card, Checkbox, Form, Input, Steps, Tag, Upload, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'

export default function BidRegister() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [fileList, setFileList] = useState([])

  const validatePhone = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('请输入联系电话'))
    }
    const phoneReg = /^1[3-9]\d{9}$/
    const telReg = /^0\d{2,3}-?\d{7,8}$/
    if (!phoneReg.test(value) && !telReg.test(value)) {
      return Promise.reject(new Error('请输入有效的手机号或座机号'))
    }
    return Promise.resolve()
  }

  const validateEmail = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('请输入电子邮箱'))
    }
    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailReg.test(value)) {
      return Promise.reject(new Error('请输入有效的电子邮箱'))
    }
    return Promise.resolve()
  }

  const rules = {
    packages: [{ required: true, type: 'array', message: '请至少选择一个标段' }],
    contact: [{ required: true, message: '请输入联系人姓名' }],
    phone: [{ required: true, validator: validatePhone }],
    email: [{ required: true, validator: validateEmail }]
  }

  const submit = async () => {
    const values = await form.validateFields().catch(() => null)
    if (!values) return
    if (fileList.length === 0) {
      message.warning('请上传资质文件')
      return
    }
    message.success('报名申请已提交，状态：待审核')
    navigate('/admin/bidder-projects')
  }

  return (
    <div className="bid-register">
      <Card
        title={
          <div className="card-header">
            <span>项目报名</span>
            <Tag color="blue">项目：XX市轨道交通设备采购项目</Tag>
          </div>
        }
      >
        <Steps
          size="small"
          current={0}
          style={{ marginBottom: 20 }}
          items={['提交报名', '资质审核', '报名成功'].map((title) => ({ title }))}
        />

        <Alert
          message="请确认贵司符合招标公告中的资格要求，提交后将进入招标方审核。"
          type="info"
          showIcon
          closable={false}
          style={{ marginBottom: 20 }}
        />

        <Form
          form={form}
          initialValues={{ packages: ['B1'] }}
          labelCol={{ flex: '0 0 140px' }}
          wrapperCol={{ flex: 'auto' }}
          className="register-form"
        >
          <Form.Item label="报名标段" name="packages" rules={rules.packages}>
            <Checkbox.Group>
              <Checkbox value="B1">第一标段：主设备</Checkbox>
              <Checkbox value="B2">第二标段：辅材</Checkbox>
            </Checkbox.Group>
          </Form.Item>
          <Form.Item label="联系人" name="contact" rules={rules.contact}>
            <Input placeholder="请输入联系人姓名" />
          </Form.Item>
          <Form.Item label="联系电话" name="phone" rules={rules.phone}>
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          <Form.Item label="电子邮箱" name="email" rules={rules.email}>
            <Input placeholder="请输入电子邮箱" />
          </Form.Item>
          <Form.Item label="资质文件" required>
            <Upload.Dragger
              fileList={fileList}
              onChange={({ fileList: next }) => setFileList(next)}
              beforeUpload={() => false}
              multiple
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined style={{ fontSize: 40 }} />
              </p>
              <p className="ant-upload-text">拖拽文件到此处或 <em>点击上传</em></p>
            </Upload.Dragger>
          </Form.Item>
          <Form.Item label="备注说明" name="remark">
            <Input.TextArea rows={3} placeholder="其他需要说明的内容" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={submit}>提交报名</Button>
            <Button style={{ marginLeft: 8 }} onClick={() => navigate('/admin/bidder-projects')}>
              返回项目中心
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <style>{`
        .bid-register {
          max-width: 900px;
          margin: 0 auto;
        }
        .bid-register .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
        }
        .bid-register .register-form {
          margin-top: 10px;
        }
      `}</style>
    </div>
  )
}
