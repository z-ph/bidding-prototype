// @ts-nocheck — TS 渐进迁移基线：解冻本文件时删除本行并修复类型（见 AGENTS.md 技术栈）
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import {
  Button,
  Modal,
  Tabs,
  Form,
  Input,
  message,
  Space
} from 'antd'
import {
  CheckOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons'
import { useRole } from '../hooks/useRole.js'
import { resolveRoleFromAccount, ROLE_NAMES } from '../config/permissions.js'

const DEFAULT_SCOPE_BY_ROLE = {
  admin: 'all',
  tenderee: 'enterprise',
  agent: 'enterprise',
  bidder: 'enterprise',
  expert: 'enterprise',
  supervisor: 'all'
}

export default function Login() {
  const navigate = useNavigate()
  const { login, isAuthenticated, redirectToWorkspace } = useRole()
  const [activeTab, setActiveTab] = useState('account')
  const [accountForm] = Form.useForm()
  const [phoneForm] = Form.useForm()
  const [countdown, setCountdown] = useState(0)
  const [captchaVisible, setCaptchaVisible] = useState(false)
  const [captchaAnswer, setCaptchaAnswer] = useState(0)
  const [captchaInput, setCaptchaInput] = useState('')
  const [a, setA] = useState(0)
  const [b, setB] = useState(0)
  const canvasRef = useRef(null)

  useEffect(() => {
    if (isAuthenticated) {
      redirectToWorkspace()
    }
  }, [isAuthenticated, redirectToWorkspace])

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

  const dashboardMap = {
    tenderee: '/admin/dashboard',
    agent: '/admin/dashboard',
    bidder: '/admin/dashboard',
    expert: '/admin/dashboard',
    supervisor: '/admin/supervisor-hall',
    admin: '/admin/dashboard'
  }

  const doLogin = (roleValue, accountValue, loginType = '账号') => {
    const scope = DEFAULT_SCOPE_BY_ROLE[roleValue] || 'all'
    login(roleValue, accountValue, {}, scope)
    message.success(`以 ${ROLE_NAMES[roleValue]} 身份登录成功（${loginType}）`)
    navigate({ to: dashboardMap[roleValue] })
  }

  // 纯演示：登录不做账号密码校验，按账号解析角色直接进入演示
  const accountLogin = () => {
    const rawAccount = String(accountForm.getFieldValue('account') || 'tenderee').trim()
    const resolvedRole = resolveRoleFromAccount(rawAccount)
    doLogin(resolvedRole, rawAccount, '账号密码')
  }

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

  const sendCode = () => {
    generateCaptcha()
    setCaptchaVisible(true)
  }

  // 纯演示：手机号登录默认作为响应单位
  const phoneLogin = () => {
    const phone = phoneForm.getFieldValue('phone') || '13800138000'
    doLogin('bidder', phone, '手机验证码')
  }

  const startTour = () => {
    setActiveTab('account')
    const driverObj = driver({
      showProgress: true,
      allowClose: true,
      overlayColor: 'rgba(0, 21, 41, 0.75)',
      steps: [
        {
          element: '#login-tabs',
          popover: {
            title: '选择登录方式',
            description: '平台支持账号密码、手机验证码两种登录方式，点击标签切换。',
            side: 'bottom',
            align: 'center'
          }
        },
        {
          element: '#login-role',
          popover: {
            title: '选择您的角色',
            description: '平台支持采购单位、采购代理、响应单位、评审专家、监督人员、平台管理员六种角色，登录后进入对应工作台。',
            side: 'right',
            align: 'center'
          },
          onHighlighted: () => setActiveTab('account')
        },
        {
          element: '#login-submit',
          popover: {
            title: '账号密码登录',
            description: '选择角色并输入账号密码后，点击登录进入工作台。',
            side: 'top',
            align: 'center'
          },
          onHighlighted: () => setActiveTab('account')
        },
        {
          element: '#login-phone-panel',
          popover: {
            title: '手机验证码登录',
            description: '输入手机号，点击"获取验证码"，输入收到的短信验证码后登录。',
            side: 'left',
            align: 'center'
          },
          onHighlighted: () => setActiveTab('phone')
        },
        {
          element: '#login-phone-code',
          popover: {
            title: '获取验证码',
            description: '系统会向您的手机发送一条短信验证码，演示环境固定为 123456。',
            side: 'top',
            align: 'center'
          },
          onHighlighted: () => setActiveTab('phone')
        }
      ]
    })
    driverObj.drive()
  }

  const roleButtons = [
    { key: 'tenderee', label: '采购单位' },
    { key: 'agent', label: '采购代理' },
    { key: 'bidder', label: '响应单位' },
    { key: 'expert', label: '评审专家' },
    { key: 'supervisor', label: '监督人员' },
    { key: 'admin', label: '管理员' }
  ]

  const accountTab = (
    <>
      <Form form={accountForm} layout="vertical" initialValues={{ account: 'tenderee', password: '123456' }}>
        <Form.Item label="账号" name="account">
          <Input placeholder="请输入账号，如 tenderee / agent / bidder" />
        </Form.Item>
        <Form.Item label="密码" name="password">
          <Input.Password placeholder="演示环境无需密码，任意填写" />
        </Form.Item>
        <Form.Item>
          <Button id="login-submit" type="primary" style={{ width: '100%' }} onClick={accountLogin}>登录</Button>
        </Form.Item>
      </Form>
      <div id="login-role" className="role-hint">
        <p>演示账号与角色（点击一键登录）：</p>
        <Space wrap>
          {roleButtons.map((role) => (
            <Button
              key={role.key}
              size="small"
              onClick={() => {
                accountForm.setFieldsValue({ account: role.key, password: '123456' })
                doLogin(role.key, role.key, '账号密码')
              }}
            >
              {role.label}
            </Button>
          ))}
        </Space>
        <p style={{ marginTop: 8 }}>tenderee → 采购单位，agent → 采购代理，bidder → 响应单位，</p>
        <p>expert → 评审专家，supervisor → 监督人员，admin → 管理员</p>
      </div>
    </>
  )

  const phoneTab = (
    <Form id="login-phone-panel" form={phoneForm} layout="vertical" initialValues={{ phone: '13800138000', code: '123456' }}>
      <Form.Item label="手机号" name="phone">
        <Input placeholder="请输入手机号" />
      </Form.Item>
      <Form.Item label="验证码" name="code">
        <Input
          placeholder="演示环境固定为 123456"
          suffix={
            <Button
              id="login-phone-code"
              size="small"
              disabled={countdown > 0}
              onClick={sendCode}
            >
              {countdown > 0 ? `${countdown}s` : '获取验证码'}
            </Button>
          }
        />
      </Form.Item>
      <Form.Item>
        <Button id="login-phone-submit" type="primary" style={{ width: '100%' }} onClick={phoneLogin}>登录</Button>
      </Form.Item>
    </Form>
  )

  const tabItems = [
    { key: 'account', label: '账号登录', children: accountTab },
    { key: 'phone', label: '手机登录', children: phoneTab }
  ]

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <h1>采购平台</h1>
          <p>全流程电子化 · 多角色协同 · 安全合规</p>
          <div className="features">
            <div className="feature"><CheckOutlined /> 在线发布采购</div>
            <div className="feature"><CheckOutlined /> 电子响应加密</div>
            <div className="feature"><CheckOutlined /> 线上开启评审</div>
            <div className="feature"><CheckOutlined /> 成交确认结果公示</div>
          </div>
        </div>
        <div className="login-right">
          <div style={{ textAlign: 'right', marginBottom: 12 }}>
            <Button type="link" icon={<QuestionCircleOutlined />} onClick={startTour}>查看登录引导</Button>
          </div>
          <Tabs id="login-tabs" activeKey={activeTab} onChange={setActiveTab} type="card" items={tabItems} />
          <div className="register-link">
            还没有账号？<Button type="link" onClick={() => navigate({ to: '/register' })}>立即注册</Button>
            <span style={{ margin: '0 8px' }}>|</span>
            <Button type="link" onClick={() => navigate({ to: '/' })}>返回首页</Button>
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
        .login-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #001529 0%, #003366 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .login-container {
          width: 900px;
          background: #fff;
          border-radius: 8px;
          display: flex;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }
        .login-left {
          width: 400px;
          background: #001529;
          color: #fff;
          padding: 60px 40px;
        }
        .login-left h1 {
          font-size: 32px;
          margin-bottom: 16px;
          color: #fff;
        }
        .login-left p {
          font-size: 16px;
          opacity: 0.8;
          margin-bottom: 40px;
        }
        .features {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .feature {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 16px;
        }
        .login-right {
          flex: 1;
          padding: 40px;
        }
        .role-hint {
          margin-top: 16px;
          padding: 12px;
          background: #f5f7fa;
          border-radius: 4px;
          font-size: 12px;
          color: #606266;
          line-height: 1.6;
        }
        .role-hint p {
          margin: 0;
        }
        .register-link {
          margin-top: 20px;
          text-align: center;
          color: #666;
        }
      `}</style>
    </div>
  )
}
