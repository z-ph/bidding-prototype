import { Layout as AntLayout, Menu, Breadcrumb, Avatar, Tag, Button } from 'antd'
import {
  BookOutlined,
  DashboardOutlined,
  FolderOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  UserOutlined,
  ToolOutlined,
  UnorderedListOutlined,
  FileProtectOutlined,
  MoneyCollectOutlined,
  WarningOutlined,
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
  // common 组只保留业务角色工作流入口；评审变更列表/变更时间线为开发阶段台账，
  // 不进业务主导航（fix-dev-ledger-out-of-business-nav-20260718），URL 直达可达
  const common = [
    { key: '/admin/dashboard', label: '工作台', icon: DashboardOutlined },
    { key: '/admin/todo-center', label: '待办中心', icon: ScheduleOutlined }
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
    { key: '/admin/procurement-requirements', label: '采购需求库', icon: FileTextOutlined },
    {
      key: '/admin/biz-records-group',
      label: '业务台账',
      icon: UnorderedListOutlined,
      children: [
        { key: '/admin/notice-list', label: '公告列表' },
        { key: '/admin/supplier-authorization', label: '供应商授权' },
        { key: '/admin/fee-manage', label: '费用台账' }
      ]
    },
    { key: '/admin/approval-center', label: '审批中心', icon: AuditOutlined },
    { key: '/admin/analytics', label: '采购数据分析', icon: BarChartOutlined },
    { key: '/admin/message-center', label: '消息中心', icon: MessageOutlined },
    {
      key: '/admin/system-settings-group',
      label: '系统设置',
      icon: ToolOutlined,
      children: [
        { key: '/admin/approval-flow-config', label: '审批流配置' }
      ]
    }
  ]

  // 招标代理菜单（refactor-agent-menu-workflow-20260718；agent-project-requirement-management-20260721：
  // 代理可管理项目含创建项目、管理采购需求）：阶段操作（招标文件编制/公告发布/专家抽取/中标通知书）
  // 全部下沉到项目驾驶舱携带 projectId 进入，菜单只保留跨项目台账入口
  const agentMenus = [
    {
      key: '/admin/projects-group',
      label: '委托项目',
      icon: FolderOutlined,
      children: [
        { key: '/admin/projects', label: '项目列表' },
        { key: '/admin/projects/create', label: '创建项目' },
        { key: '/admin/projects/track', label: '项目跟踪' }
      ]
    },
    { key: '/admin/procurement-requirements', label: '采购需求库', icon: FileTextOutlined },
    {
      key: '/admin/biz-records-group',
      label: '业务台账',
      icon: UnorderedListOutlined,
      children: [
        { key: '/admin/notice-list', label: '公告列表' },
        { key: '/admin/supplier-authorization', label: '供应商授权' },
        { key: '/admin/fee-manage', label: '费用台账' }
      ]
    },
    { key: '/admin/approval-center', label: '审批中心', icon: AuditOutlined },
    { key: '/admin/analytics', label: '采购数据分析', icon: BarChartOutlined },
    { key: '/admin/message-center', label: '消息中心', icon: MessageOutlined }
  ]

  // 投标人菜单（refactor-bidder-menu-workflow-20260718）：下载/报价/上传/开标/中标通知等阶段操作
  // 全部在项目中心内按项目状态聚合携带 projectId 进入，主导航只保留跨项目入口
  const bidderMenus = [
    { key: '/admin/bidder-projects', label: '项目中心', icon: FolderOutlined },
    { key: '/admin/supplier-profile', label: '企业档案', icon: BankOutlined },
    { key: '/admin/message-center', label: '消息中心', icon: MessageOutlined }
  ]

  // 评标专家菜单（refactor-expert-menu-workflow-20260718）：双任务入口合并为单一
  // 「我的评标任务」，评分详情页（/admin/expert-project）从任务列表携带 projectId 进入
  const expertMenus = [
    { key: '/admin/expert-tasks', label: '我的评标任务', icon: ScheduleOutlined },
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
    {
      key: '/admin/org-group',
      label: '组织与用户',
      icon: TeamOutlined,
      children: [
        { key: '/admin/admin-users', label: '用户权限' },
        { key: '/admin/organization', label: '组织机构' },
        { key: '/admin/sub-accounts', label: '子账号管理' }
      ]
    },
    {
      key: '/admin/sys-config-group',
      label: '系统配置',
      icon: ToolOutlined,
      children: [
        { key: '/admin/system-settings', label: '系统设置' },
        { key: '/admin/admin-dictionary', label: '参数字典' },
        { key: '/admin/notification-manage', label: '通知管理' },
        { key: '/admin/template-manage', label: '模板管理' },
        { key: '/admin/approval-flow-config', label: '审批流配置' }
      ]
    },
    {
      key: '/admin/content-group',
      label: '内容管理',
      icon: FileTextOutlined,
      children: [
        { key: '/admin/admin-news', label: '新闻公告维护' }
      ]
    },
    { key: '/admin/admin-supplier-audit', label: '准入审核', icon: FileProtectOutlined },
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
