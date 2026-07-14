import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, List, Tag, Button, Pagination, message } from 'antd'
import { HomeOutlined } from '@ant-design/icons'
import PortalHeader from '../components/PortalHeader.jsx'

const newsData = [
  { id: 1, title: '关于平台上线试运行的通知', date: '2026-07-10', category: '平台公告' },
  { id: 2, title: '2026年政府采购电子化招投标培训计划', date: '2026-07-09', category: '培训通知' },
  { id: 3, title: 'CA数字证书办理指南更新说明', date: '2026-07-08', category: '办事指南' },
  { id: 4, title: '关于加强供应商诚信管理的公告', date: '2026-07-07', category: '政策法规' },
  { id: 5, title: '平台系统维护公告（7月12日凌晨）', date: '2026-07-06', category: '平台公告' },
  { id: 6, title: '新版投标文件编制工具发布', date: '2026-07-05', category: '产品更新' },
  { id: 7, title: '2026年第三季度招标采购意向公开', date: '2026-07-04', category: '采购信息' },
  { id: 8, title: '投标人常见问题汇总（2026年7月版）', date: '2026-07-03', category: '常见问题' },
  { id: 9, title: '监督投诉渠道及处理流程公示', date: '2026-07-02', category: '政策法规' },
  { id: 10, title: '平台用户隐私政策更新公告', date: '2026-07-01', category: '平台公告' }
]

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

  const currentData = newsData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

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
          <List
            itemLayout="horizontal"
            dataSource={currentData}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Tag color={categoryColors[item.category] || 'default'} key="tag">
                    {item.category}
                  </Tag>
                ]}
              >
                <List.Item.Meta
                  title={
                    <a onClick={() => message.success(`查看公告详情：${item.title}`)}>
                      {item.title}
                    </a>
                  }
                  description={`发布时间：${item.date}`}
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
