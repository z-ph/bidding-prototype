import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, List, Tag, Button, Pagination, Empty, message } from 'antd'
import { HomeOutlined, EyeOutlined } from '@ant-design/icons'
import PortalHeader from '../components/PortalHeader.jsx'
import { portalStore } from '../data/portalStore.js'

const categoryColors = {
  平台公告: 'blue',
  培训通知: 'green',
  办事指南: 'orange',
  政策法规: 'purple',
  产品更新: 'cyan',
  采购信息: 'magenta',
  常见问题: 'default'
}

export default function News() {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5

  const newsData = useMemo(() => portalStore.getPublishedNews(), [])
  const currentData = newsData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const viewDetail = (item) => {
    message.info(`查看详情：${item.title}`)
  }

  return (
    <div className="public-page">
      <PortalHeader activeKey="news" />
      <div className="public-page-content">
        <Card
          title={
            <span style={{ fontSize: 18, fontWeight: 'bold' }}>新闻公告</span>
          }
          extra={
            <Button type="link" icon={<HomeOutlined />} onClick={() => navigate('/')}>
              返回首页
            </Button>
          }
        >
          {newsData.length === 0 ? (
            <Empty description="暂无新闻公告" />
          ) : (
            <>
              <List
                itemLayout="horizontal"
                dataSource={currentData}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Tag color={categoryColors[item.category] || 'default'} key="tag">
                        {item.category}
                      </Tag>,
                      <Button
                        key="view"
                        type="link"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => viewDetail(item)}
                      >
                        查看
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <a onClick={() => viewDetail(item)}>
                          {item.title}
                        </a>
                      }
                      description={`发布时间：${item.publishTime}`}
                    />
                  </List.Item>
                )}
              />
              <div className="public-pagination">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={newsData.length}
                  onChange={setCurrentPage}
                  showSizeChanger={false}
                />
              </div>
            </>
          )}
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
        .public-pagination {
          margin-top: 20px;
          display: flex;
          justify-content: flex-end;
        }
      `}</style>
    </div>
  )
}
