import { useState } from 'react'
import { Alert, Button, Card, Form, Input, InputNumber, Modal, Switch, message } from 'antd'
import { useRole } from '../hooks/useRole.js'

// 系统设置（cal-011）：系统信息维护（清单 47 管理员面板）+ 演示环境基础参数
// 配置持久化 localStorage；仅平台管理员可维护

const SETTINGS_KEY = 'bidding-system-settings'

// 演示数据重置时保留的会话类 key（不清除，避免重置后被强制登出）
const SESSION_KEYS = [
  'bidding-role',
  'bidding-account',
  'bidding-token-expiry',
  'bidding-user-info',
  'bidding-data-scope'
]

const DEFAULT_SETTINGS = {
  platformName: '招投标采购平台',
  contactPhone: '0000-00000000',
  contactEmail: 'support@example.com',
  caSandbox: true,
  smsMock: true,
  openReminderDays: 3
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS
  } catch {
    return DEFAULT_SETTINGS
  }
}

function saveSettings(value) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(value))
  } catch {
    // ignore storage errors
  }
}

export default function SystemSettings() {
  const { role, roleName } = useRole()
  const isAdmin = role === 'admin'

  const [form, setForm] = useState(() => loadSettings())
  const [formErrors, setFormErrors] = useState({})

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (formErrors[key]) setFormErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const save = () => {
    const errors = {}
    if (!form.platformName.trim()) errors.platformName = '请输入平台名称'
    if (form.contactEmail && !/^\S+@\S+\.\S+$/.test(form.contactEmail.trim())) {
      errors.contactEmail = '邮箱格式不正确'
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      message.error('请修正表单错误后再保存')
      return
    }
    saveSettings({ ...form, platformName: form.platformName.trim() })
    message.success('系统设置已保存（localStorage 持久化，刷新后保留）')
  }

  const resetDefault = () => {
    setForm(DEFAULT_SETTINGS)
    saveSettings(DEFAULT_SETTINGS)
    message.success('已恢复默认设置')
  }

  // 演示数据重置：清除 bidding-* 业务数据，保留登录会话（二次确认）
  const requestResetData = () => {
    Modal.confirm({
      title: '确认重置演示数据',
      content: '将清除本浏览器中所有 bidding-* 业务数据（项目、审批、站内信、模板、用户等），恢复各 store 种子数据；当前登录状态保留。此操作不可撤销，是否继续？',
      okText: '确认重置',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => {
        const keys = Object.keys(localStorage).filter(
          (key) => key.startsWith('bidding-') && !SESSION_KEYS.includes(key)
        )
        keys.forEach((key) => localStorage.removeItem(key))
        setForm(DEFAULT_SETTINGS)
        message.success(`演示数据已重置（清除 ${keys.length} 项），当前登录状态保留；其他页面重新进入后生效`)
      }
    })
  }

  return (
    <div className="system-settings">
      <Card title={<div className="card-header"><span>系统设置</span></div>}>
        <Alert
          title={
            isAdmin
              ? '系统信息维护仅平台管理员可见（需求确认清单 47 管理员面板）。配置保存在浏览器 localStorage，刷新后保留。'
              : `系统设置仅平台管理员可见与维护，当前角色：${roleName}，以下为只读展示。`
          }
          type={isAdmin ? 'info' : 'warning'}
          showIcon
          closable={false}
          style={{ marginBottom: 20 }}
        />
        <Form labelCol={{ flex: '0 0 140px' }} wrapperCol={{ flex: 'auto' }} disabled={!isAdmin}>
          <Form.Item
            label="平台名称"
            validateStatus={formErrors.platformName ? 'error' : ''}
            help={formErrors.platformName}
          >
            <Input value={form.platformName} onChange={(e) => updateField('platformName', e.target.value)} />
          </Form.Item>
          <Form.Item label="联系电话">
            <Input value={form.contactPhone} onChange={(e) => updateField('contactPhone', e.target.value)} />
          </Form.Item>
          <Form.Item
            label="联系邮箱"
            validateStatus={formErrors.contactEmail ? 'error' : ''}
            help={formErrors.contactEmail}
          >
            <Input value={form.contactEmail} onChange={(e) => updateField('contactEmail', e.target.value)} />
          </Form.Item>
          <Form.Item label="平台 Logo" extra="演示环境占位，暂不支持上传；正式环境在此维护平台 Logo 图片。">
            <Input value="logo-placeholder.svg（占位）" disabled />
          </Form.Item>
          <Form.Item label="CA 沙箱模式" extra="开启后 CA 加解密/签章走沙箱模拟，不接入真实 CA 服务。">
            <Switch checked={form.caSandbox} onChange={(checked) => updateField('caSandbox', checked)} />
          </Form.Item>
          <Form.Item label="短信模拟" extra="短信（天翼云）为预留接口，一期不实现；开启后短信相关动作仅模拟提示。">
            <Switch checked={form.smsMock} onChange={(checked) => updateField('smsMock', checked)} />
          </Form.Item>
          <Form.Item label="开标提醒（提前天数）">
            <InputNumber
              min={0}
              max={30}
              value={form.openReminderDays}
              onChange={(value) => updateField('openReminderDays', value ?? 0)}
            />
          </Form.Item>
        </Form>
        {isAdmin && (
          <div className="action-bar">
            <Button type="primary" onClick={save}>保存设置</Button>
            <Button onClick={resetDefault}>恢复默认</Button>
          </div>
        )}
      </Card>

      <Card title="演示数据" style={{ marginTop: 20 }}>
        <Alert
          title="演示环境数据均保存在浏览器 localStorage（bidding-* 前缀），可在此一键重置为种子数据。"
          type="info"
          showIcon
          closable={false}
          style={{ marginBottom: 20 }}
        />
        <Button danger disabled={!isAdmin} onClick={requestResetData}>重置演示数据</Button>
      </Card>

      <style>{`
        .system-settings {
          max-width: 800px;
          margin: 0 auto;
        }
        .system-settings .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
          width: 100%;
        }
        .system-settings .action-bar {
          display: flex;
          gap: 12px;
          margin-top: 8px;
        }
      `}</style>
    </div>
  )
}
