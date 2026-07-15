import { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  Button,
  Radio,
  Table,
  Tag,
  Pagination,
  Card,
  Carousel,
  message
} from 'antd'
import {
  UserOutlined,
  DownloadOutlined,
  QuestionOutlined,
  BankOutlined
} from '@ant-design/icons'
import PortalHeader from '../components/PortalHeader.jsx'
import { portalStore } from '../data/portalStore.js'

const { Group: RadioGroup } = Radio

export default function Portal() {
  const navigate = useNavigate()
  const [noticeType, setNoticeType] = useState('all')

  const notices = useMemo(() => portalStore.getNotices(), [])
  const stats = useMemo(() => portalStore.getStats(), [])

  const typeMap = {
    all: null,
    tender: '招标公告',
    change: '变更公告',
    candidate: '候选人公示',
    result: '中标公告'
  }

  const tagColorMap = {
    primary: 'processing',
    warning: 'orange',
    success: 'success',
    info: 'default'
  }

  const filteredNotices = useMemo(() => {
    if (noticeType === 'all') return notices
    return notices.filter((n) => n.typeName === typeMap[noticeType])
  }, [noticeType, notices])

  const quickLinks = [
    { title: '供应商注册', desc: '成为平台认证供应商', icon: UserOutlined, color: '#409EFF', path: '/register' },
    { title: '下载中心', desc: 'CA驱动、投标工具', icon: DownloadOutlined, color: '#67C23A', path: '/downloads' },
    { title: '帮助中心', desc: '操作教程与常见问题', icon: QuestionOutlined, color: '#E6A23C', path: '/help' },
    { title: '招标人入口', desc: '发布需求、管理项目', icon: BankOutlined, color: '#F56C6C', path: '/login' }
  ]

  const handleRowClick = (row) => {
    navigate(`/notice/${row.id}`)
  }

  const register = (row) => {
    navigate(`/notice/${row.id}`)
  }

  const columns = [
    {
      title: '公告标题',
      dataIndex: 'title',
      key: 'title',
      minWidth: 300,
      render: (_, row) => (
        <>
          <a onClick={(e) => { e.stopPropagation(); navigate(`/notice/${row.id}`) }}>{row.title}</a>
          <Tag color={tagColorMap[row.tagType]} style={{ marginLeft: 8 }}>
            {row.typeName}
          </Tag>
        </>
      )
    },
    { title: '采购方式', dataIndex: 'purchaseMode', key: 'purchaseMode', width: 120 },
    { title: '发布时间', dataIndex: 'publishTime', key: 'publishTime', width: 150 },
    { title: '截止时间', dataIndex: 'deadline', key: 'deadline', width: 150 },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, row) =>
        row.canRegister ? (
          <Button type="primary" size="small" onClick={(e) => { e.stopPropagation(); register(row) }}>
            报名
          </Button>
        ) : null
    }
  ]

  const carouselSlides = [
    {
      key: 1,
      title: '全流程电子化招投标采购平台',
      subtitle: '公开、公平、公正、高效、安全',
      color: 'linear-gradient(135deg, #001529 0%, #003366 100%)'
    },
    {
      key: 2,
      title: '多角色协同工作',
      subtitle: '招标人、投标人、评标专家、监督人员一体化协同',
      color: 'linear-gradient(135deg, #003366 0%, #0066cc 100%)'
    },
    {
      key: 3,
      title: '安全合规的CA认证',
      subtitle: '支持数字证书签章，保障投标文件安全与法律效力',
      color: 'linear-gradient(135deg, #001529 0%, #004080 100%)'
    }
  ]

  return (
    <div className="portal">
      <PortalHeader activeKey="home" />

      <div className="banner">
        <Carousel autoplay autoplaySpeed={5000} dotPlacement="bottom" effect="fade">
          {carouselSlides.map((slide) => (
            <div key={slide.key}>
              <div
                className="carousel-slide"
                style={{ background: slide.color }}
              >
                <h1>{slide.title}</h1>
                <p>{slide.subtitle}</p>
              </div>
            </div>
          ))}
        </Carousel>
        <div className="stats">
          <div className="stat-item">
            <div className="stat-num">{stats.totalProjects.toLocaleString()}</div>
            <div className="stat-label">累计项目</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">{stats.totalSuppliers.toLocaleString()}</div>
            <div className="stat-label">注册供应商</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">{stats.monthlyOpenings.toLocaleString()}</div>
            <div className="stat-label">本月开标</div>
          </div>
        </div>
      </div>

      <div id="portal-notice-section" className="section">
        <div className="section-title">
          <h2>招标公告</h2>
          <RadioGroup value={noticeType} onChange={(e) => setNoticeType(e.target.value)}>
            <Radio.Button value="all">全部</Radio.Button>
            <Radio.Button value="tender">招标公告</Radio.Button>
            <Radio.Button value="change">变更公告</Radio.Button>
            <Radio.Button value="candidate">候选人公示</Radio.Button>
            <Radio.Button value="result">中标公告</Radio.Button>
          </RadioGroup>
        </div>
        <Table
          id="portal-notice-table"
          rowKey="id"
          dataSource={filteredNotices}
          columns={columns}
          pagination={false}
          onRow={(row) => ({ onClick: () => handleRowClick(row) })}
        />
        <div className="pagination">
          <Pagination total={50} showSizeChanger={false} />
        </div>
      </div>

      <div id="portal-quick-links" className="section quick-links">
        {quickLinks.map((link) => {
          const Icon = link.icon
          return (
            <Card
              key={link.title}
              className="quick-card"
              hoverable
              onClick={() => navigate(link.path)}
            >
              <Icon style={{ fontSize: 40, color: link.color }} />
              <h3>{link.title}</h3>
              <p>{link.desc}</p>
            </Card>
          )
        })}
      </div>

      <style>{`
        .portal {
          min-height: 100vh;
          background-color: #f5f7fa;
        }
        .banner {
          background: linear-gradient(135deg, #001529 0%, #003366 100%);
          color: #fff;
          text-align: center;
        }
        .carousel-slide {
          padding: 60px 20px;
          text-align: center;
        }
        .carousel-slide h1 {
          font-size: 36px;
          margin-bottom: 16px;
          color: #fff;
        }
        .carousel-slide p {
          font-size: 18px;
          opacity: 0.9;
          margin-bottom: 0;
        }
        .banner .ant-carousel .slick-dots li button {
          background: rgba(255,255,255,0.5);
        }
        .banner .ant-carousel .slick-dots li.slick-active button {
          background: #409EFF;
        }
        .stats {
          display: flex;
          justify-content: center;
          gap: 80px;
          padding: 40px 20px;
        }
        .stat-item {
          text-align: center;
        }
        .stat-num {
          font-size: 36px;
          font-weight: bold;
          color: #409EFF;
        }
        .stat-label {
          font-size: 14px;
          opacity: 0.8;
        }
        .section {
          max-width: 1200px;
          margin: 40px auto;
          padding: 0 20px;
          scroll-margin-top: 80px;
        }
        .section-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .section-title h2 {
          margin: 0;
        }
        .pagination {
          margin-top: 20px;
          display: flex;
          justify-content: flex-end;
        }
        .quick-links {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        .quick-card {
          text-align: center;
          transition: transform 0.3s;
        }
        .quick-card:hover {
          transform: translateY(-5px);
        }
        .quick-card h3 {
          margin: 12px 0 8px;
          color: #001529;
        }
        .quick-card p {
          color: #666;
          font-size: 14px;
        }
      `}</style>
    </div>
  )
}
