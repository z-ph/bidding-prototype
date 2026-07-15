import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Alert, Button, Card, Form, Input, Modal, Radio, Steps, Table, Tag, Upload, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { useRole } from '../hooks/useRole.js'
import { objectionStore } from '../data/objectionStore.js'
import { tenderDocStore } from '../data/tenderDocStore.js'

export default function BidDownload() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false })
  const projectId = searchParams.projectId || '1'
  const { userInfo } = useRole()

  const tenderDocVersion = useMemo(
    () => tenderDocStore.getCurrentPublishedVersion(projectId),
    [projectId]
  )

  const files = useMemo(() => {
    if (!tenderDocVersion) return []
    const docFile = {
      name: `${tenderDocVersion.projectId}-招标文件-${tenderDocVersion.versionNo}.pdf`,
      version: tenderDocVersion.versionNo,
      updateTime: tenderDocVersion.publishedAt || tenderDocVersion.updatedAt,
      size: '5.2 MB',
      isDoc: true
    }
    const attachments = (tenderDocVersion.fileList || []).map((f) => ({
      name: f.name,
      version: tenderDocVersion.versionNo,
      updateTime: tenderDocVersion.updatedAt,
      size: typeof f.size === 'number' ? `${(f.size / 1024 / 1024).toFixed(1)} MB` : f.size || '-'
    }))
    return [docFile, ...attachments]
  }, [tenderDocVersion])

  const viewedKey = `bid-download-viewed-${projectId}`
  const [viewedVersion, setViewedVersion] = useState(() => localStorage.getItem(viewedKey) || '')
  const versionChanged = viewedVersion && tenderDocVersion && viewedVersion !== tenderDocVersion.versionNo

  const markViewed = () => {
    if (tenderDocVersion) {
      localStorage.setItem(viewedKey, tenderDocVersion.versionNo)
      setViewedVersion(tenderDocVersion.versionNo)
    }
  }

  useEffect(() => {
    if (tenderDocVersion && !viewedVersion) {
      markViewed()
    }
  }, [tenderDocVersion, viewedVersion])

  const [objectionVisible, setObjectionVisible] = useState(false)
  const [objectionForm, setObjectionForm] = useState({
    type: '商务',
    content: '',
    attachments: []
  })

  const preview = (row) => {
    message.success(`在线预览：${row.name}`)
  }

  const download = (row) => {
    markViewed()
    message.success(`开始下载：${row.name}`)
  }

  const updateObjectionField = (key, value) => {
    setObjectionForm((prev) => ({ ...prev, [key]: value }))
  }

  const submitObjection = () => {
    if (!objectionForm.content.trim()) {
      message.warning('请填写质疑内容')
      return
    }
    const projectNameMap = {
      '1': 'XX市轨道交通设备采购项目',
      '2': '办公桌椅采购项目',
      '3': '软件开发服务项目',
      '4': '物业服务采购项目',
      '5': '实验室设备采购项目'
    }
    objectionStore.add({
      id: `obj-${Date.now()}`,
      project: projectNameMap[projectId] || '未知项目',
      projectId,
      type: '招标文件',
      subType: objectionForm.type,
      bidder: userInfo?.nickname || '当前投标人',
      content: objectionForm.content,
      status: '待答复',
      attachments: objectionForm.attachments.map((f) => f.name || f),
      reply: '',
      createdAt: new Date().toLocaleString()
    })
    message.success('质疑已提交，招标人/代理将在异议管理中处理')
    setObjectionVisible(false)
    setObjectionForm({ type: '商务', content: '', attachments: [] })
  }

  const columns = [
    { title: '文件名称', dataIndex: 'name', key: 'name', minWidth: 300 },
    { title: '版本', dataIndex: 'version', key: 'version', width: 100 },
    { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime', width: 180 },
    { title: '大小', dataIndex: 'size', key: 'size', width: 120 },
    {
      title: '操作',
      key: 'action',
      width: 280,
      fixed: 'right',
      render: (_, row) => (
        <>
          <Button type="link" onClick={() => preview(row)}>预览</Button>
          <Button type="primary" size="small" onClick={() => download(row)}>下载</Button>
        </>
      )
    }
  ]

  return (
    <div className="bid-download">
      <Card
        title={
          <div className="card-header">
            <span>招标文件下载</span>
            <Tag color="success">项目：XX市轨道交通设备采购项目</Tag>
          </div>
        }
      >
        <Steps
          size="small"
          current={2}
          style={{ marginBottom: 24 }}
          items={['报名通过', '缴纳文件费', '下载招标文件', '编制投标文件', '上传投标文件'].map((title) => ({ title }))}
        />
        {versionChanged && (
          <Alert
            message={`招标文件已更新，当前有效版本为 ${tenderDocVersion.versionNo}，请重新下载。`}
            type="warning"
            showIcon
            closable={false}
            style={{ marginBottom: 20 }}
          />
        )}
        <Alert
          message={tenderDocVersion
            ? `当前有效招标文件版本：${tenderDocVersion.versionNo}，发布时间：${tenderDocVersion.publishedAt || tenderDocVersion.updatedAt}。下载后请使用投标文件制作工具离线编制，开标前务必完成签章和加密。`
            : '暂无已发布的招标文件，请稍后刷新。'}
          type="info"
          showIcon
          closable={false}
          style={{ marginBottom: 20 }}
        />
        <Table
          columns={columns}
          dataSource={files}
          rowKey="name"
          pagination={false}
          style={{ width: '100%' }}
        />
        <div className="next-step">
          <span>文件已获取？</span>
          <Button type="primary" onClick={() => navigate('/admin/bid-quote')}>去填写报价</Button>
          <Button onClick={() => navigate('/admin/bid-upload')}>去上传投标文件</Button>
          <Button onClick={() => setObjectionVisible(true)}>质疑招标文件</Button>
        </div>
      </Card>

      <Modal
        title="质疑招标文件"
        open={objectionVisible}
        width={640}
        onOk={submitObjection}
        onCancel={() => setObjectionVisible(false)}
        okText="提交质疑"
        cancelText="取消"
      >
        <Form layout="horizontal" labelCol={{ flex: '100px' }}>
          <Form.Item label="质疑类型">
            <Radio.Group
              value={objectionForm.type}
              onChange={(e) => updateObjectionField('type', e.target.value)}
            >
              <Radio value="商务">商务</Radio>
              <Radio value="技术">技术</Radio>
              <Radio value="其他">其他</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="质疑内容">
            <Input.TextArea
              rows={6}
              placeholder="请详细描述对招标文件的质疑内容，包括条款、参数、评分办法等..."
              value={objectionForm.content}
              onChange={(e) => updateObjectionField('content', e.target.value)}
            />
          </Form.Item>
          <Form.Item label="附件">
            <Upload
              fileList={objectionForm.attachments}
              onChange={({ fileList }) => updateObjectionField('attachments', fileList)}
              beforeUpload={() => false}
              multiple
            >
              <Button icon={<UploadOutlined />}>上传附件</Button>
            </Upload>
            <div style={{ color: '#999', fontSize: 12, marginTop: 8 }}>支持 PDF、DOC、图片等，单个不超过 50MB</div>
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .bid-download {
          max-width: 1100px;
          margin: 0 auto;
        }
        .bid-download .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
        }
        .bid-download .next-step {
          margin-top: 24px;
          padding: 16px;
          background: #f5f7fa;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
      `}</style>
    </div>
  )
}
