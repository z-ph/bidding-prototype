import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Alert, Button, Card, Col, Form, Input, Row, Steps, Table, Tag, message } from 'antd'
import { InfoCircleFilled } from '@ant-design/icons'
import { projectStore } from '../data/projects.js'
import { authorizationStore } from '../data/authorizationStore.js'
import { useRole } from '../hooks/useRole.js'

const PURCHASE_MODE_LABELS = {
  open: '公开招标',
  invitation: '邀请招标',
  inquiry: '公开询比价',
  invitation_inquiry: '邀请询比价'
}

export default function BidQuote() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false })
  const projectId = searchParams.projectId
  const { userInfo } = useRole()
  const supplierName = userInfo?.nickname || userInfo?.org || ''

  // 项目选择门槛（1415-005）：菜单直接进入（无 URL projectId）时先选项目
  const [chosenProjectId, setChosenProjectId] = useState('')
  const effectiveProjectId = projectId || chosenProjectId

  // 当前供应商可报价项目：公开项目均可；邀请项目需受邀或已获授权
  const quotableProjects = useMemo(() => {
    const seeds = [
      { id: '1', name: 'XX市轨道交通设备采购项目', code: 'ZB20260701001', purchaseMode: 'open', status: '报价中' },
      { id: '2', name: '办公桌椅采购项目', code: 'ZB20260702002', purchaseMode: 'inquiry', status: '已开标' },
      { id: '3', name: '软件开发服务项目', code: 'ZB20260703003', purchaseMode: 'invitation', status: '招标中', invitedBidders: ['A科技有限公司', 'B实业有限公司'] }
    ]
    const stored = projectStore.getProjects().map((p) => ({
      id: String(p.id),
      name: p.name,
      code: p.code,
      purchaseMode: p.purchaseMode,
      status: p.status || '招标中',
      invitedBidders: p.invitedBidders || []
    }))
    const merged = [...seeds]
    stored.forEach((p) => {
      if (!merged.some((s) => String(s.id) === String(p.id))) merged.push(p)
    })
    return merged.filter((p) => {
      const isInvitation = ['invitation', 'invitation_inquiry'].includes(p.purchaseMode)
      if (!isInvitation) return true
      if ((p.invitedBidders || []).includes(supplierName)) return true
      return authorizationStore
        .list({ projectId: p.id })
        .some((a) => a.status === 'authorized' && (a.supplierId === supplierName || a.supplierName === supplierName))
    })
  }, [supplierName])

  // 报价字段由项目创建时的报价模板驱动，缺失时回退默认字段
  const quoteFields = useMemo(() => {
    const project = projectStore.getProjectById(effectiveProjectId)
    if (project?.quoteFields?.length) return project.quoteFields
    return [
      { key: 'totalPrice', label: '投标报价', unit: '万元', required: true },
      { key: 'delivery', label: '交货期', unit: '', required: true },
      { key: 'quality', label: '质保期', unit: '', required: true },
      { key: 'payment', label: '付款方式', unit: '', required: true }
    ]
  }, [effectiveProjectId])

  const [quote, setQuote] = useState(() => {
    const init = {}
    quoteFields.forEach((f) => { init[f.key] = '' })
    return init
  })

  // 切换项目后报价字段随之变化：重置填报值（保留同名 key 已填内容）
  useEffect(() => {
    setQuote((prev) => {
      const next = {}
      quoteFields.forEach((f) => { next[f.key] = prev[f.key] || '' })
      return next
    })
  }, [quoteFields])

  const [items, setItems] = useState([
    { name: '主设备 A 型', spec: '详见技术参数', quantity: 10, unit: '台', price: '' },
    { name: '辅材 B 型', spec: '详见技术参数', quantity: 50, unit: '套', price: '' }
  ])

  // 询比价项目报价在开标后启动：判断采购方式与项目报价阶段
  const isTenderMode = (mode) => ['open', 'invitation'].includes(mode)
  const project = projectStore.getProjectById(effectiveProjectId)
  // 询比价项目需处于"已开标/待报价"阶段才能报价；招标项目报价在上传阶段即可
  const isInquiryMode = project && !isTenderMode(project.purchaseMode)
  const inquiryQuoteReady = project?.status === '待报价' || project?.status === '已开标'
  const quoteLocked = isInquiryMode && !inquiryQuoteReady

  const updateQuote = (key, value) => {
    if (quoteLocked) return
    setQuote((prev) => ({ ...prev, [key]: value }))
  }

  const updatePrice = (index, value) => {
    if (quoteLocked) return
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, price: value } : item)))
  }

  const saveQuote = () => {
    if (quoteLocked) {
      message.warning('询比价项目报价将在开标后启动，当前不可报价')
      return
    }
    message.success(isInquiryMode ? '报价已保存' : '报价已保存，请继续上传投标文件')
  }

  const columns = [
    { title: '分项名称', dataIndex: 'name', key: 'name' },
    { title: '规格', dataIndex: 'spec', key: 'spec' },
    { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 120 },
    { title: '单位', dataIndex: 'unit', key: 'unit', width: 100 },
    {
      title: '单价（元）',
      key: 'price',
      width: 180,
      render: (_, row, index) => (
        <Input
          value={row.price}
          onChange={(e) => updatePrice(index, e.target.value)}
          placeholder="单价"
        />
      )
    },
    {
      title: '小计（元）',
      key: 'subtotal',
      width: 150,
      render: (_, row) => row.quantity * (Number(row.price) || 0)
    }
  ]

  // 无项目参数且未选择项目：渲染项目选择门槛，不渲染报价表单
  if (!effectiveProjectId) {
    return (
      <div className="bid-quote">
        <Card title={<div className="card-header"><span>在线报价</span></div>}>
          <Alert
            title="请先选择要报价的项目。公开项目均可报价；邀请招标/邀请询比价项目仅受邀或已获授权的供应商可报价。"
            type="info"
            showIcon
            closable={false}
            style={{ marginBottom: 20 }}
          />
          <Table
            rowKey="id"
            bordered
            pagination={false}
            dataSource={quotableProjects}
            style={{ width: '100%' }}
            columns={[
              { title: '项目名称', dataIndex: 'name', key: 'name', minWidth: 240 },
              { title: '项目编号', dataIndex: 'code', key: 'code', width: 150 },
              {
                title: '采购方式',
                dataIndex: 'purchaseMode',
                key: 'purchaseMode',
                width: 120,
                render: (mode) => PURCHASE_MODE_LABELS[mode] || mode || '-'
              },
              { title: '项目状态', dataIndex: 'status', key: 'status', width: 110 },
              {
                title: '操作',
                key: 'action',
                width: 120,
                render: (_, row) => (
                  <Button type="primary" size="small" onClick={() => setChosenProjectId(String(row.id))}>
                    选择并报价
                  </Button>
                )
              }
            ]}
          />
        </Card>
        <style>{`
          .bid-quote {
            max-width: 1100px;
            margin: 0 auto;
          }
          .bid-quote .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: bold;
          }
        `}</style>
      </div>
    )
  }

  const chosenProject = quotableProjects.find((p) => String(p.id) === String(effectiveProjectId))

  return (
    <div className="bid-quote">
      <Card
        title={
          <div className="card-header">
            <span>在线报价</span>
            <Tag color="error">距投标截止：2 天 5 小时</Tag>
          </div>
        }
      >
        {!projectId && (
          <Alert
            title={`当前报价项目：${chosenProject?.name || project?.name || effectiveProjectId}`}
            type="success"
            showIcon
            closable={false}
            style={{ marginBottom: 20 }}
            action={
              <Button size="small" onClick={() => setChosenProjectId('')}>
                重新选择项目
              </Button>
            }
          />
        )}
        <Steps
          size="small"
          current={isInquiryMode ? 4 : 3}
          style={{ marginBottom: 24 }}
          items={(isInquiryMode
            ? ['报名通过', '下载文件', '编制标书', '上传并加密', '开标', '填写报价']
            : ['报名通过', '下载文件', '编制标书', '填写报价', '上传并加密']
          ).map((title) => ({ title }))}
        />
        {quoteLocked ? (
          <Alert
            title="询比价项目的报价将在开标后启动，当前项目尚未开标，暂不可报价。请在项目中心等待开标完成后进入。"
            type="info"
            showIcon
            closable={false}
            style={{ marginBottom: 20 }}
          />
        ) : (
          <Alert
            title={isInquiryMode
              ? '当前为询比价项目，已开标，请填写最终报价，提交后进入唱标。'
              : '请按招标文件要求填写开标一览表和分项报价，提交后投标截止前可修改。'}
            type="warning"
            showIcon
            closable={false}
            style={{ marginBottom: 20 }}
          />
        )}

        <h3>开标一览表</h3>
        <Form labelCol={{ flex: '0 0 140px' }} wrapperCol={{ flex: 'auto' }} className="quote-form">
          <Row gutter={20}>
            {quoteFields.map((field) => (
              <Col span={12} key={field.key}>
                <Form.Item label={field.unit ? `${field.label}（${field.unit}）` : field.label} required={field.required}>
                  <Input
                    value={quote[field.key]}
                    disabled={quoteLocked}
                    onChange={(e) => updateQuote(field.key, e.target.value)}
                    placeholder={`请输入${field.label}`}
                  />
                </Form.Item>
              </Col>
            ))}
          </Row>
        </Form>

        <h3>分项报价</h3>
        <Table
          columns={columns}
          dataSource={items}
          rowKey="name"
          pagination={false}
          style={{ width: '100%', marginBottom: 20 }}
        />

        <div className="quote-tips">
          <p><InfoCircleFilled /> 报价将用于开标唱标，请确保与上传的报价文件一致。</p>
        </div>

        <div className="actions">
          <Button type="primary" size="large" disabled={quoteLocked} onClick={saveQuote}>保存报价</Button>
          {isInquiryMode ? (
            <Button size="large" onClick={() => navigate({ to: '/admin/bidder-projects' })}>返回项目中心</Button>
          ) : (
            <Button size="large" onClick={() => navigate({ to: '/admin/bid-upload', search: { projectId: effectiveProjectId } })}>下一步：上传投标文件</Button>
          )}
        </div>
      </Card>

      <style>{`
        .bid-quote {
          max-width: 1100px;
          margin: 0 auto;
        }
        .bid-quote .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
        }
        .bid-quote .quote-form {
          margin: 20px 0;
        }
        .bid-quote .quote-tips {
          color: #E6A23C;
          margin-bottom: 20px;
        }
        .bid-quote .actions {
          display: flex;
          justify-content: center;
          gap: 16px;
        }
      `}</style>
    </div>
  )
}
