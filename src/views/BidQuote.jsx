import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Alert, Button, Card, Col, Form, Input, Row, Steps, Table, Tag, message } from 'antd'
import { InfoCircleFilled } from '@ant-design/icons'
import { projectStore } from '../data/projects.js'
import { quoteStore } from '../data/quoteStore.js'
import { useRole } from '../hooks/useRole.js'
import ProjectEntryGuard from '../components/ProjectEntryGuard.jsx'

const DEFAULT_ITEMS = [
  { name: '主设备 A 型', spec: '详见技术参数', quantity: 10, unit: '台', price: '' },
  { name: '辅材 B 型', spec: '详见技术参数', quantity: 50, unit: '套', price: '' }
]

export default function BidQuote() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false })
  const projectId = searchParams.projectId
  const { userInfo } = useRole()
  const supplierName = userInfo?.nickname || userInfo?.org || ''

  // 报价字段由项目创建时的报价模板驱动，缺失时回退默认字段
  const quoteFields = useMemo(() => {
    const project = projectStore.getProjectById(projectId)
    if (project?.quoteFields?.length) return project.quoteFields
    return [
      { key: 'totalPrice', label: '投标报价', unit: '万元', required: true },
      { key: 'delivery', label: '交货期', unit: '', required: true },
      { key: 'quality', label: '质保期', unit: '', required: true },
      { key: 'payment', label: '付款方式', unit: '', required: true }
    ]
  }, [projectId])

  // 当前项目+供应商已保存的报价记录（无 projectId 时安全返回 null，guard 会阻断渲染）
  const savedQuote = useMemo(() => quoteStore.getQuote(projectId, supplierName), [projectId, supplierName])

  const [quote, setQuote] = useState(() => {
    const init = {}
    quoteFields.forEach((f) => { init[f.key] = savedQuote?.quote?.[f.key] || '' })
    return init
  })

  // 切换项目/供应商后回显已保存报价；报价字段变化时按 key 对齐（已保存值优先，其次保留同名 key 已填内容）
  useEffect(() => {
    setQuote((prev) => {
      const next = {}
      quoteFields.forEach((f) => { next[f.key] = savedQuote?.quote?.[f.key] || prev[f.key] || '' })
      return next
    })
  }, [quoteFields, savedQuote])

  const [items, setItems] = useState(() => savedQuote?.items || DEFAULT_ITEMS)

  // 切换项目/供应商后回显已保存分项报价
  useEffect(() => {
    setItems(savedQuote?.items || DEFAULT_ITEMS)
  }, [savedQuote])

  // 阶段页面守卫（位于所有 hooks 之后）：无 URL projectId 时阻断，引导返回项目中心
  if (!projectId) {
    return <ProjectEntryGuard backTo="/admin/bidder-projects" backLabel="返回项目中心" />
  }

  const project = projectStore.getProjectById(projectId)

  const updateQuote = (key, value) => {
    setQuote((prev) => ({ ...prev, [key]: value }))
  }

  const updatePrice = (index, value) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, price: value } : item)))
  }

  const saveQuote = () => {
    message.success('演示环境 · 报价数据已预置，操作仅作展示')
    navigate({ to: '/admin/bid-upload', search: { projectId } })
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
        <Steps
          size="small"
          current={isInquiryMode ? 3 : 2}
          style={{ marginBottom: 24 }}
          items={(isInquiryMode
            ? ['下载文件', '编制标书', '上传并加密', '开标', '填写报价']
            : ['下载文件', '编制标书', '填写报价', '上传并加密']
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
            <Button size="large" onClick={() => navigate({ to: '/admin/bid-upload', search: { projectId } })}>下一步：上传投标文件</Button>
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
