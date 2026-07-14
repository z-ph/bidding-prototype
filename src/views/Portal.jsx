import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import {
  Layout,
  Button,
  Radio,
  Table,
  Tag,
  Pagination,
  Card,
  message
} from 'antd'
import {
  BookOutlined,
  QuestionCircleOutlined,
  UserOutlined,
  DownloadOutlined,
  QuestionOutlined,
  BankOutlined
} from '@ant-design/icons'

const { Group: RadioGroup } = Radio

export default function Portal() {
  const navigate = useNavigate()
  const [noticeType, setNoticeType] = useState('all')

  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      allowClose: true,
      overlayColor: 'rgba(0, 21, 41, 0.75)',
      steps: [
        {
          element: '.logo',
          popover: {
            title: '欢迎来到招投标采购平台',
            description: '这里是平台门户，您可以浏览公告、注册账号或登录系统。',
            side: 'bottom',
            align: 'center'
          }
        },
        {
          element: '#portal-notice-section',
          popover: {
            title: '交易信息',
            description: '这里展示所有招标公告、变更公告、候选人公示和中标公告，您可以按类型筛选。',
            side: 'top',
            align: 'start'
          }
        },
        {
          element: '#portal-notice-table .ant-btn',
          popover: {
            title: '报名参加项目',
            description: '看到合适的项目后，点击“报名”按钮即可进入投标流程。',
            side: 'left',
            align: 'center'
          }
        },
        {
          element: '#portal-quick-links',
          popover: {
            title: '快速入口',
            description: '供应商注册、下载中心、帮助中心、招标人入口，一键直达。',
            side: 'top',
            align: 'start'
          }
        },
        {
          element: '#portal-login-btn',
          popover: {
            title: '开始体验',
            description: '点击登录，选择您的角色，进入对应的工作台。',
            side: 'bottom',
            align: 'center'
          }
        }
      ]
    })
    driverObj.drive()
  }

  const notices = useMemo(
    () => [
      { id: 1, title: 'XX市轨道交通设备采购项目招标公告', typeName: '招标公告', tagType: 'primary', purchaseMode: '公开招标', publishTime: '2026-07-01', deadline: '2026-07-20', canRegister: true },
      { id: 2, title: '办公桌椅采购项目变更公告', typeName: '变更公告', tagType: 'warning', purchaseMode: '公开招标', publishTime: '2026-07-02', deadline: '2026-07-18', canRegister: false },
      { id: 3, title: '软件开发服务项目中标候选人公示', typeName: '候选人公示', tagType: 'success', purchaseMode: '邀请招标', publishTime: '2026-07-03', deadline: '-', canRegister: false },
      { id: 4, title: '物业服务采购项目中标公告', typeName: '中标公告', tagType: 'info', purchaseMode: '公开询比价', publishTime: '2026-07-04', deadline: '-', canRegister: false },
      { id: 5, title: '实验室设备采购项目招标公告', typeName: '招标公告', tagType: 'primary', purchaseMode: '公开招标', publishTime: '2026-07-05', deadline: '2026-07-25', canRegister: true }
    ],
    []
  )

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
    { title: '供应商注册', desc: '成为平台认证供应商', icon: UserOutlined, color: '#409EFF', path: '/login' },
    { title: '下载中心', desc: 'CA驱动、投标工具', icon: DownloadOutlined, color: '#67C23A', path: '/login' },
    { title: '帮助中心', desc: '操作教程与常见问题', icon: QuestionOutlined, color: '#E6A23C', path: '/login' },
    { title: '招标人入口', desc: '发布需求、管理项目', icon: BankOutlined, color: '#F56C6C', path: '/login' }
  ]

  const handleRowClick = (row) => {
    message.success(`查看公告详情：${row.title}`)
  }

  const register = (row) => {
    message.success(`报名参加：${row.title}\n请先登录系统`)
  }

  const columns = [
    {
      title: '公告标题',
      dataIndex: 'title',
      key: 'title',
      minWidth: 300,
      render: (_, row) => (
        <>
          <a>{row.title}</a>
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

  return (
    <div className="portal">
      <Layout.Header className="portal-header">
        <div className="logo">
          <BookOutlined style={{ marginRight: 10, fontSize: 28 }} />
          <span>招投标采购平台</span>
        </div>
        <div className="nav">
          <Button type="link" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>首页</Button>
          <Button type="link" onClick={() => document.getElementById('portal-notice-section')?.scrollIntoView({ behavior: 'smooth' })}>交易信息</Button>
          <Button type="link" onClick={() => message.info('新闻公告功能建设中，敬请期待')}>新闻公告</Button>
          <Button type="link" onClick={() => message.info('帮助中心功能建设中，敬请期待')}>帮助中心</Button>
          <Button type="link" onClick={() => message.info('下载中心功能建设中，敬请期待')}>下载中心</Button>
        </div>
        <div className="actions">
          <Button type="link" icon={<QuestionCircleOutlined />} onClick={startTour}>新手指引</Button>
          <Button type="link" onClick={() => navigate('/register')}>注册</Button>
          <Button id="portal-login-btn" type="primary" onClick={() => navigate('/login')}>登录</Button>
        </div>
      </Layout.Header>

      <div className="banner">
        <h1>全流程电子化招投标采购平台</h1>
        <p>公开、公平、公正、高效、安全</p>
        <div className="stats">
          <div className="stat-item">
            <div className="stat-num">1,256</div>
            <div className="stat-label">累计项目</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">3,890</div>
            <div className="stat-label">注册供应商</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">528</div>
            <div className="stat-label">本月开标</div>
          </div>
        </div>
      </div>

      <div id="portal-notice-section" className="section">
        <div className="section-title">
          <h2>交易信息</h2>
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
        .portal-header {
          background-color: #fff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          position: sticky;
          top: 0;
          z-index: 100;
          height: 64px;
          padding: 0 20px;
          line-height: 64px;
        }
        .logo {
          display: flex;
          align-items: center;
          font-size: 20px;
          font-weight: bold;
          color: #001529;
        }
        .nav {
          display: flex;
          gap: 10px;
        }
        .actions {
          display: flex;
          align-items: center;
        }
        .banner {
          background: linear-gradient(135deg, #001529 0%, #003366 100%);
          color: #fff;
          padding: 60px 20px;
          text-align: center;
        }
        .banner h1 {
          font-size: 36px;
          margin-bottom: 16px;
          color: #fff;
        }
        .banner p {
          font-size: 18px;
          opacity: 0.9;
          margin-bottom: 40px;
        }
        .stats {
          display: flex;
          justify-content: center;
          gap: 80px;
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
