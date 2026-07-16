import { useState, useMemo } from 'react'
import { useSearch } from '@tanstack/react-router'
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Descriptions,
  Divider,
  Form,
  Input,
  Modal,
  Radio,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Upload,
  message
} from 'antd'
import { CheckCircleFilled, FileProtectOutlined, LockOutlined, UploadOutlined } from '@ant-design/icons'
import StatusTag from '../components/StatusTag.jsx'
import { projectStore } from '../data/projects.js'
import { clauseStore, defaultClauses } from '../data/clauseStore.js'

export default function BidUpload() {
  const searchParams = useSearch({ strict: false })
  const projectId = searchParams.projectId
  const [form] = Form.useForm()
  const encryptMode = Form.useWatch('encryptMode', form)
  const selectedProjectId = Form.useWatch('projectId', form)
  const selectedPackages = Form.useWatch('packages', form) || []

  const projects = [
    { id: 1, name: 'XX市轨道交通设备采购项目' },
    { id: 2, name: '办公桌椅采购项目' }
  ]

  // 标段按所选项目动态拉取：优先读取项目保存的标段，无则回退默认标段
  const packages = useMemo(() => {
    const project = projectStore.getProjectById(selectedProjectId)
    if (project?.packages?.length) {
      return project.packages.map((p) => ({ id: p.code || p.name, name: p.name, code: p.code }))
    }
    if (projectId) {
      const urlProject = projectStore.getProjectById(projectId)
      if (urlProject?.packages?.length) {
        return urlProject.packages.map((p) => ({ id: p.code || p.name, name: p.name, code: p.code }))
      }
    }
    return [
      { id: 'B1', name: '第一标段：主设备', code: 'B1' },
      { id: 'B2', name: '第二标段：辅材', code: 'B2' }
    ]
  }, [selectedProjectId, projectId])

  // 必传文件类型清单（按招标文件模板要求），用于齐全性校验与制作向导
  const requiredFileTypes = [
    { type: '商务标', desc: '投标函、授权委托书、营业执照等' },
    { type: '技术标', desc: '技术方案、项目实施方案、参数响应表等' },
    { type: '报价标', desc: '报价一览表、分项报价表等' }
  ]

  const [uploadFiles, setUploadFiles] = useState([])
  const [fileList, setFileList] = useState([
    {
      name: '投标函.pdf',
      type: '商务标',
      size: '1.2 MB',
      signed: true,
      signTime: '2026-07-15 09:00:00',
      encrypted: true,
      encryptMethod: 'ca',
      encryptTime: '2026-07-15 09:05:00'
    },
    {
      name: '技术方案.docx',
      type: '技术标',
      size: '3.5 MB',
      signed: true,
      signTime: '2026-07-15 09:00:00',
      encrypted: true,
      encryptMethod: 'ca',
      encryptTime: '2026-07-15 09:05:00'
    },
    {
      name: '报价单.xlsx',
      type: '报价标',
      size: '0.8 MB',
      signed: false,
      signTime: null,
      encrypted: false,
      encryptMethod: null,
      encryptTime: null
    }
  ])

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

  const [quote, setQuote] = useState(() => {
    const init = {}
    quoteFields.forEach((f) => { init[f.key] = '' })
    return init
  })

  const [quoteItems, setQuoteItems] = useState([
    { name: '主设备 A 型', spec: '详见技术参数', quantity: 10, unit: '台', price: '' },
    { name: '辅材 B 型', spec: '详见技术参数', quantity: 50, unit: '套', price: '' }
  ])

  // 评审条款关联：将上传的投标文件逐条挂接到招标文件评审条款
  const [clauseLinks, setClauseLinks] = useState(() => clauseStore.getLinks(projectId))
  const setClauseLink = (clauseId, fileName) => {
    const next = clauseStore.setLink(projectId, clauseId, fileName)
    setClauseLinks({ ...next })
  }

  const [receiptVisible, setReceiptVisible] = useState(false)
  const [submitTime, setSubmitTime] = useState('')
  const [receiptNo, setReceiptNo] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const allEncrypted = fileList.length > 0 && fileList.every((f) => f.encrypted && f.encryptMethod === 'ca')
  const projectName = (projects.find((item) => item.id === selectedProjectId) || {}).name || '-'
  const packageNames =
    packages.filter((p) => selectedPackages.includes(p.id)).map((p) => p.name).join('、') || '-'

  const quoteFilled = quoteFields.every((f) => !f.required || (quote[f.key] && String(quote[f.key]).trim()))
  // 文件类型齐全性校验：每个必传类型至少有一份已上传文件
  const uploadedTypes = Array.from(new Set(fileList.map((f) => f.type)))
  const missingTypes = requiredFileTypes
    .filter((r) => !uploadedTypes.includes(r.type))
    .map((r) => r.type)
  const allTypesComplete = missingTypes.length === 0
  const canDraft = selectedProjectId && selectedPackages.length > 0 && fileList.length > 0 && quoteFilled
  const canSubmit = canDraft && allEncrypted && allTypesComplete

  const submitBtnText = (() => {
    if (encryptMode === 'password') {
      if (!quoteFilled) return '请填写开标一览表'
      if (fileList.length === 0) return '请先上传文件'
      if (!selectedProjectId || selectedPackages.length === 0) return '请完善投标信息'
      return '保存草稿'
    }
    if (!quoteFilled) return '请填写开标一览表'
    if (fileList.length === 0) return '请先上传文件'
    if (!allEncrypted) return '存在未加密文件'
    if (!selectedProjectId || selectedPackages.length === 0) return '请完善投标信息'
    return '正式提交投标文件'
  })()

  const handleUploadChange = ({ fileList: next }) => {
    setUploadFiles(next)
    setFileList((prev) => {
      const additions = next
        .filter((f) => !prev.find((item) => item.name === f.name))
        .map((f) => ({
          name: f.name,
          type: '附件',
          size: `${((f.size || 0) / 1024 / 1024).toFixed(2)} MB`,
          signed: false,
          signTime: null,
          encrypted: false,
          encryptMethod: null,
          encryptTime: null
        }))
      return additions.length ? [...prev, ...additions] : prev
    })
  }

  const removeFile = (row) => {
    setFileList((prev) => prev.filter((item) => item !== row))
    setUploadFiles((prev) => prev.filter((item) => item.name !== row.name))
  }

  const signFile = (row) => {
    setFileList((prev) =>
      prev.map((item) =>
        item === row
          ? { ...item, signed: true, signTime: new Date().toLocaleString() }
          : item
      )
    )
    message.success(`${row.name} 已签章`)
  }

  const encryptFile = (row) => {
    setFileList((prev) =>
      prev.map((item) =>
        item === row
          ? {
              ...item,
              encrypted: true,
              encryptMethod: encryptMode,
              encryptTime: new Date().toLocaleString()
            }
          : item
      )
    )
    const methodText = encryptMode === 'password' ? '密码加密（草稿）' : 'CA 证书加密'
    message.success(`${row.name} 已完成${methodText}`)
  }

  const reSignFile = (row) => {
    setFileList((prev) =>
      prev.map((item) =>
        item === row
          ? { ...item, signed: false, signTime: null, encrypted: false, encryptMethod: null, encryptTime: null }
          : item
      )
    )
    message.info(`${row.name} 已重置签章状态，请重新签章并加密`)
  }

  const reEncryptFile = (row) => {
    setFileList((prev) =>
      prev.map((item) =>
        item === row
          ? { ...item, encrypted: false, encryptMethod: null, encryptTime: null }
          : item
      )
    )
    message.info(`${row.name} 已重置加密状态，请重新加密`)
  }

  const updateQuote = (key, value) => {
    setQuote((prev) => ({ ...prev, [key]: value }))
  }

  const updateQuotePrice = (index, value) => {
    setQuoteItems((prev) => prev.map((item, i) => (i === index ? { ...item, price: value } : item)))
  }

  const submitBid = async () => {
    const valid = await form.validateFields().then(() => true).catch(() => false)
    if (!valid) return
    if (!quoteFilled) {
      message.warning('请填写开标一览表')
      return
    }
    if (fileList.length === 0) {
      message.warning('请上传投标文件')
      return
    }

    // 文件类型齐全性校验：缺少商务标/技术标/报价标时阻断提交
    if (missingTypes.length > 0) {
      message.error(`投标文件不完整，缺少：${missingTypes.join('、')}，请补齐后再提交`)
      return
    }

    const unencryptedFiles = fileList.filter((f) => !f.encrypted)
    if (unencryptedFiles.length > 0) {
      message.error(`${unencryptedFiles.map((f) => f.name).join('、')} 未加密，请先完成加密`)
      return
    }

    const nonCaFiles = fileList.filter((f) => f.encryptMethod !== 'ca')
    if (nonCaFiles.length > 0) {
      message.error('正式提交必须使用 CA 证书加密，当前为密码加密（仅草稿），请重新加密后提交')
      return
    }

    Modal.confirm({
      title: '提交投标文件确认',
      content: '提交后投标文件将加密锁定，开标前不可修改，是否继续？',
      okText: '确认提交',
      cancelText: '取消',
      onOk: () => {
        setSubmitted(true)
        setReceiptNo('ZB' + Date.now())
        setSubmitTime(new Date().toLocaleString())
        setReceiptVisible(true)
        message.success('投标文件已加密并提交成功')
      }
    })
  }

  const saveDraft = async () => {
    await form.validateFields().catch(() => {})
    message.success('投标文件草稿已保存')
  }

  const encryptStatusLabel = (row) => {
    if (!row.encrypted) return '未加密'
    if (row.encryptMethod === 'password') return '密码加密（草稿）'
    return '已 CA 加密'
  }

  const encryptStatusColor = (row) => {
    if (!row.encrypted) return 'pending'
    if (row.encryptMethod === 'password') return 'pending'
    return 'completed'
  }

  const columns = [
    { title: '文件名', dataIndex: 'name', key: 'name' },
    { title: '文件类型', dataIndex: 'type', key: 'type', width: 130 },
    { title: '大小', dataIndex: 'size', key: 'size', width: 120 },
    {
      title: '签章状态',
      key: 'signed',
      width: 140,
      render: (_, row) => (
        <StatusTag
          label={row.signed ? '已签章' : '待签章'}
          status={row.signed ? 'completed' : 'pending'}
        />
      )
    },
    {
      title: '加密状态',
      key: 'encrypted',
      width: 160,
      render: (_, row) => (
        <StatusTag label={encryptStatusLabel(row)} status={encryptStatusColor(row)} />
      )
    },
    {
      title: '提交状态',
      key: 'submitStatus',
      width: 140,
      render: () => (
        <StatusTag
          label={submitted ? '已正式提交' : '未提交'}
          status={submitted ? 'completed' : 'pending'}
        />
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 260,
      render: (_, row) => (
        <Space size="small">
          {!row.signed && (
            <Button type="primary" size="small" icon={<FileProtectOutlined />} onClick={() => signFile(row)}>
              签章
            </Button>
          )}
          {row.signed && !row.encrypted && (
            <Button type="primary" size="small" icon={<LockOutlined />} onClick={() => encryptFile(row)}>
              加密
            </Button>
          )}
          {row.signed && (
            <Button size="small" onClick={() => reSignFile(row)}>
              重新签章
            </Button>
          )}
          {row.encrypted && (
            <Button size="small" onClick={() => reEncryptFile(row)}>
              重新加密
            </Button>
          )}
          <Button type="link" danger size="small" onClick={() => removeFile(row)}>
            删除
          </Button>
        </Space>
      )
    }
  ]

  const quoteColumns = [
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
          onChange={(e) => updateQuotePrice(index, e.target.value)}
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
    <div className="bid-upload">
      <Card
        title={
          <div className="card-header">
            <span>投标文件上传</span>
            <Tag color="warning">距截止时间：2 天 5 小时</Tag>
          </div>
        }
      >
        <Alert
          title="正式提交必须使用 CA 证书加密投标文件。上传后请依次完成签章、加密，再进行正式提交；密码加密仅作为草稿/演示，不能生成正式回执。"
          type="info"
          showIcon
          closable={false}
          style={{ marginBottom: 20 }}
        />

        <Form
          form={form}
          initialValues={{ encryptMode: 'ca', packages: [] }}
          labelCol={{ flex: '0 0 120px' }}
          wrapperCol={{ flex: 'auto' }}
          className="upload-form"
        >
          <Form.Item
            label="选择项目"
            name="projectId"
            rules={[{ required: true, message: '请选择投标项目' }]}
          >
            <Select
              placeholder="请选择投标项目"
              style={{ width: '100%' }}
              options={projects.map((p) => ({ label: p.name, value: p.id }))}
            />
          </Form.Item>
          <Form.Item
            label="投标标段"
            name="packages"
            rules={[{ required: true, type: 'array', message: '请至少选择一个标段' }]}
          >
            <Checkbox.Group>
              {packages.map((pkg) => (
                <Checkbox key={pkg.id} value={pkg.id}>{pkg.name}</Checkbox>
              ))}
            </Checkbox.Group>
          </Form.Item>
          <Form.Item label="加密方式" name="encryptMode">
            <Radio.Group>
              <Radio value="ca">CA 证书加密（正式提交）</Radio>
              <Radio value="password">密码加密（仅草稿/演示）</Radio>
            </Radio.Group>
          </Form.Item>
          {encryptMode === 'ca' && (
            <Form.Item label="CA 状态">
              <div className="ca-status">
                <CheckCircleFilled style={{ fontSize: 24, color: '#67C23A' }} />
                <span>已检测到 CA 证书：深圳市电子商务安全证书管理有限公司</span>
                <Button type="link">重新检测</Button>
              </div>
            </Form.Item>
          )}
        </Form>

        <Divider />

        <div className="quote-section">
          <h3>开标一览表 / 报价</h3>
          <Form labelCol={{ flex: '0 0 140px' }} wrapperCol={{ flex: 'auto' }} className="quote-form">
            <Row gutter={20}>
              {quoteFields.map((field) => (
                <Col span={12} key={field.key}>
                  <Form.Item label={field.unit ? `${field.label}（${field.unit}）` : field.label} required={field.required}>
                    <Input
                      value={quote[field.key]}
                      onChange={(e) => updateQuote(field.key, e.target.value)}
                      placeholder={`请输入${field.label}`}
                    />
                  </Form.Item>
                </Col>
              ))}
            </Row>
          </Form>
          <h4>分项报价</h4>
          <Table
            columns={quoteColumns}
            dataSource={quoteItems}
            rowKey="name"
            pagination={false}
            style={{ width: '100%', marginBottom: 20 }}
          />
        </div>

        <Divider />

        <div className="file-section">
          <h4>投标文件组成</h4>
          <Card size="small" className="wizard-card" style={{ marginBottom: 16, background: '#f6f8fa' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <strong style={{ marginRight: 8 }}>投标文件制作向导</strong>
              <span style={{ color: '#666', fontSize: 12 }}>按招标文件模板，商务标/技术标/报价标三类缺一不可，避免废标</span>
            </div>
            <Space wrap>
              {requiredFileTypes.map((r) => {
                const uploaded = uploadedTypes.includes(r.type)
                return (
                  <Tag key={r.type} color={uploaded ? 'success' : 'warning'} icon={uploaded ? <CheckCircleFilled /> : null}>
                    {r.type}：{uploaded ? '已上传' : '未上传'}（{r.desc}）
                  </Tag>
                )
              })}
            </Space>
          </Card>
          <Upload.Dragger
            fileList={uploadFiles}
            onChange={handleUploadChange}
            beforeUpload={() => false}
            multiple
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined style={{ fontSize: 48, color: '#409EFF' }} />
            </p>
            <p className="ant-upload-text">将投标文件拖拽到此处，或 <em>点击上传</em></p>
            <p className="ant-upload-hint">支持 PDF、ZIP、DOCX 格式，单个文件不超过 500MB</p>
          </Upload.Dragger>

          <Table
            columns={columns}
            dataSource={fileList}
            rowKey="name"
            pagination={false}
            locale={{ emptyText: '暂无文件' }}
            style={{ width: '100%', marginTop: 16 }}
          />

          {encryptMode === 'ca' && fileList.length > 0 && !allEncrypted && (
            <Alert
              title="存在未使用 CA 证书加密的文件，请先完成签章、加密后再正式提交"
              type="error"
              showIcon
              closable={false}
              style={{ marginTop: 16 }}
            />
          )}

          {!allTypesComplete && (
            <Alert
              title={`投标文件不完整，缺少：${missingTypes.join('、')}。请按制作向导补齐各类文件，否则无法正式提交。`}
              type="warning"
              showIcon
              closable={false}
              style={{ marginTop: 16 }}
            />
          )}

          <Divider />

          <div className="clause-section" style={{ marginTop: 16 }}>
            <h4 style={{ marginBottom: 8 }}>评审条款关联</h4>
            <p style={{ color: '#666', marginBottom: 12 }}>将上传的投标文件逐项挂接到招标文件评审条款，确保响应完整、便于评标查阅。</p>
            <Table
              rowKey="id"
              dataSource={defaultClauses}
              pagination={false}
              size="small"
              columns={[
                { title: '评审条款', dataIndex: 'name' },
                { title: '分类', dataIndex: 'category', width: 100, render: (c) => <Tag>{c}</Tag> },
                {
                  title: '关联投标文件',
                  key: 'link',
                  width: 300,
                  render: (_, row) => (
                    <Select
                      style={{ width: '100%' }}
                      placeholder="选择已上传的投标文件"
                      value={clauseLinks[row.id] || undefined}
                      onChange={(value) => setClauseLink(row.id, value)}
                      allowClear
                      options={fileList.map((f) => ({ label: f.name, value: f.name }))}
                      notFoundContent="请先上传投标文件"
                    />
                  )
                }
              ]}
            />
          </div>
        </div>

        <div className="actions">
          {encryptMode === 'password' ? (
            <Button type="primary" size="large" disabled={!canDraft} onClick={saveDraft}>
              {submitBtnText}
            </Button>
          ) : (
            <>
              <Button type="primary" size="large" disabled={!canSubmit} onClick={submitBid}>
                {submitBtnText}
              </Button>
              <Button size="large" onClick={saveDraft}>保存草稿</Button>
            </>
          )}
        </div>
      </Card>

      <Modal
        title="投标回执"
        open={receiptVisible}
        width={520}
        closable={false}
        maskClosable={false}
        onCancel={() => setReceiptVisible(false)}
        footer={[
          <Button key="ok" type="primary" onClick={() => setReceiptVisible(false)}>我知道了</Button>
        ]}
      >
        <Descriptions column={1} bordered>
          <Descriptions.Item label="项目名称">{projectName}</Descriptions.Item>
          <Descriptions.Item label="投标标段">{packageNames}</Descriptions.Item>
          <Descriptions.Item label="文件数量">{fileList.length} 份</Descriptions.Item>
          <Descriptions.Item label="文件清单">
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {fileList.map((f) => (
                <li key={f.name}>{f.name}</li>
              ))}
            </ul>
          </Descriptions.Item>
          <Descriptions.Item label="提交时间">{submitTime}</Descriptions.Item>
          <Descriptions.Item label="回执编号">{receiptNo}</Descriptions.Item>
          <Descriptions.Item label="加密方式">CA 证书加密</Descriptions.Item>
        </Descriptions>
      </Modal>

      {projectId && (
        <Alert
          title={`当前为项目 ID: ${projectId} 上传投标文件`}
          type="info"
          showIcon
          closable={false}
          style={{ marginTop: 20 }}
        />
      )}

      <style>{`
        .bid-upload {
          max-width: 1100px;
          margin: 0 auto;
        }
        .bid-upload .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
        }
        .bid-upload .upload-form {
          margin-top: 10px;
        }
        .bid-upload .ca-status {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #67C23A;
        }
        .bid-upload .quote-section h3,
        .bid-upload .file-section h4 {
          margin-bottom: 16px;
        }
        .bid-upload .quote-form {
          margin: 20px 0;
        }
        .bid-upload .actions {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-top: 30px;
        }
      `}</style>
    </div>
  )
}
