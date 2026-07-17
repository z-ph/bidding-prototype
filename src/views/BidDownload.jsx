import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Alert, Button, Card, Form, Input, Modal, Radio, Result, Steps, Table, Tag, Upload, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { useRole } from '../hooks/useRole.js'
import { objectionStore } from '../data/objectionStore.js'
import { tenderDocStore } from '../data/tenderDocStore.js'
import { projectStore } from '../data/projects.js'
import { authorizationStore } from '../data/authorizationStore.js'

// 招标文件下载按「公开/授权」二态控制（清单 23）：公开项目可自行下载，非公开项目仅授权供应商可下载，
// 不以报名/缴费为前置。授权为年度周期，过期自动判定为 expired，视同未授权（概要三）。

// 与项目中心一致的种子项目元数据（projectStore 无记录时回退）
const FALLBACK_PROJECTS = {
  '1': { name: 'XX市轨道交通设备采购项目', purchaseMode: 'open' },
  '2': { name: '办公桌椅采购项目', purchaseMode: 'inquiry' },
  '3': { name: '软件开发服务项目', purchaseMode: 'invitation' },
  '4': { name: '物业服务采购项目', purchaseMode: 'open' },
  '5': { name: '实验室设备采购项目', purchaseMode: 'open' }
}

export default function BidDownload() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false })
  const projectId = searchParams.projectId || '1'
  const { userInfo } = useRole()
  const supplierName = userInfo?.nickname || userInfo?.org || ''

  const projectMeta = useMemo(() => {
    const stored = projectStore.getProjectById(projectId)
    if (stored) {
      return { id: String(projectId), name: stored.name, code: stored.code, purchaseMode: stored.purchaseMode }
    }
    const fallback = FALLBACK_PROJECTS[String(projectId)] || { name: '未知项目', purchaseMode: 'open' }
    return { id: String(projectId), ...fallback }
  }, [projectId])

  const isPublicProject = ['open', 'inquiry'].includes(projectMeta.purchaseMode)

  // 当前供应商在该项目的授权记录（list 读取时已自动做过期判定）
  const myAuthorizations = useMemo(
    () =>
      authorizationStore
        .list({ projectId })
        .filter((a) => a.supplierId === supplierName || a.supplierName === supplierName),
    [projectId, supplierName]
  )
  const activeAuthorization = myAuthorizations.find((a) => a.status === 'authorized')
  const canDownload = isPublicProject || Boolean(activeAuthorization)
  const blockedReason = activeAuthorization
    ? ''
    : myAuthorizations.some((a) => a.status === 'expired')
      ? 'expired'
      : myAuthorizations.some((a) => a.status === 'revoked')
        ? 'revoked'
        : 'none'

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
    objectionStore.add({
      id: `obj-${Date.now()}`,
      project: projectMeta.name,
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

  const blockedSubTitle = {
    expired: '您的授权已过年度有效期，需招标人/代理重新授权后方可下载。请联系项目招标人/代理办理重新授权。',
    revoked: '您的授权已被撤销，暂无法下载。如有疑问请联系项目招标人/代理。',
    none: '该项目为邀请/非公开项目，仅经招标人/代理授权的供应商可下载招标文件。请联系项目招标人/代理开通授权。'
  }

  return (
    <div className="bid-download">
      <Card
        title={
          <div className="card-header">
            <span>招标文件下载</span>
            <span>
              <Tag color={isPublicProject ? 'success' : 'warning'}>
                {isPublicProject ? '公开项目·可自行下载' : '非公开项目·需授权'}
              </Tag>
              <Tag color="success">项目：{projectMeta.name}</Tag>
            </span>
          </div>
        }
      >
        <Steps
          size="small"
          current={1}
          style={{ marginBottom: 24 }}
          items={['确认下载权限', '下载招标文件', '编制投标文件', '上传投标文件'].map((title) => ({ title }))}
        />

        {!canDownload ? (
          <Result
            status="warning"
            title={blockedReason === 'expired' ? '授权已过期，需重新授权' : blockedReason === 'revoked' ? '授权已被撤销' : '未获授权，暂不可下载'}
            subTitle={blockedSubTitle[blockedReason]}
            extra={[
              <Button key="back" type="primary" onClick={() => navigate({ to: '/admin/bidder-projects' })}>
                返回项目中心
              </Button>,
              <Button key="message" onClick={() => navigate({ to: '/admin/message-center' })}>
                联系招标人/代理
              </Button>
            ]}
          />
        ) : (
          <>
            {versionChanged && (
              <Alert
                title={`招标文件已更新，当前有效版本为 ${tenderDocVersion.versionNo}，请重新下载。`}
                type="warning"
                showIcon
                closable={false}
                style={{ marginBottom: 20 }}
              />
            )}
            <Alert
              title={tenderDocVersion
                ? `当前有效招标文件版本：${tenderDocVersion.versionNo}，发布时间：${tenderDocVersion.publishedAt || tenderDocVersion.updatedAt}。下载后请使用投标文件制作工具离线编制，开标前务必完成签章和加密。`
                : '暂无已发布的招标文件，请稍后刷新。'}
              type="info"
              showIcon
              closable={false}
              style={{ marginBottom: 20 }}
            />
            {!isPublicProject && activeAuthorization && (
              <Alert
                title={`您已获该项目下载授权（授权人：${activeAuthorization.grantedBy || '-'}，有效期至 ${activeAuthorization.expiresAt}）。`}
                type="success"
                showIcon
                closable={false}
                style={{ marginBottom: 20 }}
              />
            )}
            <Table
              columns={columns}
              dataSource={files}
              rowKey="name"
              pagination={false}
              style={{ width: '100%' }}
            />
            <div className="next-step">
              <span>文件已获取？</span>
              <Button type="primary" onClick={() => navigate({ to: '/admin/bid-quote', search: { projectId } })}>去填写报价</Button>
              <Button onClick={() => navigate({ to: '/admin/bid-upload', search: { projectId } })}>去上传投标文件</Button>
              <Button onClick={() => setObjectionVisible(true)}>质疑招标文件</Button>
            </div>
          </>
        )}
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
