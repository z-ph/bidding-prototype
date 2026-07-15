import { useState, useRef, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  Alert,
  Steps,
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  Upload,
  Checkbox,
  Radio,
  Descriptions,
  Result,
  Button,
  Row,
  Col,
  message,
  Tooltip,
  Transfer,
  Tag,
  Table
} from 'antd'
import { PlusOutlined, QuestionCircleOutlined, DeleteOutlined } from '@ant-design/icons'
import EmptyState from '../components/EmptyState.jsx'
import { requirementStore, REQUIREMENT_STATUS_MAP } from '../data/requirements.js'
import { projectStore } from '../data/projects.js'
import { validateAndScrollToError, scrollToElement } from '../utils/formValidation.js'

const PURCHASE_MODE_OPTIONS = [
  { label: '公开招标', value: 'open' },
  { label: '邀请招标', value: 'invitation' },
  { label: '公开询比价', value: 'inquiry' },
  { label: '邀请询比价', value: 'invitation_inquiry' }
]

const TENDEREE_MEMBERS = [
  { label: '张三（招标人）', value: 'zhangsan' },
  { label: '王五（法务）', value: 'wangwu' },
  { label: '赵六（财务）', value: 'zhaoliu' }
]

const AGENT_MEMBERS = [
  { label: '李四（招标代理）', value: 'lisi' }
]

const AGENT_OPTIONS = [
  { label: '诚信招标代理有限公司', value: 'agent_01' },
  { label: '国信招标代理股份有限公司', value: 'agent_02' },
  { label: '中机国际招标有限公司', value: 'agent_03' }
]

