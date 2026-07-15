import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  Button,
  Tag,
  Descriptions,
  List,
  Empty,
  message,
  Alert
} from 'antd'
import {
  HomeOutlined,
  DownloadOutlined,
  FormOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons'
import PortalHeader from '../components/PortalHeader.jsx'
import { portalStore } from '../data/portalStore.js'

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

  const now = new Date()
  const inRegisterPeriod = notice?.registerStart && notice?.registerEnd
    ? now >= new Date(notice.registerStart) && now <= new Date(notice.registerEnd)
    : false

  const canRegister = isLoggedIn && isSupplier && notice?.canRegister && inRegisterPeriod

  const handleRegister = () => {
    if (!isLoggedIn) {
      message.warning('请先登录')
      navigate('/login')
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
    navigate('/admin/bid-register')
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
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>返回首页</Button>
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
            <Button type="link" icon={<HomeOutlined />} onClick={() => navigate('/')}>
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
              message={`变更原因：${notice.changeReason}`}
              style={{ marginBottom: 24 }}
            />
          )}

          <Descriptions bordered column={2} style={{ marginBottom: 24 }}>
            <Descriptions.Item label="采购方式">{notice.purchaseMode || '-'}</Descriptions.Item>
            <Descriptions.Item label="发布时间">{notice.publishTime || '-'}</Descriptions.Item>
            <Descriptions.Item label="关联项目">{notice.projectName || '-'}</Descriptions.Item>
            <Descriptions.Item label="关联标段">
              {notice.packages?.map((p) => p.name).join('、') || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="报名开始">{notice.registerStart || '-'}</Descriptions.Item>
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
