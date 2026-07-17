import { Layout as AntLayout, Menu, Breadcrumb, Avatar, Tag, Button } from 'antd'
import {
  BookOutlined,
  DashboardOutlined,
  FolderOutlined,
  FileTextOutlined,
  BellOutlined,
  PlayCircleOutlined,
  StarOutlined,
  UserOutlined,
  ToolOutlined,
  UnorderedListOutlined,
  FileProtectOutlined,
  MoneyCollectOutlined,
  WarningOutlined,
  TrophyOutlined,
  WalletOutlined,
  BankOutlined,
  MessageOutlined,
  TeamOutlined,
  ScheduleOutlined,
  BarChartOutlined,
  AuditOutlined
} from '@ant-design/icons'
import { useMemo } from 'react'
import { useNavigate, useLocation, useMatches, Link, Outlet } from '@tanstack/react-router'
import { useRole } from '../hooks/useRole.js'
import { ROLE_COLORS } from '../config/permissions.js'

const { Sider, Header, Content } = AntLayout

function buildItem(item) {
  const icon = item.icon ? <item.icon /> : null
  if (item.children) {
    return {
      key: item.key,
      icon,
      label: item.label,
      children: item.children.map(buildItem)
    }
  }
  return {
    key: item.key,
    icon,
    label: <Link to={item.key}>{item.label}</Link>
  }
}

