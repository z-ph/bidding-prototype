import { useMemo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Card,
  Button,
  Tag,
  Descriptions,
  List,
  Empty,
  message,
  Alert,
  Modal,
  Form,
  Input,
  Upload,
  Radio
} from 'antd'
import {
  HomeOutlined,
  DownloadOutlined,
  FormOutlined,
  ArrowLeftOutlined,
  QuestionCircleOutlined,
  UploadOutlined
} from '@ant-design/icons'
import PortalHeader from '../components/PortalHeader.jsx'
import { portalStore } from '../data/portalStore.js'
import { objectionStore } from '../data/objectionStore.js'

const tagColorMap = {
  primary: 'processing',
  warning: 'orange',
  success: 'success',
  info: 'default'
}

export default function NoticeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const notice = useMemo(() => portalStore.getNoticeById(id), [id])

  const isLoggedIn = Boolean(localStorage.getItem('bidding-role'))
  const role = localStorage.getItem('bidding-role') || ''
  const isSupplier = role === 'bidder'

  const [objectionVisible, setObjectionVisible] = useState(false)
  const [objectionForm, setObjectionForm] = useState({ type: '商务', content: '', attachments: [] })

  const now = new Date()
  const inRegisterPeriod = notice?.registerStart && notice?.registerEnd
    ? now >= new Date(notice.registerStart) && now <= new Date(notice.registerEnd)
    : false

  const canRegister = isLoggedIn && isSupplier && notice?.canRegister && inRegisterPeriod

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
      project: notice?.projectName || '未知项目',
      projectId: String(notice?.projectId || ''),
      type: '招标文件',
      subType: objectionForm.type,
      bidder: localStorage.getItem('bidding-account') || '当前投标人',
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

  const handleRegister = () => {
    if (!isLoggedIn) {
      message.warning('请先登录')
      navigate({ to: '/login' })
      return
    }
    if (!isSupplier) {
      message.warning('仅供应商可报名')
      return
    }
    if (!inRegisterPeriod) {
      message.warning('当前不在报名时间内')
      return
    }
    navigate({ to: '/admin/bid-register' })
  }

  const handleDownload = (attachment) => {
    const blob = new Blob([`附件内容：${attachment.name}\n演示文件，仅供原型演示。`], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = attachment.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    message.success(`已开始下载：${attachment.name}`)
  }

  if (!notice) {
    return (
      <div className="public-page">
        <PortalHeader />
        <div className="public-page-content">
          <Card>
            <Empty description="公告不存在或已下线" />
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate({ to: '/' })}>返回首页</Button>
            </div>
          </Card>
        </div>
        <style>{`
          .public-page {
            min-height: 100vh;
            background-color: #f5f7fa;
          }
          .public-page-content {
            max-width: 1200px;
            margin: 40px auto;
            padding: 0 20px;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="public-page">
      <PortalHeader activeKey="notice" />
      <div className="public-page-content">
        <Card
          title={
            <span style={{ fontSize: 18, fontWeight: 'bold' }}>公告详情</span>
          }
          extra={
            <Button type="link" icon={<HomeOutlined />} onClick={() => navigate({ to: '/' })}>
              返回首页
            </Button>
          }
        >
          <div className="notice-detail-title">
            <h2>{notice.title}</h2>
            <Tag color={tagColorMap[notice.tagType]}>{notice.typeName}</Tag>
          </div>

          {notice.type === 'change' && notice.changeReason && (
            <Alert
              type="warning"
              showIcon
              title={`变更原因：${notice.changeReason}`}
              style={{ marginBottom: 24 }}
            />
          )}

          <Descriptions bordered column={2} style={{ marginBottom: 24 }}>
            <Descriptions.Item label="关联项目">{notice.projectName || '-'}</Descriptions.Item>
            <Descriptions.Item label="项目编号">{notice.projectCode || '-'}</Descriptions.Item>
            <Descriptions.Item label="采购方式">{notice.purchaseMode || '-'}</Descriptions.Item>
            <Descriptions.Item label="发布时间">{notice.publishTime || '-'}</Descriptions.Item>
            <Descriptions.Item label="开标时间">{notice.bidOpenTime || '-'}</Descriptions.Item>
            <Descriptions.Item label="开标地点">{notice.bidOpenLocation || '-'}</Descriptions.Item>
            <Descriptions.Item label="评标方法">{notice.evaluationMethod || '-'}</Descriptions.Item>
            <Descriptions.Item label="开标一览表字段">
              {notice.bidSummaryFields?.length > 0
                ? notice.bidSummaryFields.map((f) => <Tag key={f}>{f}</Tag>)
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="联系人">{notice.contactName || '-'}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{notice.contactPhone || '-'}</Descriptions.Item>
            <Descriptions.Item label="关联标段">
              {notice.packages?.map((p) => p.name).join('、') || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="报名截止">{notice.deadline || '-'}</Descriptions.Item>
          </Descriptions>

          <Card type="inner" title="公告正文" style={{ marginBottom: 24 }}>
            <div className="notice-content">{notice.content}</div>
          </Card>

          <Card type="inner" title="附件列表" style={{ marginBottom: 24 }}>
            {notice.attachments && notice.attachments.length > 0 ? (
              <List
                dataSource={notice.attachments}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button
                        key="download"
                        type="link"
                        icon={<DownloadOutlined />}
                        onClick={() => handleDownload(item)}
                      >
                        下载
                      </Button>
                    ]}
                  >
                    {item.name} {item.size ? `（${item.size}）` : ''}
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="暂无附件" />
            )}
          </Card>

          <div className="notice-actions">
            <Button
              type="primary"
              size="large"
              icon={<FormOutlined />}
              disabled={!canRegister}
              onClick={handleRegister}
            >
              立即报名
            </Button>
            {isLoggedIn && isSupplier && (
              <Button
                size="large"
                icon={<QuestionCircleOutlined />}
                onClick={() => setObjectionVisible(true)}
              >
                质疑招标文件
              </Button>
            )}
            {!canRegister && (
              <span className="register-hint">
                {!isLoggedIn
                  ? '请先登录后报名'
                  : !isSupplier
                    ? '仅供应商角色可报名'
                    : !inRegisterPeriod
                      ? '当前不在报名时间内'
                      : '该公告不支持报名'}
              </span>
            )}
          </div>

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
          </Form.Item>
        </Form>
      </Modal>
        </Card>
      </div>
      <style>{`
        .public-page {
          min-height: 100vh;
          background-color: #f5f7fa;
        }
        .public-page-content {
          max-width: 1200px;
          margin: 40px auto;
          padding: 0 20px;
        }
        .notice-detail-title {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        .notice-detail-title h2 {
          margin: 0;
        }
        .notice-content {
          line-height: 1.8;
          white-space: pre-wrap;
        }
        .notice-actions {
          display: flex;
          align-items: center;
          gap: 16px;
          justify-content: center;
          padding: 20px 0;
        }
        .register-hint {
          color: #999;
          font-size: 14px;
        }
      `}</style>
    </div>
  )
}
