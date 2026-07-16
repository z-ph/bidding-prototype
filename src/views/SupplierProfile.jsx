import { useState, useEffect, useMemo } from 'react'
import { Alert, Button, Card, Col, DatePicker, Form, Input, Row, Upload, message, Tag } from 'antd'
import dayjs from 'dayjs'
import { useRole } from '../hooks/useRole.js'

const PROFILE_KEY = 'bidding-supplier-profile'
const QUAL_KEY = 'bidding-supplier-quals'

const qualificationTypes = [
  { key: '营业执照', label: '营业执照', needExpiry: false },
  { key: 'ISO9001认证', label: 'ISO9001认证', needExpiry: true },
  { key: '安全生产许可证', label: '安全生产许可证', needExpiry: true },
  { key: '特定行业资质', label: '特定行业资质', needExpiry: true }
]

const defaultForm = {
  name: 'A科技有限公司',
  creditCode: '91440300MA5GXXXXXX',
  capital: '5000',
  foundDate: dayjs('2018-05-20'),
  businessScope: '计算机软硬件、电子设备的研发、销售及技术服务；系统集成；网络工程等。'
}

const defaultQuals = {
  营业执照: [{ uid: '1', name: '营业执照.pdf', status: 'done', expiry: null }],
  ISO9001认证: [{ uid: '2', name: 'ISO9001证书.pdf', status: 'done', expiry: dayjs('2027-06-30') }]
}

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const data = JSON.parse(raw)
    // foundDate / expiry 在 localStorage 中是字符串，需还原为 dayjs 对象
    return data
  } catch {
    return fallback
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore storage errors
  }
}

export default function SupplierProfile() {
  const { role, userName } = useRole()
  // 非本企业（非投标人/供应商）只读
  const readOnly = role !== 'bidder'

  const [form, setForm] = useState(() => {
    const stored = loadJSON(PROFILE_KEY, null)
    if (!stored) return defaultForm
    return { ...defaultForm, ...stored, foundDate: stored.foundDate ? dayjs(stored.foundDate) : defaultForm.foundDate }
  })

  const [qualificationFiles, setQualificationFiles] = useState(() => {
    const stored = loadJSON(QUAL_KEY, null)
    if (!stored) return defaultQuals
    // 还原 expiry 字符串为 dayjs
    const restored = {}
    Object.keys(stored).forEach((key) => {
      restored[key] = (stored[key] || []).map((f) => ({
        ...f,
        expiry: f.expiry ? dayjs(f.expiry) : null
      }))
    })
    return restored
  })

  const updateField = (key, value) => {
    if (readOnly) return
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const onQualChange = (key, next) => {
    if (readOnly) return
    setQualificationFiles((prev) => ({ ...prev, [key]: next }))
  }

  const setQualExpiry = (key, uid, expiry) => {
    if (readOnly) return
    setQualificationFiles((prev) => ({
      ...prev,
      [key]: (prev[key] || []).map((f) => (f.uid === uid ? { ...f, expiry } : f))
    }))
  }

  const saveProfile = () => {
    if (readOnly) {
      message.warning('当前角色只读，无法保存企业档案')
      return
    }
    saveJSON(PROFILE_KEY, form)
    saveJSON(QUAL_KEY, qualificationFiles)
    message.success('企业档案与资质已保存')
  }

  // 资质过期检测：临近（30天内）或已过期
  const expiryAlerts = useMemo(() => {
    const today = dayjs()
    const alerts = []
    qualificationTypes.forEach((q) => {
      ;(qualificationFiles[q.key] || []).forEach((f) => {
        if (!f.expiry) return
        const diff = f.expiry.diff(today, 'day')
        if (diff < 0) {
          alerts.push({ name: f.name, qual: q.label, status: 'expired', days: diff })
        } else if (diff <= 30) {
          alerts.push({ name: f.name, qual: q.label, status: 'near', days: diff })
        }
      })
    })
    return alerts
  }, [qualificationFiles])

  // 初次进入若已存在持久化数据，不做额外操作；保存按钮显式触发持久化

  return (
    <div className="supplier-profile">
      <Card
        title={
          <div className="card-header">
            <span>企业档案与资质</span>
            <Button type="primary" disabled={readOnly} onClick={saveProfile}>
              {readOnly ? '只读' : '保存'}
            </Button>
          </div>
        }
      >
        {readOnly && (
          <Alert
            title="当前为非企业账号视角，档案信息仅可查看，不可编辑。"
            type="info"
            showIcon
            closable={false}
            style={{ marginBottom: 16 }}
          />
        )}
        {expiryAlerts.length > 0 && (
          <Alert
            title={expiryAlerts.map((a) =>
              a.status === 'expired'
                ? `${a.qual}（${a.name}）已过期 ${Math.abs(a.days)} 天`
                : `${a.qual}（${a.name}）将于 ${a.days} 天后过期`
            ).join('；')}
            type="warning"
            showIcon
            closable={false}
            style={{ marginBottom: 16 }}
          />
        )}

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
                  disabled={readOnly}
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
                  disabled={readOnly}
                  onChange={(e) => updateField('capital', e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="成立日期">
                <DatePicker
                  style={{ width: '100%' }}
                  value={form.foundDate}
                  disabled={readOnly}
                  onChange={(value) => updateField('foundDate', value)}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="经营范围">
            <Input.TextArea
              rows={3}
              value={form.businessScope}
              disabled={readOnly}
              onChange={(e) => updateField('businessScope', e.target.value)}
            />
          </Form.Item>
          <Form.Item label="资质文件">
            <div style={{ marginBottom: 12 }}>
              <Tag color="blue">按资质类型上传</Tag>
              <span style={{ color: '#666', marginLeft: 8 }}>报名时将按项目要求自动检测是否齐全，带有效期资质到期前 30 天预警</span>
            </div>
            <Row gutter={[20, 20]}>
              {qualificationTypes.map((q) => (
                <Col span={12} key={q.key}>
                  <Card size="small" title={q.label}>
                    <Upload
                      fileList={qualificationFiles[q.key] || []}
                      onChange={({ fileList: next }) => onQualChange(q.key, next)}
                      beforeUpload={() => false}
                      multiple={false}
                      disabled={readOnly}
                    >
                      <Button type="primary" disabled={readOnly}>上传 {q.label}</Button>
                    </Upload>
                    {(qualificationFiles[q.key] || []).map((f) => {
                      const expired = f.expiry && f.expiry.diff(dayjs(), 'day') < 0
                      const near = f.expiry && f.expiry.diff(dayjs(), 'day') >= 0 && f.expiry.diff(dayjs(), 'day') <= 30
                      return (
                        <div key={f.uid} style={{ marginTop: 8 }}>
                          {q.needExpiry && (
                            <DatePicker
                              size="small"
                              style={{ width: 180 }}
                              placeholder="有效期至"
                              value={f.expiry || null}
                              disabled={readOnly}
                              onChange={(value) => setQualExpiry(q.key, f.uid, value)}
                            />
                          )}
                          {expired && <Tag color="error" style={{ marginLeft: 8 }}>已过期</Tag>}
                          {near && <Tag color="warning" style={{ marginLeft: 8 }}>即将过期</Tag>}
                        </div>
                      )
                    })}
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
