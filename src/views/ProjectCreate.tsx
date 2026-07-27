// 创建项目（2026-07-27 口径，docs/20260727-会议记录概要.md 五.5）：
// 五步向导合并为整页一次填完；最小必要字段（可缺了补，不多了删）；
// 项目编号自动生成不可编辑；采购需求页内直接创建（需求说明 + 附件上传，上传优先），
// 不再关联外部需求库；提交即生成「项目立项」审批单（平台唯一审核点）。
import { useState, useEffect } from 'react'
import type { ComponentType } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import dayjs, { Dayjs } from 'dayjs'
import {
  Alert,
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  Upload,
  Checkbox,
  Radio,
  Descriptions,
  Button,
  Row,
  Col,
  message
} from 'antd'
import type { UploadFile } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import EmptyStateBase from '../components/EmptyState.jsx'
import { projectStore } from '../data/projects.js'
import { approvalStore } from '../data/approvalStore.js'
import { BASELINE_PROJECTS } from './ProjectList.jsx'
import { useRole } from '../hooks/useRole.js'
import {
  validateAndScrollToError,
  scrollToElement,
  formRules,
  validateRequiredFields
} from '../utils/formValidation.js'

// EmptyState 为 @ts-nocheck 的 jsx 组件，其推断 props 全部必填；此处收窄为本页实际使用的可选 props
const EmptyState = EmptyStateBase as ComponentType<{
  description?: string
  icon?: string
  reason?: string
}>

const PURCHASE_MODE_OPTIONS = [
  { label: '阳光采购', value: 'open' },
  { label: '邀请采购', value: 'invitation' },
  { label: '阳光询比', value: 'inquiry' },
  { label: '邀请询比', value: 'invitation_inquiry' }
]

const AGENT_OPTIONS = [
  { label: '诚信采购代理有限公司', value: 'agent_01' },
  { label: '国信采购代理股份有限公司', value: 'agent_02' },
  { label: '中机国际采购有限公司', value: 'agent_03' }
]

interface PackageItem {
  name: string
  code: string
  budget: string
  purchaseMode: string
  /** 采购清单 Excel（0727 口径：每包单独导入一份，导什么认什么，系统不校验内容） */
  listFile: UploadFile[]
}

interface ProjectFormData {
  id?: string | number
  status?: string
  submitTime?: string
  createTime?: string
  name: string
  code: string
  budget: string
  openTime: Dayjs | null
  evalLocation: string
  intro: string
  demandText: string
  orgMode: 'self' | 'agent'
  agentId: string
  agentContractConfirmed: boolean
  attachments: UploadFile[]
  /** 共性时间（0727 口径：全部采购包统一填一次，保存时写入每个包） */
  bidStart: Dayjs | null
  bidEnd: Dayjs | null
  packages: PackageItem[]
  qualifications: string[]
  allowConsortium: boolean
}

// 基本信息 Form 托管字段（编号自动生成、需求说明/附件/采购包等非 Form 托管字段单独校验）
interface BasicFormValues {
  name?: string
  budget?: string
  openTime?: Dayjs | null
  intro?: string
  orgMode?: 'self' | 'agent'
}

// 项目编号自动生成（ZB + 日期 + 时序尾号），不可编辑
function generateProjectCode() {
  return `ZB${dayjs().format('YYYYMMDD')}${String(Date.now()).slice(-3)}`
}

const formatTime = (t: Dayjs | string | null | undefined) => {
  if (!t) return '-'
  return dayjs(t).format('YYYY-MM-DD HH:mm')
}

// 保存前把时间字段序列化为字符串，保证 localStorage 持久化后可被 dayjs 还原；
// 共性时间同步写入每个采购包（下游 ProjectList/BidderProjects/TenderDoc 等按 packages[0].bidEnd 读取）
function serializeFormData(formData: ProjectFormData) {
  const bidStart = formData.bidStart ? formData.bidStart.format('YYYY-MM-DD HH:mm') : ''
  const bidEnd = formData.bidEnd ? formData.bidEnd.format('YYYY-MM-DD HH:mm') : ''
  return {
    ...formData,
    openTime: formData.openTime ? formData.openTime.format('YYYY-MM-DD HH:mm') : '',
    bidStart,
    bidEnd,
    packages: formData.packages.map((pkg) => ({ ...pkg, bidStart, bidEnd }))
  }
}

