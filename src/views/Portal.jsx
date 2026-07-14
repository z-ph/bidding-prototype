import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Button,
  Radio,
  Table,
  Tag,
  Pagination,
  Card,
  message
} from 'antd'
import {
  UserOutlined,
  DownloadOutlined,
  QuestionOutlined,
  BankOutlined
} from '@ant-design/icons'
import PortalHeader from '../components/PortalHeader.jsx'

const { Group: RadioGroup } = Radio

export default function Portal() {
  const navigate = useNavigate()
  const [noticeType, setNoticeType] = useState('all')

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
    { title: '供应商注册', desc: '成为平台认证供应商', icon: UserOutlined, color: '#409EFF', path: '/register' },
    { title: '下载中心', desc: 'CA驱动、投标工具', icon: DownloadOutlined, color: '#67C23A', path: '/downloads' },
    { title: '帮助中心', desc: '操作教程与常见问题', icon: QuestionOutlined, color: '#E6A23C', path: '/help' },
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
      <PortalHeader activeKey="home" />

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