function useMenuItems(role) {
  const common = [
    { key: '/admin/dashboard', label: '工作台', icon: DashboardOutlined },
    { key: '/admin/todo-center', label: '待办中心', icon: ScheduleOutlined },
    { key: '/admin/review-change-list', label: '评审变更列表', icon: UnorderedListOutlined }
  ]

  const tendereeMenus = [
    {
      key: '/admin/projects-group',
      label: '项目管理',
      icon: FolderOutlined,
      children: [
        { key: '/admin/projects', label: '项目列表' },
        { key: '/admin/projects/create', label: '创建项目' },
        { key: '/admin/projects/track', label: '项目跟踪' }
      ]
    },
    { key: '/admin/procurement-requirements', label: '采购需求', icon: FileTextOutlined },
    { key: '/admin/tender-doc', label: '招标文件', icon: FileTextOutlined },
    { key: '/admin/notice-publish', label: '发布公告', icon: BellOutlined },
    { key: '/admin/notice-list', label: '公告列表', icon: BellOutlined },
    { key: '/admin/supplier-authorization', label: '供应商授权', icon: TeamOutlined },
    { key: '/admin/fee-manage', label: '费用管理', icon: WalletOutlined },
    { key: '/admin/objection-manage', label: '异议管理', icon: WarningOutlined },
    { key: '/admin/award-confirm', label: '确认中标人', icon: TrophyOutlined },
    { key: '/admin/award-notice', label: '中标通知书', icon: BookOutlined },
    { key: '/admin/contract-archive', label: '合同归档', icon: FileProtectOutlined },
    { key: '/admin/approval-center', label: '审批中心', icon: AuditOutlined },
    { key: '/admin/approval-flow-config', label: '审批流配置', icon: ToolOutlined },
    { key: '/admin/analytics', label: '采购数据分析', icon: BarChartOutlined },
    { key: '/admin/message-center', label: '消息中心', icon: MessageOutlined }
  ]

  const agentMenus = [
    {
      key: '/admin/projects-group',
      label: '委托项目',
      icon: FolderOutlined,
      children: [
        { key: '/admin/projects', label: '项目列表' },
        { key: '/admin/projects/track', label: '项目跟踪' }
      ]
    },
    { key: '/admin/tender-doc', label: '招标文件编制', icon: FileTextOutlined },
    { key: '/admin/notice-publish', label: '公告发布', icon: BellOutlined },
    { key: '/admin/notice-list', label: '公告列表', icon: BellOutlined },
    { key: '/admin/supplier-authorization', label: '供应商授权', icon: TeamOutlined },
    { key: '/admin/fee-manage', label: '费用管理', icon: WalletOutlined },
    { key: '/admin/expert-extraction', label: '专家抽取', icon: TeamOutlined },
    { key: '/admin/objection-manage', label: '异议处理', icon: WarningOutlined },
    { key: '/admin/award-notice', label: '中标通知书', icon: BookOutlined },
    { key: '/admin/approval-center', label: '审批中心', icon: AuditOutlined },
    { key: '/admin/analytics', label: '采购数据分析', icon: BarChartOutlined },
    { key: '/admin/message-center', label: '消息中心', icon: MessageOutlined }
  ]

  const bidderMenus = [
    { key: '/admin/bidder-projects', label: '项目中心', icon: FolderOutlined },
    { key: '/admin/bid-register', label: '项目报名', icon: FileProtectOutlined },
    { key: '/admin/bid-quote', label: '在线报价', icon: WalletOutlined },
    { key: '/admin/opening-hall', label: '开标大厅', icon: PlayCircleOutlined },
    { key: '/admin/award-notice', label: '中标通知', icon: TrophyOutlined },
    { key: '/admin/supplier-profile', label: '企业档案', icon: BankOutlined },
    { key: '/admin/bidder-invoices', label: '发票申请', icon: BookOutlined },
    { key: '/admin/message-center', label: '消息中心', icon: MessageOutlined }
  ]

  const expertMenus = [
    { key: '/admin/expert-tasks', label: '我的任务', icon: ScheduleOutlined },
    { key: '/admin/expert-project', label: '评标任务', icon: StarOutlined },
    { key: '/admin/expert-profile', label: '专家信息', icon: UserOutlined },
    { key: '/admin/message-center', label: '消息中心', icon: MessageOutlined }
  ]

  const supervisorMenus = [
    { key: '/admin/supervisor-hall', label: '监督大厅', icon: PlayCircleOutlined },
    { key: '/admin/supervisor-abnormal', label: '异常登记', icon: WarningOutlined },
    { key: '/admin/supervisor-logs', label: '操作日志', icon: UnorderedListOutlined },
    { key: '/admin/message-center', label: '消息中心', icon: MessageOutlined }
  ]

  const adminMenus = [
    { key: '/admin/dashboard', label: '工作台', icon: DashboardOutlined },
    { key: '/admin/todo-center', label: '待办中心', icon: ScheduleOutlined },
    { key: '/admin/admin-dashboard', label: '管理控制台', icon: DashboardOutlined },
    { key: '/admin/procurement-requirements', label: '采购需求', icon: FileTextOutlined },
    { key: '/admin/admin-users', label: '用户权限', icon: UserOutlined },
    { key: '/admin/notification-manage', label: '通知管理', icon: BellOutlined },
    { key: '/admin/template-manage', label: '模板管理', icon: FileTextOutlined },
    { key: '/admin/system-settings', label: '系统设置', icon: ToolOutlined },
    { key: '/admin/admin-dictionary', label: '参数字典', icon: ToolOutlined },
    { key: '/admin/admin-supplier-audit', label: '准入审核', icon: FileProtectOutlined },
    { key: '/admin/admin-news', label: '新闻公告维护', icon: FileTextOutlined },
    { key: '/admin/organization', label: '组织机构', icon: BankOutlined },
    { key: '/admin/sub-accounts', label: '子账号管理', icon: UserOutlined },
    { key: '/admin/admin-logs', label: '日志审计', icon: UnorderedListOutlined },
    { key: '/admin/analytics', label: '采购数据分析', icon: BarChartOutlined },
    { key: '/admin/message-center', label: '消息中心', icon: MessageOutlined }
  ]

  const roleMenus = {
    tenderee: [...common, ...tendereeMenus],
    agent: [...common, ...agentMenus],
    bidder: [...common, ...bidderMenus],
    expert: [...common, ...expertMenus],
    supervisor: [...common, ...supervisorMenus],
    admin: adminMenus
  }

  return (roleMenus[role] || common).map(buildItem)
}

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const matches = useMatches()
  const { role, roleName, userName, clearRole } = useRole()

  const menuItems = useMenuItems(role)

  const pageTitle = useMemo(() => {
    const leaf = matches[matches.length - 1]
    if (!leaf) return ''
    return leaf.staticData?.title || ''
  }, [matches])

  const logout = () => {
    clearRole()
    navigate({ to: '/login' })
  }

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider width={240} style={{ backgroundColor: '#001529', color: '#fff' }}>
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            fontWeight: 'bold',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer'
          }}
          onClick={() => navigate({ to: '/' })}
          title="返回门户首页"
        >
          <BookOutlined style={{ marginRight: 10, fontSize: 24 }} />
          <span>招投标平台</span>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{ backgroundColor: '#001529' }}
          items={menuItems}
        />
      </Sider>
      <AntLayout>
        <Header style={{
          backgroundColor: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          padding: '0 24px'
        }}>
          <div>
            <Breadcrumb
              items={[
                { title: <Link to="/admin/dashboard">工作台</Link> },
                { title: pageTitle }
              ]}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Tag color={ROLE_COLORS[role] || '#475569'}>{roleName}</Tag>
            <Avatar size={32} icon={<UserOutlined />} />
            <span>{userName}</span>
            <Button type="link" onClick={logout}>退出</Button>
          </div>
        </Header>
        <Content style={{ padding: 20, backgroundColor: '#f5f7fa' }}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  )
}