export default function ProjectCreate() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false }) as Record<string, unknown>
  const editId = searchParams.editId ? String(searchParams.editId) : ''
  const { role, userName } = useRole()
  // 代理创建项目默认「委托代理」组织方式（agent-project-requirement-management-20260721）
  const defaultOrgMode: 'self' | 'agent' = role === 'agent' ? 'agent' : 'self'
  const [form] = Form.useForm<BasicFormValues>()

  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    code: generateProjectCode(),
    budget: '',
    openTime: null,
    evalLocation: '线上评审大厅',
    intro: '',
    demandText: '',
    orgMode: defaultOrgMode,
    agentId: '',
    agentContractConfirmed: false,
    attachments: [],
    bidStart: null,
    bidEnd: null,
    packages: [],
    qualifications: ['营业执照'],
    allowConsortium: false
  })

  // 编辑模式：从 projectStore 载入既有项目（localStorage 持久化），mock 基线兜底，时间字段还原为 dayjs 对象
  useEffect(() => {
    if (!editId) return
    const stored =
      projectStore.getProjectById(editId) ||
      BASELINE_PROJECTS.find((p: { id: string | number }) => String(p.id) === editId)
    if (!stored) {
      message.warning('未找到要编辑的项目，将按新建处理')
      return
    }
    const toDayjs = (v: string | null | undefined) => (v ? dayjs(v) : null)
    const restored = {
      ...stored,
      openTime: toDayjs(stored.openTime),
      // 共性时间：新项目在项目级，存量项目从首个采购包回填
      bidStart: toDayjs(stored.bidStart || stored.packages?.[0]?.bidStart),
      bidEnd: toDayjs(stored.bidEnd || stored.packages?.[0]?.bidEnd),
      demandText: stored.demandText || '',
      attachments: stored.attachments || [],
      packages: (stored.packages || []).map((pkg: Record<string, unknown>) => ({
        ...pkg,
        listFile: (pkg.listFile as UploadFile[]) || []
      }))
    } as ProjectFormData
    setFormData((prev) => ({ ...prev, ...restored }))
    form.setFieldsValue({
      name: restored.name,
      budget: restored.budget,
      openTime: restored.openTime,
      intro: restored.intro,
      orgMode: restored.orgMode || 'self'
    })
  }, [editId, form])

  const packageBudgetTotal = formData.packages.reduce(
    (sum, p) => sum + (Number(p.budget) || 0),
    0
  )
  const budgetExceeded =
    Number(formData.budget) > 0 && packageBudgetTotal > Number(formData.budget)

  const PACKAGE_REQUIRED_FIELDS: { key: keyof PackageItem; label: string }[] = [
    { key: 'name', label: '采购包名称' },
    { key: 'budget', label: '预算金额' },
    { key: 'purchaseMode', label: '采购方式' }
  ]

  const validatePackages = (): string | null => {
    if (formData.packages.length === 0) {
      return '请至少添加一个采购包'
    }
    for (let i = 0; i < formData.packages.length; i++) {
      const pkg = formData.packages[i]
      for (const field of PACKAGE_REQUIRED_FIELDS) {
        const value = pkg[field.key]
        if (value === '' || value === null || value === undefined) {
          return `采购包 ${i + 1} 缺少${field.label}`
        }
      }
      if (!pkg.listFile || pkg.listFile.length === 0) {
        return `采购包 ${i + 1} 请上传采购清单 Excel`
      }
    }
    if (budgetExceeded) {
      return '采购包预算合计超过项目预算，请调整后再继续'
    }
    return null
  }

  const updateField = <K extends keyof ProjectFormData>(key: K, value: ProjectFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const updatePackage = <K extends keyof PackageItem>(idx: number, key: K, value: PackageItem[K]) => {
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
          // 编号自动生成（B1、B2…），无需手填
          code: `B${prev.packages.length + 1}`,
          budget: '',
          // 采购包级采购方式默认「阳光采购」（cxy-016：项目级采购方式已移除）
          purchaseMode: 'open',
          listFile: []
        }
      ]
    }))
  }

  const removePackage = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      packages: prev.packages.filter((_, i) => i !== idx)
    }))
  }

  const saveDraft = () => {
    try {
      const saved = projectStore.saveProject({
        ...serializeFormData(formData),
        id: editId || formData.id || '',
        name: formData.name?.trim() || '未命名项目',
        // 编辑既有项目时保持原状态，仅新建/草稿保存为「草稿」
        status: formData.status && formData.status !== 'draft' ? formData.status : 'draft',
        updateTime: new Date().toISOString()
      })
      message.success(`已保存（${saved.name}），可在项目列表查看`)
      navigate({ to: '/admin/projects' })
    } catch {
      message.error('草稿保存失败，请重试')
    }
  }

  const submit = async () => {
    // 手动兜底校验基本信息（Form 校验之外的二次确认）
    const basicCheck = validateRequiredFields([
      { key: 'name', value: formData.name, label: '项目名称' },
      { key: 'budget', value: formData.budget, label: '项目预算' },
      { key: 'openTime', value: formData.openTime, label: '开启时间' },
      { key: 'intro', value: formData.intro, label: '项目简介' }
    ])
    if (!basicCheck.valid) {
      const firstInvalid = basicCheck.firstInvalid as { label?: string } | undefined
      message.error(`请完善基本信息：${firstInvalid?.label || '必填项'} 未填写`)
      scrollToElement('.project-create')
      return
    }
    if (isNaN(Number(formData.budget)) || Number(formData.budget) <= 0) {
      message.error('项目预算需为大于 0 的有效数字')
      scrollToElement('.project-create')
      return
    }

    // 校验 Form 托管的基本信息字段
    try {
      await form.validateFields()
    } catch (err) {
      validateAndScrollToError(err as object)
      return
    }

    // 委托代理必须先选择代理机构并确认委托合同
    if (formData.orgMode === 'agent') {
      if (!formData.agentId) {
        message.warning('请选择代理机构')
        scrollToElement('.project-create')
        return
      }
      if (!formData.agentContractConfirmed) {
        message.warning('请等待代理机构确认委托合同')
        scrollToElement('.project-create')
        return
      }
    }

    // 共性时间：全部采购包统一（0727 口径）
    if (!formData.bidStart || !formData.bidEnd) {
      message.error('请填写响应开始时间与采购截止时间（全部采购包统一）')
      scrollToElement('.section-header')
      return
    }
    if (formData.bidEnd.valueOf() <= formData.bidStart.valueOf()) {
      message.error('采购截止时间必须晚于响应开始时间')
      scrollToElement('.section-header')
      return
    }

    // 校验采购包设置
    const pkgError = validatePackages()
    if (pkgError) {
      message.error(pkgError)
      scrollToElement('.section-header')
      return
    }

    try {
      // 编辑非草稿项目时保持原状态，避免「提交审核」把采购中项目退回待审核
      const nextStatus = formData.status && formData.status !== 'draft' ? formData.status : 'pending'
      const saved = projectStore.saveProject({
        ...serializeFormData(formData),
        id: editId || formData.id || '',
        status: nextStatus,
        submitTime: formData.submitTime || new Date().toISOString()
      })
      if (nextStatus === 'pending') {
        // 平台唯一审核点（2026-07-27 口径）：提交即真实创建项目立项审批单（localStorage 持久化）
        approvalStore.create({
          type: 'project',
          refId: saved.id,
          title: `${saved.name} 立项审批`,
          publisherKind: role === 'agent' ? 'agent' : 'self',
          submittedBy: userName,
          projectId: saved.id
        })
        message.success(`项目「${saved.name}」已提交审核（待审核），立项审批单已生成，可在审批中心跟踪进度`)
      } else {
        message.success(`项目「${saved.name}」修改已保存`)
      }
      navigate({ to: '/admin/projects' })
    } catch {
      message.error('提交失败，请重试')
    }
  }

  const basicRules = {
    name: [formRules.required('请输入项目名称'), formRules.maxLength(100)],
    budget: [formRules.required('请输入预算金额'), formRules.positiveNumber('请输入有效的预算金额')],
    openTime: [formRules.required('请选择开启时间')],
    intro: [formRules.required('请输入项目简介'), formRules.maxLength(500)]
  }

  const orgModeLabel: Record<string, string> = {
    self: '自行采购',
    agent: '委托代理'
  }

  return (
    <div className="project-create">
      <Alert
        title="当前办理阶段：项目立项"
        description="整页一次填完即可提交；项目编号自动生成，采购需求可直接上传附件，采购包清单直接上传 Excel。提交后生成「项目立项」审批单，审批通过后方可发布采购。"
        type="info"
        showIcon
        closable={false}
      />

      <Card title="项目基本信息" className="form-card">
        <Form form={form} initialValues={{ orgMode: defaultOrgMode }} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} className="project-form">
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
              <Form.Item label="项目预算" name="budget" rules={basicRules.budget}>
                <Input
                  placeholder="请输入预算金额"
                  value={formData.budget}
                  onChange={(e) => updateField('budget', e.target.value)}
                  suffix="万元"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={20}>
            <Col span={12}>
              <Form.Item label="开启时间" name="openTime" rules={basicRules.openTime}>
                <DatePicker
                  showTime
                  style={{ width: '100%' }}
                  value={formData.openTime}
                  onChange={(value) => updateField('openTime', value)}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="评审地点">
                <Input
                  placeholder="线上评审/线下地点"
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
                const orgMode = e.target.value as 'self' | 'agent'
                setFormData((prev) => ({
                  ...prev,
                  orgMode,
                  agentId: '',
                  agentContractConfirmed: false
                }))
              }}
            >
              <Radio value="self">自行采购</Radio>
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
                        agentContractConfirmed: false
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
                      setFormData((prev) => ({ ...prev, agentContractConfirmed: true }))
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
      </Card>

      <Card title="采购需求" className="form-card">
        <Form layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
          <Form.Item label="需求说明">
            <Input.TextArea
              rows={4}
              placeholder="填写采购需求内容（有正式需求文件时可直接在下方上传，无需手工填写）"
              maxLength={1000}
              showCount
              value={formData.demandText}
              onChange={(e) => updateField('demandText', e.target.value)}
            />
          </Form.Item>
          <Form.Item label="需求附件">
            <Upload
              fileList={formData.attachments}
              onChange={({ fileList }) => updateField('attachments', fileList)}
              beforeUpload={() => false}
              multiple
            >
              <Button type="primary">上传需求附件</Button>
            </Upload>
            <div style={{ color: '#999', fontSize: 12, marginTop: 8 }}>
              支持 PDF、DOC、ZIP，单个不超过 100MB；能上传文件的内容优先上传，不必手工填写
            </div>
          </Form.Item>
        </Form>
      </Card>

      <Card className="form-card">
        <div className="section-header">
          <div>
            <h3>采购包/包件设置</h3>
            <p className="section-tip">
              项目预算：{formData.budget || 0} 万元 · 采购包预算合计：{packageBudgetTotal} 万元
              {budgetExceeded && (
                <span style={{ color: '#ff4d4f', marginLeft: 12 }}>
                  采购包预算合计超过项目预算
                </span>
              )}
            </p>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={addPackage}>添加采购包</Button>
        </div>
        <Card size="small" title="共性时间（全部采购包统一，只需填一次）" style={{ marginBottom: 16 }}>
          <Row gutter={20}>
            <Col span={12}>
              <Form.Item label="响应开始时间" required>
                <DatePicker
                  showTime
                  style={{ width: '100%' }}
                  placeholder="响应开始时间"
                  value={formData.bidStart}
                  onChange={(value) => updateField('bidStart', value)}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="采购截止时间" required>
                <DatePicker
                  showTime
                  style={{ width: '100%' }}
                  placeholder="采购截止时间"
                  value={formData.bidEnd}
                  onChange={(value) => updateField('bidEnd', value)}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>
        {formData.packages.length === 0 && (
          <EmptyState description="暂无采购包，请添加" icon="Folder" />
        )}
        {formData.packages.map((pkg, idx) => (
          <Card
            key={idx}
            title={<div className="package-header"><span>采购包 {idx + 1}：{pkg.name || '未命名采购包'}</span></div>}
            extra={<Button type="link" danger onClick={() => removePackage(idx)}>删除</Button>}
            className="package-card"
          >
            <Row gutter={20}>
              <Col span={8}>
                <Form.Item label="采购包名称" required>
                  <Input
                    placeholder="例如：第一采购包"
                    value={pkg.name}
                    onChange={(e) => updatePackage(idx, 'name', e.target.value)}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="采购包编号">
                  <Input placeholder="自动生成" disabled value={pkg.code} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="预算金额" required>
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
                <Form.Item label="采购方式" required>
                  <Select
                    placeholder="请选择"
                    value={pkg.purchaseMode}
                    onChange={(value) => updatePackage(idx, 'purchaseMode', value)}
                    options={PURCHASE_MODE_OPTIONS}
                  />
                </Form.Item>
              </Col>
              <Col span={16}>
                <Form.Item label="采购清单（Excel）" required>
                  <Upload
                    fileList={pkg.listFile}
                    onChange={({ fileList }) => updatePackage(idx, 'listFile', fileList.slice(-1))}
                    beforeUpload={() => false}
                    accept=".xlsx,.xls,.csv"
                  >
                    <Button type="primary">上传清单 Excel</Button>
                  </Upload>
                  <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
                    每个采购包导入一份清单，导什么认什么，系统不校验清单内容
                  </div>
                </Form.Item>
              </Col>
            </Row>
          </Card>
        ))}
      </Card>

      <Card title="供应商要求" className="form-card">
        <Form layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
          <Form.Item label="资质要求">
            <Checkbox.Group
              value={formData.qualifications}
              onChange={(value) => updateField('qualifications', value as string[])}
              options={[
                { label: '营业执照', value: '营业执照' },
                { label: '税务登记证', value: '税务登记证' },
                { label: '组织机构代码证', value: '组织机构代码证' },
                { label: 'ISO9001认证或相关证书', value: 'ISO9001认证或相关证书' },
                { label: '安全生产许可证', value: '安全生产许可证' },
                { label: '特定行业资质', value: '特定行业资质' }
              ]}
            />
          </Form.Item>
          <Form.Item label="是否允许联合体">
            <Radio.Group
              value={formData.allowConsortium}
              onChange={(e) => updateField('allowConsortium', e.target.value as boolean)}
            >
              <Radio value={true}>允许</Radio>
              <Radio value={false}>不允许</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Card>

      <Card title="提交前确认" className="form-card">
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="项目名称">{formData.name || '-'}</Descriptions.Item>
          <Descriptions.Item label="项目编号">{formData.code || '-'}</Descriptions.Item>
          <Descriptions.Item label="组织方式">{orgModeLabel[formData.orgMode] || '-'}</Descriptions.Item>
          <Descriptions.Item label="项目预算">{formData.budget || '-'} 万元</Descriptions.Item>
          <Descriptions.Item label="开启时间">{formatTime(formData.openTime)}</Descriptions.Item>
          <Descriptions.Item label="响应开始">{formatTime(formData.bidStart)}</Descriptions.Item>
          <Descriptions.Item label="采购截止">{formatTime(formData.bidEnd)}</Descriptions.Item>
          <Descriptions.Item label="采购包预算合计">{packageBudgetTotal} 万元</Descriptions.Item>
          <Descriptions.Item label="采购包数量">{formData.packages.length} 个</Descriptions.Item>
          <Descriptions.Item label="需求附件">{formData.attachments.length > 0 ? formData.attachments.map((f) => f.name).join('、') : '-'}</Descriptions.Item>
          <Descriptions.Item label="代理机构">{formData.orgMode === 'agent' ? (AGENT_OPTIONS.find((a) => a.value === formData.agentId)?.label || '-') : '-'}</Descriptions.Item>
          <Descriptions.Item label="资质要求">{formData.qualifications.join('、') || '-'}</Descriptions.Item>
          <Descriptions.Item label="允许联合体">{formData.allowConsortium ? '允许' : '不允许'}</Descriptions.Item>
        </Descriptions>
        {formData.packages.length > 0 && (
          <Card size="small" title="采购包清单" style={{ marginTop: 16 }}>
            {formData.packages.map((pkg, idx) => (
              <div key={idx} className="package-review-row">
                <strong>采购包 {idx + 1} {pkg.name || pkg.code}</strong>
                <span>采购方式：{PURCHASE_MODE_OPTIONS.find((o) => o.value === pkg.purchaseMode)?.label || '-'}</span>
                <span>预算：{pkg.budget || '-'} 万元</span>
                <span>清单：{pkg.listFile?.length ? pkg.listFile[0].name : '未上传'}</span>
              </div>
            ))}
          </Card>
        )}
        <div className="step-actions">
          <Button type="primary" onClick={submit}>提交审核（生成立项审批单）</Button>
          <Button onClick={saveDraft}>保存草稿</Button>
        </div>
      </Card>

      <style>{`
        .project-create {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .project-form {
          margin-top: 8px;
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .section-header h3 {
          margin: 0;
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
          margin-top: 24px;
        }
        .package-review-row {
          display: grid;
          grid-template-columns: 1.5fr repeat(3, 1fr);
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
