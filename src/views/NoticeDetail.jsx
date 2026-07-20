import { useMemo } from 'react'
import { useParams, useNavigate, useRouter } from '@tanstack/react-router'
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
  const { id } = useParams({ strict: false })
  const navigate = useNavigate()
  const router = useRouter()
  const notice = useMemo(() => portalStore.getNoticeById(id), [id])

  const goBack = () => {
    if (window.history.length > 1) {
      router.history.back()
    } else {
      navigate({ to: '/' })
    }
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
            <span style={{ display: 'inline-flex', gap: 8 }}>
              <Button icon={<ArrowLeftOutlined />} onClick={goBack}>
                返回上一页
              </Button>
              <Button type="link" icon={<HomeOutlined />} onClick={() => navigate({ to: '/' })}>
                返回首页
              </Button>
            </span>
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
            <Descriptions.Item label="投标截止">{notice.deadline || '-'}</Descriptions.Item>
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

          <Alert
            title="供应商参与投标请登录后进入工作台「项目中心」，从下载招标文件开始（新口径无报名环节）。"
            type="info"
            showIcon
            closable={false}
          />
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
      `}</style>
    </div>
  )
}
