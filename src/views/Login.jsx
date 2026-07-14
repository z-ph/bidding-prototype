import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import {
  Button,
  Tabs,
  Form,
  Input,
  message,
  Space,
  Tag
} from 'antd'
import {
  CheckOutlined,
  LockOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons'
import { useRole } from '../hooks/useRole.js'
import { resolveRoleFromAccount, ROLE_NAMES } from '../config/permissions.js'

const DEMO_ACCOUNTS = {
  tenderee: '123456',
  agent: '123456',
  bidder: '123456',
  expert: '123456',
  supervisor: '123456',
  admin: '123456',
  zhangsan: '123456',
  lisi: '123456',
  gongying: '123456',
  zhuanjia: '123456',
  jiandu: '123456'
}

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
  const [caForm] = Form.useForm()
  const [countdown, setCountdown] = useState(0)
  const [caStatus, setCaStatus] = useState({ status: 'idle', message: '' })

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

  const dashboardMap = {
    tenderee: '/admin/dashboard',
    agent: '/admin/dashboard',
    bidder: '/admin/dashboard',
    expert: '/admin/dashboard',
    supervisor: '/admin/supervisor-hall',
    admin: '/admin/admin-dashboard'
  }

  const doLogin = (roleValue, accountValue, loginType = '账号') => {
    const scope = DEFAULT_SCOPE_BY_ROLE[roleValue] || 'all'
    login(roleValue, accountValue, {}, scope)
    message.success(`以 ${ROLE_NAMES[roleValue]} 身份登录成功（${loginType}）`)
    navigate(dashboardMap[roleValue])
  }

  const accountLogin = () => {
    accountForm.validateFields().then((values) => {
      const key = String(values.account).toLowerCase().trim()
      if (!DEMO_ACCOUNTS[key] || DEMO_ACCOUNTS[key] !== values.password) {
        message.error('账号或密码错误')
        return
      }
      const resolvedRole = resolveRoleFromAccount(values.account)
      doLogin(resolvedRole, values.account, '账号密码')
    })
  }

  const sendCode = () => {
    phoneForm.validateFields(['phone']).then(() => {
      message.success('验证码已发送：123456')
      setCountdown(60)
    })
  }

  const phoneLogin = () => {
    phoneForm.validateFields().then((values) => {
      if (values.code !== '123456') {
        message.error('验证码错误')
        return
      }
      // 演示环境：手机号登录默认作为投标人
      doLogin('bidder', values.phone, '手机验证码')
    })
  }

  const caLogin = () => {
    caForm.validateFields(['account']).then((values) => {
      const account = String(values.account).trim()
      if (!account) {
        message.error('请输入账号以确定角色')
        return
      }
      setCaStatus({ status: 'checking', message: '正在检测 CA 证书...' })
      setTimeout(() => {
        // 演示环境：输入 ca 模拟检测到合法证书；其他情况模拟未插入 UKey
        if (account.toLowerCase() === 'ca') {
          setCaStatus({ status: 'success', message: '证书检测通过' })
          const resolvedRole = resolveRoleFromAccount('ca') || 'bidder'
          doLogin(resolvedRole, account, 'CA 证书')
        } else {
          setCaStatus({ status: 'error', message: '未检测到 CA 证书，请插入 UKey' })
        }
      }, 800)
    })
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
            description: '平台支持账号密码、CA 数字证书、手机验证码三种登录方式，点击标签切换。',
            side: 'bottom',
            align: 'center'
          }
        },
        {
          element: '#login-role',
          popover: {
            title: '选择您的角色',
            description: '平台支持招标人、招标代理、投标人、评标专家、监督人员、平台管理员六种角色，登录后进入对应工作台。',
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
          element: '#login-ca-panel',
          popover: {
            title: 'CA 数字证书登录',
            description: '插入 CA UKey 后，点击“检测证书并登录”完成高安全身份认证。首次使用请下载 CA 驱动或申请证书。',
            side: 'left',
            align: 'center'
          },
          onHighlighted: () => setActiveTab('ca')
        },
        {
          element: '#login-phone-panel',
          popover: {
            title: '手机验证码登录',
            description: '输入手机号，点击“获取验证码”，输入收到的短信验证码后登录。',
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
    { key: 'tenderee', label: '招标人' },
    { key: 'agent', label: '招标代理' },
    { key: 'bidder', label: '投标人' },
    { key: 'expert', label: '评标专家' },
    { key: 'supervisor', label: '监督人员' },
    { key: 'admin', label: '管理员' }
  ]

  const accountTab = (
    <>
      <Form form={accountForm} layout="vertical" initialValues={{ account: 'tenderee', password: '123456' }}>
        <Form.Item
          label="账号"
          name="account"
          rules={[{ required: true, message: '请输入账号' }]}
        >
          <Input placeholder="请输入账号，如 tenderee / agent / bidder" />
        </Form.Item>
        <Form.Item
          label="密码"
          name="password"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input.Password placeholder="请输入密码" />
        </Form.Item>
        <Form.Item>
          <Button id="login-submit" type="primary" style={{ width: '100%' }} onClick={accountLogin}>登录</Button>
        </Form.Item>
      </Form>
      <div id="login-role" className="role-hint">
        <p>演示账号与角色：</p>
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
        <p style={{ marginTop: 8 }}>tenderee → 招标人，agent → 招标代理，bidder → 投标人，</p>
        <p>expert → 评标专家，supervisor → 监督人员，admin → 管理员</p>
      </div>
    </>
  )

  const caTab = (
    <div id="login-ca-panel" className="ca-login">
      <LockOutlined style={{ fontSize: 60, color: '#409EFF' }} />
      <p>请插入 CA 数字证书 UKey</p>
      <Form form={caForm} layout="vertical" className="ca-account-form">
        <Form.Item
          label="账号"
          name="account"
          rules={[{ required: true, message: '请输入账号以确定角色' }]}
        >
          <Input placeholder="请输入账号以确定角色" />
        </Form.Item>
      </Form>
      <Button id="login-ca-btn" type="primary" onClick={caLogin} loading={caStatus.status === 'checking'}>
        检测证书并登录
      </Button>
      {caStatus.status !== 'idle' && caStatus.status !== 'checking' && (
        <div style={{ marginTop: 12 }}>
          <Tag color={caStatus.status === 'success' ? 'success' : 'error'}>{caStatus.message}</Tag>
        </div>
      )}
      <div className="ca-tips">
        <Button type="link">下载 CA 驱动</Button>
        <span>|</span>
        <Button type="link">CA 证书申请</Button>
      </div>
      <p className="ca-demo-tip">演示环境：输入账号 ca 模拟证书检测通过</p>
    </div>
  )

  const phoneTab = (
    <Form id="login-phone-panel" form={phoneForm} layout="vertical">
      <Form.Item
        label="手机号"
        name="phone"
        rules={[
          { required: true, message: '请输入手机号' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
        ]}
      >
        <Input placeholder="请输入手机号" />
      </Form.Item>
      <Form.Item
        label="验证码"
        name="code"
        rules={[{ required: true, message: '请输入验证码' }]}
      >
        <Input
          placeholder="请输入验证码"
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
    { key: 'ca', label: 'CA 登录', children: caTab },
    { key: 'phone', label: '手机登录', children: phoneTab }
  ]

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <h1>招投标采购平台</h1>
          <p>全流程电子化 · 多角色协同 · 安全合规</p>
          <div className="features">
            <div className="feature"><CheckOutlined /> 在线招标发标</div>
            <div className="feature"><CheckOutlined /> 电子投标加密</div>
            <div className="feature"><CheckOutlined /> 线上开标评标</div>
            <div className="feature"><CheckOutlined /> 合同归档管理</div>
          </div>
        </div>
        <div className="login-right">
          <div style={{ textAlign: 'right', marginBottom: 12 }}>
            <Button type="link" icon={<QuestionCircleOutlined />} onClick={startTour}>查看登录引导</Button>
          </div>
          <Tabs id="login-tabs" activeKey={activeTab} onChange={setActiveTab} type="card" items={tabItems} />
          <div className="register-link">
            还没有账号？<Button type="link" onClick={() => navigate('/register')}>立即注册</Button>
            <span style={{ margin: '0 8px' }}>|</span>
            <Button type="link" onClick={() => navigate('/')}>返回首页</Button>
          </div>
        </div>
      </div>

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
        .ca-login {
          text-align: center;
          padding: 20px 20px;
        }
        .ca-login p {
          margin: 12px 0;
          color: #666;
        }
        .ca-account-form {
          max-width: 280px;
          margin: 0 auto 16px;
          text-align: left;
        }
        .ca-tips {
          margin-top: 20px;
          display: flex;
          justify-content: center;
          gap: 16px;
          color: #ccc;
          align-items: center;
        }
        .ca-demo-tip {
          color: #999;
          font-size: 12px;
          margin-top: 12px;
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