export default function ProjectCreate() {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)
  const [form] = Form.useForm()
  const uploadRef = useRef(null)

  const [formData, setFormData] = useState({
    name: '',
    code: 'ZB20260708001',
    purchaseMode: 'open',
    budget: '',
    registerStart: null,
    registerEnd: null,
    openTime: null,
    evalLocation: '线上评标大厅',
    intro: '',
    demandSource: '',
    demandCode: '',
    linkedRequirementId: '',
    orgMode: 'self',
    agentId: '',
    agentContractConfirmed: false,
    members: [],
    approvalInfo: '',
    attachments: [],
    packages: [],
    qualifications: ['营业执照'],
    performance: '',
    financial: '',
    credit: '',
    allowConsortium: false,
    invitedBidders: [],
    quoteFields: [
      { key: 'totalPrice', label: '投标报价', unit: '万元', required: true },
      { key: 'delivery', label: '交货期', unit: '', required: true },
      { key: 'quality', label: '质保期', unit: '', required: true },
      { key: 'payment', label: '付款方式', unit: '', required: true }
    ]
  })

  const [inviteCode, setInviteCode] = useState('')

  const publishedRequirements = useMemo(
    () => requirementStore.getPublishedRequirements(),
    []
  )

  const linkedRequirement = useMemo(
    () => publishedRequirements.find((r) => r.id === formData.linkedRequirementId),
    [publishedRequirements, formData.linkedRequirementId]
  )

  const packageBudgetTotal = formData.packages.reduce(
    (sum, p) => sum + (Number(p.budget) || 0),
    0
  )
  const budgetExceeded =
    Number(formData.budget) > 0 && packageBudgetTotal > Number(formData.budget)

  const PACKAGE_REQUIRED_FIELDS = [
    { key: 'name', label: '标段名称' },
    { key: 'code', label: '标段编号' },
    { key: 'budget', label: '预算金额' },
    { key: 'content', label: '标段内容' },
    { key: 'purchaseMode', label: '采购方式' },
    { key: 'bidFee', label: '标书费' },
    { key: 'deposit', label: '保证金' },
    { key: 'bidStart', label: '投标开始时间' },
    { key: 'bidEnd', label: '投标截止时间' }
  ]

  const validatePackages = () => {
    if (formData.packages.length === 0) {
      return '请至少添加一个标段'
    }
    for (let i = 0; i < formData.packages.length; i++) {
      const pkg = formData.packages[i]
      for (const field of PACKAGE_REQUIRED_FIELDS) {
        const value = pkg[field.key]
        if (value === '' || value === null || value === undefined) {
          return `标段 ${i + 1} 缺少${field.label}`
        }
      }
      if (pkg.bidStart && pkg.bidEnd && new Date(pkg.bidEnd) <= new Date(pkg.bidStart)) {
        return `标段 ${i + 1} 的投标截止时间必须晚于投标开始时间`
      }
    }
    if (budgetExceeded) {
      return '标段预算合计超过项目预算，请调整后再继续'
    }
    return null
  }

  const canNext = () => {
    if (activeStep === 0) return true
    if (activeStep === 1) {
      if (formData.orgMode === 'agent') {
        return !!formData.agentId && formData.agentContractConfirmed
      }
      return true
    }
    if (activeStep === 2) {
      if (formData.packages.length === 0 || budgetExceeded) return false
      return !validatePackages()
    }
    return true
  }

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const updateQuoteField = (idx, patch) => {
    setFormData((prev) => ({
      ...prev,
      quoteFields: prev.quoteFields.map((f, i) => (i === idx ? { ...f, ...patch } : f))
    }))
  }
  const addQuoteField = () => {
    setFormData((prev) => ({
      ...prev,
      quoteFields: [...prev.quoteFields, { key: `field-${Date.now()}`, label: '新字段', unit: '', required: false }]
    }))
  }
  const removeQuoteField = (idx) => {
    setFormData((prev) => ({
      ...prev,
      quoteFields: prev.quoteFields.filter((_, i) => i !== idx)
    }))
  }

  const updatePackage = (idx, key, value) => {
    setFormData((prev) => {
      const packages = [...prev.packages]
      packages[idx] = { ...packages[idx], [key]: value }
      return { ...prev, packages }
    })
  }

  const addPackage = () => {
    setFormData((prev) => ({
      ...prev,
      packages: [
        ...prev.packages,
        {
          name: '',
          code: `B${prev.packages.length + 1}`,
          budget: '',
          content: '',
          purchaseMode: prev.purchaseMode || 'open',
          bidFee: '',
          deposit: '',
          bidStart: null,
          bidEnd: null
        }
      ]
    }))
  }

  const removePackage = (idx) => {
    setFormData((prev) => ({
      ...prev,
      packages: prev.packages.filter((_, i) => i !== idx)
    }))
  }

  const formatTime = (t) => {
    if (!t) return '-'
    return new Date(t).toLocaleString()
  }

  const nextStep = async () => {
    if (activeStep === 0) {
      try {
        await form.validateFields()
      } catch (err) {
        validateAndScrollToError(err)
        return
      }
    }
    if (activeStep === 1) {
      if (formData.orgMode === 'agent') {
        if (!formData.agentId) {
          message.warning('请选择代理机构')
          return
        }
        if (!formData.agentContractConfirmed) {
          message.warning('请等待代理机构确认委托合同')
          return
        }
      }
    }
    if (activeStep === 2) {
      const pkgError = validatePackages()
      if (pkgError) {
        message.error(pkgError)
        return
      }
    }
    setActiveStep((s) => s + 1)
  }

  const saveDraft = () => {
    message.success('项目草稿已保存')
  }

  const submit = async () => {
    // 校验基本信息
    try {
      await form.validateFields()
    } catch (err) {
      setActiveStep(0)
      validateAndScrollToError(err)
      return
    }

    // 校验标段设置
    const pkgError = validatePackages()
    if (pkgError) {
      message.error(pkgError)
      setActiveStep(2)
      scrollToElement('.section-header')
      return
    }

    const saved = projectStore.saveProject({
      ...formData,
      status: 'pending',
      submitTime: new Date().toISOString()
    })
    message.success(`项目 ${saved.name} 已提交审核，即将跳转项目列表`)
    navigate({ to: '/admin/projects' })
  }

  const basicRules = {
    name: [{ required: true, message: '请输入项目名称' }],
    purchaseMode: [{ required: true, message: '请选择采购方式' }],
    budget: [
      { required: true, message: '请输入预算金额' },
      {
        validator: (_, value) => {
          if (!value || isNaN(value) || Number(value) <= 0) {
            return Promise.reject(new Error('请输入有效的预算金额'))
          }
          return Promise.resolve()
        }
      }
    ],
    registerStart: [{ required: true, message: '请选择报名开始时间' }],
    registerEnd: [
      { required: true, message: '请选择报名截止时间' },
      {
        validator: (_, value) => {
          if (!formData.registerStart || !value) return Promise.resolve()
          if (new Date(value) <= new Date(formData.registerStart)) {
            return Promise.reject(new Error('报名截止时间必须晚于开始时间'))
          }
          return Promise.resolve()
        }
      }
    ],
    openTime: [{ required: true, message: '请选择开标时间' }],
    intro: [{ required: true, message: '请输入项目简介' }]
  }

  const registeredBidders = [
    { key: 'A科技有限公司', title: 'A科技有限公司', description: '已注册供应商' },
    { key: 'B实业有限公司', title: 'B实业有限公司', description: '已注册供应商' },
    { key: 'C股份有限公司', title: 'C股份有限公司', description: '已注册供应商' },
    { key: 'D集团有限公司', title: 'D集团有限公司', description: '已注册供应商' }
  ]

  const steps = ['基本信息', '需求与成员', '标段设置', '供应商要求', '提交审核']

  const memberOptions = useMemo(() => {
    if (formData.orgMode === 'self') return TENDEREE_MEMBERS
    return [...TENDEREE_MEMBERS, ...AGENT_MEMBERS]
  }, [formData.orgMode])

  const orgModeLabel = {
    self: '自行招标',
    agent: '委托代理'
  }

  return (
    <div className="project-create">
      <Alert
        title="当前办理阶段：项目立项"
        description="请完善项目来源、基本信息、标段和审批信息，所有必填项完成后方可提交审核。"
        type="info"
        showIcon
        closable={false}
      />

      <Steps current={activeStep} items={steps.map((title) => ({ title }))} />

      <Card className="form-card">
        {activeStep === 0 && (
          <>
            <h3>项目基本信息</h3>
            <Form form={form} initialValues={{ purchaseMode: 'open', orgMode: 'self' }} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} className="project-form">
              <Row gutter={20}>
                <Col span={12}>
                  <Form.Item label="项目名称" name="name" rules={basicRules.name}>
                    <Input
                      placeholder="请输入项目名称"
                      maxLength={100}
                      showCount
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="项目编号">
                    <Input placeholder="系统自动生成" disabled value={formData.code} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={20}>
                <Col span={12}>
                  <Form.Item label="采购方式" name="purchaseMode" rules={basicRules.purchaseMode}>
                    <Select
                      placeholder="请选择"
                      value={formData.purchaseMode}
                      onChange={(value) => updateField('purchaseMode', value)}
                      options={PURCHASE_MODE_OPTIONS}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="项目预算" name="budget" rules={basicRules.budget}>
                    <Input
                      placeholder="请输入预算金额"
                      value={formData.budget}
                      onChange={(e) => updateField('budget', e.target.value)}
                      addonAfter="万元"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={20}>
                <Col span={12}>
                  <Form.Item label="报名开始" name="registerStart" rules={basicRules.registerStart}>
                    <DatePicker
                      showTime
                      style={{ width: '100%' }}
                      value={formData.registerStart}
                      onChange={(value) => updateField('registerStart', value)}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="报名截止" name="registerEnd" rules={basicRules.registerEnd}>
                    <DatePicker
                      showTime
                      style={{ width: '100%' }}
                      value={formData.registerEnd}
                      onChange={(value) => updateField('registerEnd', value)}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={20}>
                <Col span={12}>
                  <Form.Item label="开标时间" name="openTime" rules={basicRules.openTime}>
                    <DatePicker
                      showTime
                      style={{ width: '100%' }}
                      value={formData.openTime}
                      onChange={(value) => updateField('openTime', value)}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="评标地点">
                    <Input
                      placeholder="线上评标/线下地点"
                      value={formData.evalLocation}
                      onChange={(e) => updateField('evalLocation', e.target.value)}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item label="组织方式" name="orgMode">
                <Radio.Group
                  value={formData.orgMode}
                  onChange={(e) => {
                    const orgMode = e.target.value
                    setFormData((prev) => ({
                      ...prev,
                      orgMode,
                      agentId: '',
                      agentContractConfirmed: false,
                      members: orgMode === 'self'
                        ? prev.members.filter((m) => !AGENT_MEMBERS.some((a) => a.value === m))
                        : prev.members
                    }))
                  }}
                >
                  <Radio value="self">自行招标</Radio>
                  <Radio value="agent">委托代理</Radio>
                </Radio.Group>
              </Form.Item>
              {formData.orgMode === 'agent' && (
                <Row gutter={20}>
                  <Col span={12}>
                    <Form.Item label="代理机构">
                      <Select
                        placeholder="请选择代理机构"
                        value={formData.agentId || undefined}
                        onChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            agentId: value,
                            agentContractConfirmed: false,
                            members: prev.members.filter(
                              (m) => !AGENT_MEMBERS.some((a) => a.value === m)
                            )
                          }))
                        }
                        options={AGENT_OPTIONS}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="委托合同">
                      <Button
                        type={formData.agentContractConfirmed ? 'default' : 'primary'}
                        disabled={!formData.agentId || formData.agentContractConfirmed}
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            agentContractConfirmed: true,
                            members: Array.from(new Set([...prev.members, 'lisi']))
                          }))
                          message.success('代理机构已确认委托合同')
                        }}
                      >
                        {formData.agentContractConfirmed ? '已确认委托合同' : '发送合同确认'}
                      </Button>
                      {!formData.agentId && (
                        <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
                          请先选择代理机构
                        </div>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
              )}
              <Form.Item label="项目简介" name="intro" rules={basicRules.intro}>
                <Input.TextArea
                  rows={4}
                  placeholder="描述项目背景、范围、目标等"
                  maxLength={500}
                  showCount
                  value={formData.intro}
                  onChange={(e) => updateField('intro', e.target.value)}
                />
              </Form.Item>
            </Form>
          </>
        )}

        {activeStep === 1 && (
          <>
            <h3>采购需求来源与项目成员</h3>
            <Form layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
              <Row gutter={20}>
                <Col span={12}>
                  <Form.Item label="关联采购需求">
                    <Select
                      placeholder="选择已发布/已审核的采购需求"
                      value={formData.linkedRequirementId || undefined}
                      onChange={(value) => {
                        const req = publishedRequirements.find((r) => r.id === value)
                        setFormData((prev) => ({
                          ...prev,
                          linkedRequirementId: value || '',
                          demandSource: value ? 'requirement' : prev.demandSource,
                          demandCode: value ? (req?.id || prev.demandCode) : prev.demandCode,
                          budget: value && !prev.budget ? String(req?.budget || '') : prev.budget,
                          intro: value && !prev.intro
                            ? (req?.content ? req.content.slice(0, 120) : '')
                            : prev.intro
                        }))
                      }}
                      allowClear
                      options={publishedRequirements.map((r) => ({
                        label: `${r.id} - ${r.title}`,
                        value: r.id
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="需求来源">
                    <Select
                      placeholder="请选择需求来源"
                      value={formData.demandSource || undefined}
                      onChange={(value) => updateField('demandSource', value)}
                      options={[
                        { label: '年度采购计划', value: 'plan' },
                        { label: '临时采购申请', value: 'temp' },
                        { label: '采购需求库', value: 'requirement' },
                        { label: '项目变更', value: 'change' },
                        { label: '其他', value: 'other' }
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>
              {linkedRequirement && (
                <Row gutter={20}>
                  <Col span={24}>
                    <Form.Item label="需求概要">
                      <Card size="small" className="linked-requirement-card">
                        <Descriptions size="small" column={3}>
                          <Descriptions.Item label="需求编号">{linkedRequirement.id}</Descriptions.Item>
                          <Descriptions.Item label="需求类型">
                            {requirementStore.getTypes().find((t) => t.value === linkedRequirement.type)?.label || linkedRequirement.type}
                          </Descriptions.Item>
                          <Descriptions.Item label="预算金额">{linkedRequirement.budget} 万元</Descriptions.Item>
                          <Descriptions.Item label="状态">
                            <Tag color={REQUIREMENT_STATUS_MAP[linkedRequirement.status]?.color}>
                              {REQUIREMENT_STATUS_MAP[linkedRequirement.status]?.label}
                            </Tag>
                          </Descriptions.Item>
                          <Descriptions.Item label="需求标题" span={2}>
                            {linkedRequirement.title}
                          </Descriptions.Item>
                        </Descriptions>
                      </Card>
                    </Form.Item>
                  </Col>
                </Row>
              )}
              <Row gutter={20}>
                <Col span={12}>
                  <Form.Item
                    label={
                      <span>
                        需求编号
                        <Tooltip title="关联年度采购计划或临时采购申请单号，非必填">
                          <QuestionCircleOutlined style={{ marginLeft: 6, color: '#999' }} />
                        </Tooltip>
                      </span>
                    }
                  >
                    <Input
                      placeholder="关联年度采购计划或临时采购申请单号，非必填"
                      value={formData.demandCode}
                      onChange={(e) => updateField('demandCode', e.target.value)}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="项目成员">
                    <Select
                      mode="multiple"
                      placeholder={
                        formData.orgMode === 'agent' && !formData.agentContractConfirmed
                          ? '请先确认委托合同'
                          : '选择项目成员'
                      }
                      value={formData.members}
                      onChange={(value) => updateField('members', value)}
                      options={memberOptions}
                      disabled={formData.orgMode === 'agent' && !formData.agentContractConfirmed}
                    />
                    {formData.orgMode === 'agent' && formData.agentContractConfirmed && (
                      <div style={{ color: '#666', fontSize: 12, marginTop: 4 }}>
                        代理机构人员（李四）已自动加入项目成员
                      </div>
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item label="审批信息">
                <Input.TextArea
                  rows={3}
                  placeholder="填写审批链、审批人及审批意见摘要"
                  value={formData.approvalInfo}
                  onChange={(e) => updateField('approvalInfo', e.target.value)}
                />
              </Form.Item>
              <Form.Item label="附件上传">
                <Upload
                  ref={uploadRef}
                  fileList={formData.attachments}
                  onChange={({ fileList }) => updateField('attachments', fileList)}
                  beforeUpload={() => false}
                  multiple
                >
                  <Button type="primary">上传立项附件</Button>
                </Upload>
                <div style={{ color: '#999', fontSize: 12, marginTop: 8 }}>支持 PDF、DOC、ZIP，单个不超过 100MB</div>
              </Form.Item>
            </Form>
          </>
        )}

        {activeStep === 2 && (
          <>
            <div className="section-header">
              <div>
                <h3>标段/包件设置</h3>
                <p className="section-tip">
                  项目预算：{formData.budget || 0} 万元 · 标段预算合计：{packageBudgetTotal} 万元
                  {budgetExceeded && (
                    <span style={{ color: '#ff4d4f', marginLeft: 12 }}>
                      标段预算合计超过项目预算
                    </span>
                  )}
                </p>
              </div>
              <Button type="primary" icon={<PlusOutlined />} onClick={addPackage}>添加标段</Button>
            </div>
            {formData.packages.length === 0 && (
              <EmptyState description="暂无标段，请添加" icon="Folder" />
            )}
            {formData.packages.map((pkg, idx) => (
              <Card
                key={idx}
                title={<div className="package-header"><span>标段 {idx + 1}：{pkg.name || '未命名标段'}</span></div>}
                extra={<Button type="link" danger onClick={() => removePackage(idx)}>删除</Button>}
                className="package-card"
              >
                <Row gutter={20}>
                  <Col span={8}>
                    <Form.Item label="标段名称">
                      <Input
                        placeholder="例如：第一标段"
                        value={pkg.name}
                        onChange={(e) => updatePackage(idx, 'name', e.target.value)}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="标段编号">
                      <Input
                        placeholder="例如：B1"
                        value={pkg.code}
                        onChange={(e) => updatePackage(idx, 'code', e.target.value)}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="预算金额">
                      <Input
                        placeholder="万元"
                        value={pkg.budget}
                        onChange={(e) => updatePackage(idx, 'budget', e.target.value)}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={20}>
                  <Col span={8}>
                    <Form.Item label="采购方式">
                      <Select
                        placeholder="请选择"
                        value={pkg.purchaseMode}
                        onChange={(value) => updatePackage(idx, 'purchaseMode', value)}
                        options={PURCHASE_MODE_OPTIONS}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="标书费">
                      <Input
                        placeholder="元"
                        value={pkg.bidFee}
                        onChange={(e) => updatePackage(idx, 'bidFee', e.target.value)}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="保证金">
                      <Input
                        placeholder="元"
                        value={pkg.deposit}
                        onChange={(e) => updatePackage(idx, 'deposit', e.target.value)}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={20}>
                  <Col span={12}>
                    <Form.Item label="投标开始时间">
                      <DatePicker
                        showTime
                        style={{ width: '100%' }}
                        placeholder="投标开始时间"
                        value={pkg.bidStart}
                        onChange={(value) => updatePackage(idx, 'bidStart', value)}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="投标截止时间">
                      <DatePicker
                        showTime
                        style={{ width: '100%' }}
                        placeholder="投标截止时间"
                        value={pkg.bidEnd}
                        onChange={(value) => updatePackage(idx, 'bidEnd', value)}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item label="标段内容">
                  <Input.TextArea
                    rows={2}
                    placeholder="描述本标段采购内容"
                    value={pkg.content}
                    onChange={(e) => updatePackage(idx, 'content', e.target.value)}
                  />
                </Form.Item>
              </Card>
            ))}

            <Card title="报价字段模板" size="small" style={{ marginTop: 16 }}>
              <p className="section-tip">配置本项目在线报价页所需的报价字段，投标人填写报价时按此模板渲染。</p>
              <Table
                rowKey="key"
                dataSource={formData.quoteFields}
                pagination={false}
                size="small"
                bordered
                columns={[
                  {
                    title: '字段名称',
                    dataIndex: 'label',
                    render: (value, _, idx) => (
                      <Input size="small" value={value} onChange={(e) => updateQuoteField(idx, { label: e.target.value })} />
                    )
                  },
                  {
                    title: '字段标识',
                    dataIndex: 'key',
                    width: 160,
                    render: (value, _, idx) => (
                      <Input size="small" value={value} onChange={(e) => updateQuoteField(idx, { key: e.target.value })} />
                    )
                  },
                  {
                    title: '单位',
                    dataIndex: 'unit',
                    width: 120,
                    render: (value, _, idx) => (
                      <Input size="small" value={value} onChange={(e) => updateQuoteField(idx, { unit: e.target.value })} />
                    )
                  },
                  {
                    title: '必填',
                    dataIndex: 'required',
                    width: 80,
                    render: (value, _, idx) => (
                      <Checkbox checked={value} onChange={(e) => updateQuoteField(idx, { required: e.target.checked })} />
                    )
                  },
                  {
                    title: '操作',
                    width: 80,
                    render: (_, __, idx) => (
                      <Button
                        type="link"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        disabled={formData.quoteFields.length <= 1}
                        onClick={() => removeQuoteField(idx)}
                      />
                    )
                  }
                ]}
              />
              <Button size="small" type="dashed" icon={<PlusOutlined />} style={{ marginTop: 8 }} onClick={addQuoteField}>
                添加报价字段
              </Button>
            </Card>

            {formData.purchaseMode === 'invitation' && (
              <Card title="邀请投标人" size="small" className="invite-card" style={{ marginTop: 16 }}>
                <p className="section-tip">请从平台已注册企业中选择被邀请人，或输入邀请码邀请外部企业。</p>
                <Transfer
                  dataSource={registeredBidders}
                  titles={['平台注册企业', '已邀请企业']}
                  targetKeys={formData.invitedBidders}
                  onChange={(next) => updateField('invitedBidders', next)}
                  render={(item) => item.title}
                  listStyle={{ width: 260, height: 260 }}
                />
                <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
                  <Input
                    placeholder="输入外部企业邀请码"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    style={{ width: 260 }}
                  />
                  <Button
                    disabled={!inviteCode}
                    onClick={() => {
                      message.success(`已发送邀请码 ${inviteCode} 的邀请`)
                      setInviteCode('')
                    }}
                  >
                    添加邀请码
                  </Button>
                </div>
              </Card>
            )}
          </>
        )}

        {activeStep === 3 && (
          <>
            <h3>供应商资格要求</h3>
            <Form layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
              <Form.Item label="资质要求">
                <Checkbox.Group
                  value={formData.qualifications}
                  onChange={(value) => updateField('qualifications', value)}
                  options={[
                    { label: '营业执照', value: '营业执照' },
                    { label: '税务登记证', value: '税务登记证' },
                    { label: '组织机构代码证', value: '组织机构代码证' },
                    { label: 'ISO9001认证', value: 'ISO9001认证' },
                    { label: '安全生产许可证', value: '安全生产许可证' },
                    { label: '特定行业资质', value: '特定行业资质' }
                  ]}
                />
              </Form.Item>
              <Form.Item label="业绩要求">
                <Input.TextArea
                  rows={3}
                  placeholder="近3年类似项目业绩要求"
                  value={formData.performance}
                  onChange={(e) => updateField('performance', e.target.value)}
                />
              </Form.Item>
              <Form.Item label="财务要求">
                <Input
                  placeholder="例如：注册资本不低于100万"
                  value={formData.financial}
                  onChange={(e) => updateField('financial', e.target.value)}
                />
              </Form.Item>
              <Form.Item label="信誉要求">
                <Input.TextArea
                  rows={2}
                  placeholder="无重大违法记录、未被列入失信名单等"
                  value={formData.credit}
                  onChange={(e) => updateField('credit', e.target.value)}
                />
              </Form.Item>
              <Form.Item label="是否允许联合体">
                <Radio.Group
                  value={formData.allowConsortium}
                  onChange={(e) => updateField('allowConsortium', e.target.value)}
                >
                  <Radio value={true}>允许</Radio>
                  <Radio value={false}>不允许</Radio>
                </Radio.Group>
              </Form.Item>
            </Form>
          </>
        )}

        {activeStep === 4 && (
          <Result
            status="success"
            title="项目信息填写完成"
            subTitle="请确认以下信息无误后提交审核"
            extra={
              <>
                <Descriptions column={2} bordered>
                  <Descriptions.Item label="项目名称">{formData.name || '-'}</Descriptions.Item>
                  <Descriptions.Item label="组织方式">{orgModeLabel[formData.orgMode] || '-'}</Descriptions.Item>
                  <Descriptions.Item label="采购方式">{PURCHASE_MODE_OPTIONS.find((o) => o.value === formData.purchaseMode)?.label || '-'}</Descriptions.Item>
                  <Descriptions.Item label="项目预算">{formData.budget || '-'} 万元</Descriptions.Item>
                  <Descriptions.Item label="标段预算合计">{packageBudgetTotal} 万元</Descriptions.Item>
                  <Descriptions.Item label="开标时间">{formatTime(formData.openTime)}</Descriptions.Item>
                  <Descriptions.Item label="标段数量">{formData.packages.length} 个</Descriptions.Item>
                  <Descriptions.Item label="关联采购需求">
                    {linkedRequirement ? `${linkedRequirement.id} ${linkedRequirement.title}` : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="需求来源">{formData.demandSource || '-'}</Descriptions.Item>
                  <Descriptions.Item label="项目成员">{formData.members.join('、') || '-'}</Descriptions.Item>
                  <Descriptions.Item label="代理机构">{formData.orgMode === 'agent' ? (AGENT_OPTIONS.find((a) => a.value === formData.agentId)?.label || '-') : '-'}</Descriptions.Item>
                  <Descriptions.Item label="资质要求">{formData.qualifications.join('、') || '-'}</Descriptions.Item>
                </Descriptions>
                {formData.packages.length > 0 && (
                  <Card size="small" title="标段费用与时间" style={{ marginTop: 16, textAlign: 'left' }}>
                    {formData.packages.map((pkg, idx) => (
                      <div key={idx} className="package-review-row">
                        <strong>标段 {idx + 1} {pkg.name || pkg.code}</strong>
                        <span>采购方式：{PURCHASE_MODE_OPTIONS.find((o) => o.value === pkg.purchaseMode)?.label || '-'}</span>
                        <span>标书费：{pkg.bidFee || '-'} 元</span>
                        <span>保证金：{pkg.deposit || '-'} 元</span>
                        <span>投标开始：{formatTime(pkg.bidStart)}</span>
                        <span>投标截止：{formatTime(pkg.bidEnd)}</span>
                      </div>
                    ))}
                  </Card>
                )}
                <div style={{ marginTop: 20 }}>
                  <Button type="primary" onClick={submit}>提交审核</Button>
                  <Button onClick={() => setActiveStep(0)}>返回修改</Button>
                </div>
              </>
            }
          />
        )}

        {activeStep < 4 && (
          <div className="step-actions">
            {activeStep > 0 && <Button onClick={() => setActiveStep((s) => s - 1)}>上一步</Button>}
            <Button type="primary" disabled={!canNext()} onClick={nextStep}>下一步</Button>
            <Button onClick={saveDraft}>保存草稿</Button>
          </div>
        )}
      </Card>

      <style>{`
        .project-create {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .form-card {
          min-height: 500px;
        }
        .project-form {
          margin-top: 20px;
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .section-tip {
          color: #666;
          font-size: 13px;
          margin: 4px 0 0;
        }
        .package-card {
          margin-bottom: 16px;
          background: #fafafa;
        }
        .package-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
        }
        .step-actions {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-top: 30px;
        }
        .linked-requirement-card {
          background: #f6ffed;
          border-color: #b7eb8f;
        }
        .package-review-row {
          display: grid;
          grid-template-columns: 1.5fr repeat(5, 1fr);
          gap: 12px;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
          align-items: center;
        }
        .package-review-row:last-child {
          border-bottom: none;
        }
      `}</style>
    </div>
  )
}
