import { useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Descriptions,
  Divider,
  Form,
  Modal,
  Radio,
  Select,
  Table,
  Tag,
  Upload,
  message
} from 'antd'
import { CheckCircleFilled, UploadOutlined } from '@ant-design/icons'
import StatusTag from '../components/StatusTag.jsx'

export default function BidUpload() {
  const [form] = Form.useForm()
  const encryptMode = Form.useWatch('encryptMode', form)
  const projectId = Form.useWatch('projectId', form)
  const selectedPackages = Form.useWatch('packages', form) || []

  const projects = [
    { id: 1, name: 'XX市轨道交通设备采购项目' },
    { id: 2, name: '办公桌椅采购项目' }
  ]

  const packages = [
    { id: 'B1', name: '第一标段：主设备' },
    { id: 'B2', name: '第二标段：辅材' }
  ]

  const [uploadFiles, setUploadFiles] = useState([])
  const [fileList, setFileList] = useState([
    { name: '投标函.pdf', type: '商务标', size: '1.2 MB', encrypted: true },
    { name: '技术方案.docx', type: '技术标', size: '3.5 MB', encrypted: true },
    { name: '报价单.xlsx', type: '报价标', size: '0.8 MB', encrypted: false }
  ])

  const [receiptVisible, setReceiptVisible] = useState(false)
  const [submitTime, setSubmitTime] = useState('')
  const [receiptNo, setReceiptNo] = useState('')

  const allEncrypted = fileList.length > 0 && fileList.every((f) => f.encrypted)
  const projectName = (projects.find((item) => item.id === projectId) || {}).name || '-'
  const packageNames =
    packages.filter((p) => selectedPackages.includes(p.id)).map((p) => p.name).join('、') || '-'

  const canSubmit = projectId && selectedPackages.length > 0 && fileList.length > 0 && allEncrypted

  const submitBtnText = (() => {
    if (fileList.length === 0) return '请先上传文件'
    if (!allEncrypted) return '存在未加密文件'
    if (!projectId || selectedPackages.length === 0) return '请完善投标信息'
    return '正式提交投标文件'
  })()

  const handleUploadChange = ({ fileList: next }) => {
    setUploadFiles(next)
    // 演示：新上传文件默认未加密
    setFileList((prev) => {
      const additions = next
        .filter((f) => !prev.find((item) => item.name === f.name))
        .map((f) => ({
          name: f.name,
          type: '附件',
          size: `${((f.size || 0) / 1024 / 1024).toFixed(2)} MB`,
          encrypted: false
        }))
      return additions.length ? [...prev, ...additions] : prev
    })
  }

  const removeFile = (row) => {
    setFileList((prev) => prev.filter((item) => item !== row))
    setUploadFiles((prev) => prev.filter((item) => item.name !== row.name))
  }

  const submitBid = async () => {
    const valid = await form.validateFields().then(() => true).catch(() => false)
    if (!valid) return
    if (fileList.length === 0) {
      message.warning('请上传投标文件')
      return
    }
    if (!allEncrypted) {
      message.warning('请完成所有文件加密')
      return
    }

    setReceiptNo('ZB' + Date.now())
    setSubmitTime(new Date().toLocaleString())
    setReceiptVisible(true)
    message.success('投标文件已加密并提交成功')
  }

  const saveDraft = async () => {
    await form.validateFields().catch(() => {})
    message.success('投标文件草稿已保存')
  }

  const columns = [
    { title: '文件名', dataIndex: 'name', key: 'name' },
    { title: '文件类型', dataIndex: 'type', key: 'type', width: 130 },
    { title: '大小', dataIndex: 'size', key: 'size', width: 120 },
    {
      title: '加密状态',
      key: 'encrypted',
      width: 120,
      render: (_, row) => (
        <StatusTag label={row.encrypted ? '已加密' : '未加密'} status={row.encrypted ? 'completed' : 'pending'} />
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, row) => (
        <Button type="link" danger onClick={() => removeFile(row)}>删除</Button>
      )
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
          message="正式提交必须使用 CA 证书加密投标文件，开标前文件内容不可被提前查看。"
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
              <Radio value="password">密码加密</Radio>
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

        <div className="file-section">
          <h4>投标文件组成</h4>
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

          {fileList.length > 0 && !allEncrypted && (
            <Alert
              message="存在未加密文件，请先完成加密或删除后再正式提交"
              type="error"
              showIcon
              closable={false}
              style={{ marginTop: 16 }}
            />
          )}
        </div>

        <div className="actions">
          <Button type="primary" size="large" disabled={!canSubmit} onClick={submitBid}>
            {submitBtnText}
          </Button>
          <Button size="large" onClick={saveDraft}>保存草稿</Button>
        </div>
      </Card>

      <Modal
        title="投标回执"
        open={receiptVisible}
        width={500}
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
          <Descriptions.Item label="提交时间">{submitTime}</Descriptions.Item>
          <Descriptions.Item label="回执编号">{receiptNo}</Descriptions.Item>
          <Descriptions.Item label="加密方式">{encryptMode === 'ca' ? 'CA 证书加密' : '密码加密'}</Descriptions.Item>
        </Descriptions>
      </Modal>

      <style>{`
        .bid-upload {
          max-width: 1000px;
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
        .bid-upload .file-section h4 {
          margin-bottom: 16px;
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
