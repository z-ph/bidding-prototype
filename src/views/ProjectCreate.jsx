import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
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
  message
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import EmptyState from '../components/EmptyState.jsx'

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
    members: [],
    approvalInfo: '',
    attachments: [],
    packages: [],
    qualifications: ['营业执照'],
    performance: '',
    financial: '',
    credit: '',
    allowConsortium: false
  })

  const packageBudgetTotal = formData.packages.reduce((sum, p) => sum + (Number(p.budget) || 0), 0)

  const canNext = () => {
    if (activeStep === 0) return true
    if (activeStep === 2) return formData.packages.length > 0
    return true
  }

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
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
      packages: [...prev.packages, { name: '', code: `B${prev.packages.length + 1}`, budget: '', content: '' }]
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
      } catch {
        return
      }
    }
    if (activeStep === 2 && formData.packages.length === 0) {
      message.warning('请至少添加一个标段')
      return
    }
    setActiveStep((s) => s + 1)
  }

  const saveDraft = () => {
    message.success('项目草稿已保存')
  }

  const submit = () => {
    message.success('项目已提交审核，即将跳转项目列表')
    navigate('/admin/projects')
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

  const steps = ['基本信息', '需求与成员', '标段设置', '供应商要求', '提交审核']

  return (
    <div className="project-create">
      <Alert
        message="当前办理阶段：项目立项"
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
            <Form form={form} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} className="project-form">
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
                      options={[
                        { label: '公开招标', value: 'open' },
                        { label: '邀请招标', value: 'invitation' },
                        { label: '公开询比价', value: 'inquiry' },
                        { label: '单一来源', value: 'single' }
                      ]}
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
                  <Form.Item label="需求来源">
                    <Select
                      placeholder="请选择需求来源"
                      value={formData.demandSource || undefined}
                      onChange={(value) => updateField('demandSource', value)}
                      options={[
                        { label: '年度采购计划', value: 'plan' },
                        { label: '临时采购申请', value: 'temp' },
                        { label: '项目变更', value: 'change' },
                        { label: '其他', value: 'other' }
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="需求编号">
                    <Input
                      placeholder="关联需求单号"
                      value={formData.demandCode}
                      onChange={(e) => updateField('demandCode', e.target.value)}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item label="项目成员">
                <Select
                  mode="multiple"
                  placeholder="选择项目成员"
                  value={formData.members}
                  onChange={(value) => updateField('members', value)}
                  options={[
                    { label: '张三（招标人）', value: 'zhangsan' },
                    { label: '李四（招标代理）', value: 'lisi' },
                    { label: '王五（法务）', value: 'wangwu' },
                    { label: '赵六（财务）', value: 'zhaoliu' }
                  ]}
                />
              </Form.Item>
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
                <p className="section-tip">项目预算：{formData.budget || 0} 万元 · 标段预算合计：{packageBudgetTotal} 万元</p>
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
                  <Descriptions.Item label="采购方式">{formData.purchaseMode || '-'}</Descriptions.Item>
                  <Descriptions.Item label="项目预算">{formData.budget || '-'} 万元</Descriptions.Item>
                  <Descriptions.Item label="标段预算合计">{packageBudgetTotal} 万元</Descriptions.Item>
                  <Descriptions.Item label="开标时间">{formatTime(formData.openTime)}</Descriptions.Item>
                  <Descriptions.Item label="标段数量">{formData.packages.length} 个</Descriptions.Item>
                  <Descriptions.Item label="需求来源">{formData.demandSource || '-'}</Descriptions.Item>
                  <Descriptions.Item label="项目成员">{formData.members.join('、') || '-'}</Descriptions.Item>
                  <Descriptions.Item label="资质要求">{formData.qualifications.join('、') || '-'}</Descriptions.Item>
                </Descriptions>
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
      `}</style>
    </div>
  )
}
