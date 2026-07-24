import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  Button,
  Modal,
  Tabs,
  Form,
  Input,
  Upload,
  Checkbox,
  message,
  Card,
  Col,
  Row,
  Select,
  Tag
} from 'antd'
import { UploadOutlined } from '@ant-design/icons'

const bidderQualifications = [
  { key: '营业执照', label: '营业执照' },
  { key: 'ISO9001认证', label: 'ISO9001认证' },
  { key: '安全生产许可证', label: '安全生产许可证' },
  { key: '特定行业资质', label: '特定行业资质' }
]

export default function Register() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [role, setRole] = useState('tenderee')
  const [fileList, setFileList] = useState([])
  const [qualificationFiles, setQualificationFiles] = useState({})
  const [countdown, setCountdown] = useState(0)
  const [captchaVisible, setCaptchaVisible] = useState(false)
  const [captchaAnswer, setCaptchaAnswer] = useState(0)
  const [captchaInput, setCaptchaInput] = useState('')
  const [a, setA] = useState(0)
  const [b, setB] = useState(0)
  const canvasRef = useRef(null)

  useEffect(() => {
    if (countdown <= 0) return
    const id = setInterval(() => setCountdown((c) => c - 1), 1000)
    return () => clearInterval(id)
  }, [countdown])

  useEffect(() => {
    if (!captchaVisible || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, 200, 60)
    ctx.fillStyle = '#f0f0f0'
    ctx.fillRect(0, 0, 200, 60)
    for (let i = 0; i < 5; i++) {
      ctx.beginPath()
      ctx.moveTo(Math.random() * 200, Math.random() * 60)
      ctx.lineTo(Math.random() * 200, Math.random() * 60)
      ctx.strokeStyle = '#ccc'
      ctx.stroke()
    }
    ctx.font = '28px Arial'
    ctx.fillStyle = '#333'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${a} + ${b} = ?`, 100, 30)
  }, [captchaVisible, a, b])

  const generateCaptcha = () => {
    const newA = Math.floor(Math.random() * 20) + 1
    const newB = Math.floor(Math.random() * 20) + 1
    setA(newA)
    setB(newB)
    setCaptchaAnswer(newA + newB)
  }

  const confirmCaptcha = () => {
    if (Number(captchaInput) !== captchaAnswer) {
      message.error('图形验证码错误')
      return
    }
    setCaptchaVisible(false)
    setCaptchaInput('')
    message.success('验证码已发送：123456')
    setCountdown(60)
  }

  const handleSendCode = () => {
    generateCaptcha()
    setCaptchaVisible(true)
  }

  const submit = () => {
    form.validateFields().then(() => {
      // 响应企业注册：营业执照为必传，缺失时阻断并提示
      if (role === 'bidder') {
        const missing = bidderQualifications.filter(
          (q) => !qualificationFiles[q.key] || qualificationFiles[q.key].length === 0
        )
        if (missing.length > 0) {
          message.error(`请先上传：${missing.map((q) => q.label).join('、')}`)
          return
        }
      }
      // 采购单位注册：营业执照等资质为必传
      if (role === 'tenderee' && fileList.length === 0) {
        message.error('请先上传营业执照等资质')
        return
      }
      message.success('注册信息已提交，等待平台审核')
      navigate({ to: '/login' })
    })
  }

  const uploadProps = {
    fileList,
    onChange: ({ fileList: newFileList }) => setFileList(newFileList),
    beforeUpload: () => false,
    multiple: true
  }

  const renderCommonFields = () => (
    <>
      <Form.Item
        label="手机号"
        name="phone"
        rules={[{ required: true, message: '请输入手机号' }]}
      >
        <Input placeholder="请输入手机号" />
      </Form.Item>
      <Form.Item
        label="短信验证码"
        name="smsCode"
        rules={[{ required: true, message: '请输入短信验证码' }]}
      >
        <Input
          placeholder="请输入短信验证码"
          suffix={
            <Button
              size="small"
              disabled={countdown > 0}
              onClick={handleSendCode}
            >
              {countdown > 0 ? `${countdown}s` : '获取短信验证码'}
            </Button>
          }
        />
      </Form.Item>
      <Form.Item
        label="登录密码"
        name="password"
        rules={[{ required: true, message: '请设置登录密码' }]}
      >
        <Input.Password placeholder="请设置登录密码" />
      </Form.Item>
    </>
  )

  const agreementRule = {
    validator: (_, value) =>
      value ? Promise.resolve() : Promise.reject(new Error('请阅读并同意用户协议'))
  }

  const renderOrgForm = (isTenderee) => (
    <Form form={form} layout="vertical">
      <Form.Item
        label={isTenderee ? '单位名称' : '企业名称'}
        name="companyName"
        rules={[{ required: true, message: isTenderee ? '请输入单位全称' : '请输入企业全称' }]}
      >
        <Input placeholder={isTenderee ? '请输入单位全称' : '请输入企业全称'} />
      </Form.Item>
      <Form.Item
        label="统一社会信用代码"
        name="creditCode"
        rules={[{ required: true, message: '请输入统一社会信用代码' }]}
      >
        <Input placeholder="请输入统一社会信用代码" />
      </Form.Item>
      <Form.Item
        label="联系人"
        name="contactName"
        rules={[{ required: true, message: '请输入联系人姓名' }]}
      >
        <Input placeholder="请输入联系人姓名" />
      </Form.Item>
      {!isTenderee && (
        <Form.Item
          label="供应商类型"
          name="supplierType"
          rules={[{ required: true, message: '请选择供应商类型' }]}
        >
          <Select
            placeholder="请选择供应商类型"
            options={[
              { label: '劳务', value: '劳务' },
              { label: '材料', value: '材料' },
              { label: '服务', value: '服务' }
            ]}
          />
        </Form.Item>
      )}
      {renderCommonFields()}
      {isTenderee ? (
        <Form.Item label="资质附件">
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>上传营业执照等资质</Button>
          </Upload>
        </Form.Item>
      ) : (
        <Form.Item label="资质附件">
          <div style={{ marginBottom: 12 }}>
            <Tag color="blue">按资质类型上传</Tag>
            <span style={{ color: '#666', marginLeft: 8 }}>便于后续按项目资质要求自动检测</span>
          </div>
          <Row gutter={[16, 16]}>
            {bidderQualifications.map((q) => (
              <Col span={12} key={q.key}>
                <Card size="small" title={q.label}>
                  <Upload
                    fileList={qualificationFiles[q.key] || []}
                    onChange={({ fileList: next }) => setQualificationFiles((prev) => ({ ...prev, [q.key]: next }))}
                    beforeUpload={() => false}
                    multiple={false}
                  >
                    <Button icon={<UploadOutlined />}>上传 {q.label}</Button>
                  </Upload>
                </Card>
              </Col>
            ))}
          </Row>
        </Form.Item>
      )}
      <Form.Item
        name="agreed"
        valuePropName="checked"
        rules={[agreementRule]}
      >
        <Checkbox>我已阅读并同意《平台用户协议》</Checkbox>
      </Form.Item>
    </Form>
  )

  const expertForm = (
    <Form form={form} layout="vertical">
      <Form.Item
        label="姓名"
        name="contactName"
        rules={[{ required: true, message: '请输入姓名' }]}
      >
        <Input placeholder="请输入姓名" />
      </Form.Item>
      <Form.Item
        label="身份证号"
        name="idCard"
        rules={[{ required: true, message: '请输入身份证号' }]}
      >
        <Input placeholder="请输入身份证号" />
      </Form.Item>
      <Form.Item
        label="专业领域"
        name="expertField"
        rules={[{ required: true, message: '请输入专业领域' }]}
      >
        <Input placeholder="例如：电子信息、机械设备" />
      </Form.Item>
      {renderCommonFields()}
      <Form.Item label="资质附件">
        <Upload {...uploadProps}>
          <Button icon={<UploadOutlined />}>上传职称证书等</Button>
        </Upload>
      </Form.Item>
    </Form>
  )

  const tabItems = [
    { key: 'tenderee', label: '采购单位注册', children: renderOrgForm(true) },
    { key: 'bidder', label: '供应商注册', children: renderOrgForm(false) },
    { key: 'expert', label: '专家注册', children: expertForm }
  ]

  return (
    <div className="register-page">
      <div className="register-container">
        <h2>平台注册</h2>
        <Tabs activeKey={role} onChange={setRole} type="card" items={tabItems} />
        <div className="actions">
          <Button type="primary" size="large" style={{ width: '100%' }} onClick={submit}>提交注册</Button>
          <div className="login-link">
            已有账号？<Button type="link" onClick={() => navigate({ to: '/login' })}>立即登录</Button>
          </div>
        </div>
      </div>

      <Modal
        title="图形验证码"
        open={captchaVisible}
        onCancel={() => { setCaptchaVisible(false); setCaptchaInput('') }}
        footer={null}
        destroyOnClose
      >
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <canvas ref={canvasRef} width={200} height={60} style={{ border: '1px solid #ddd', borderRadius: 4 }} />
          <div style={{ marginTop: 12 }}>
            <Input
              placeholder="请输入计算结果"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              style={{ width: 200 }}
              onPressEnter={confirmCaptcha}
            />
          </div>
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 8 }}>
            <Button type="primary" onClick={confirmCaptcha}>确认</Button>
            <Button onClick={() => { generateCaptcha(); setCaptchaInput('') }}>重新生成</Button>
          </div>
        </div>
      </Modal>

      <style>{`
        .register-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #001529 0%, #003366 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
        }
        .register-container {
          width: 520px;
          background: #fff;
          border-radius: 8px;
          padding: 32px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }
        .register-container h2 {
          text-align: center;
          margin-bottom: 24px;
          color: #001529;
        }
        .actions {
          margin-top: 24px;
        }
        .login-link {
          margin-top: 16px;
          text-align: center;
          color: #666;
        }
      `}</style>
    </div>
  )
}
