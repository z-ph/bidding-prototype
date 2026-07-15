import { useNavigate, useLocation } from '@tanstack/react-router'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { Layout, Button, message } from 'antd'
import { BookOutlined, QuestionCircleOutlined } from '@ant-design/icons'

export default function PortalHeader({ activeKey }) {
  const navigate = useNavigate()
  const location = useLocation()

  const startTour = () => {
    const run = () => {
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
              title: '招标公告',
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

    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(run, 400)
    } else {
      run()
    }
  }

  const goHome = () => {
    navigate('/')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const navItemClass = (key) => (activeKey === key ? 'nav-active' : '')

  return (
    <>
      <Layout.Header className="portal-header">
        <div className="logo">
          <BookOutlined style={{ marginRight: 10, fontSize: 28 }} />
          <span>招投标采购平台</span>
        </div>
        <div className="nav">
          <Button type="link" className={navItemClass('home')} onClick={goHome}>首页</Button>
          <Button type="link" className={navItemClass('review')} onClick={() => navigate('/review-change-list')}>评审变更</Button>
          <Button type="link" className={navItemClass('news')} onClick={() => navigate('/news')}>新闻公告</Button>
          <Button type="link" className={navItemClass('help')} onClick={() => navigate('/help')}>帮助中心</Button>
          <Button type="link" className={navItemClass('downloads')} onClick={() => navigate('/downloads')}>下载中心</Button>
          <Button type="link" className={navItemClass('contact')} onClick={() => navigate('/contact')}>联系我们</Button>
        </div>
        <div className="actions">
          <Button type="link" icon={<QuestionCircleOutlined />} onClick={startTour}>新手指引</Button>
          <Button type="link" onClick={() => navigate('/register')}>注册</Button>
          <Button id="portal-login-btn" type="primary" onClick={() => navigate('/login')}>登录</Button>
        </div>
      </Layout.Header>
      <style>{`
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
          cursor: pointer;
        }
        .nav {
          display: flex;
          gap: 10px;
        }
        .nav-active {
          color: #1677ff !important;
          font-weight: 500;
        }
        .actions {
          display: flex;
          align-items: center;
        }
      `}</style>
    </>
  )
}
