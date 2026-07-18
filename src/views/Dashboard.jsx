import { useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import {
  Button,
  Row,
  Col,
  Card,
  Tag,
  Timeline,
  Table,
  Descriptions,
  message
} from 'antd'
import {
  FolderOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  StarOutlined,
  PlusOutlined,
  UploadOutlined,
  BellOutlined,
  ClockCircleOutlined,
  WalletOutlined,
  SearchOutlined,
  FileProtectOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons'
import { useRole } from '../hooks/useRole.js'
import StatusTag from '../components/StatusTag.jsx'
import AdminDashboard from './AdminDashboard.jsx'
import { projectStore } from '../data/projects.js'
import { evaluationStore } from '../data/evaluationStore.js'
import { supervisorStore } from '../data/supervisorStore.js'

export default function Dashboard() {
  const navigate = useNavigate()
  const { role } = useRole()

  const roleMap = {
    tenderee: '招标人工作台',
    agent: '招标代理工作台',
    bidder: '投标人工作台',
    expert: '评标专家工作台',
    supervisor: '监督工作台',
    admin: '平台管理控制台'
  }
  const roleTitle = roleMap[role] || '工作台'
  const roleSubtitle = useMemo(() => {
    const map = {
      tenderee: '发起采购需求、管理项目、确认评标和定标结果',
      agent: '受委托执行招标流程，编制文件、发公告、组织开评标',
      bidder: '下载文件、上传投标文件、报价',
      expert: '参与评标、独立评分、签署评标报告',
      supervisor: '查看并监督开标、评标、定标全过程',
      admin: '维护系统基础数据、用户权限、日志审计'
    }
    return map[role] || ''
  }, [role])

  // 监督概览三项计数：今日开标/今日评标来自项目与评标 store，异常预警来自 supervisorStore 待处理记录
  const supervisorStats = useMemo(() => {
    if (role !== 'supervisor') return null
    const projects = projectStore.getProjects()
    return {
      todayOpening: projects.filter((p) => p.openTime && dayjs(p.openTime).isSame(dayjs(), 'day')).length,
      todayEvaluating: projects.filter((p) => evaluationStore.getEval(p.id).deadline).length,
      abnormalPending: supervisorStore.getRecords().filter((r) => r.status === '待处理').length
    }
  }, [role])

  const stats = [
    { title: '进行中项目', value: 12, icon: FolderOutlined, bg: '#409EFF' },
    { title: '待开标项目', value: 3, icon: PlayCircleOutlined, bg: '#67C23A' },
    { title: '待评标项目', value: 2, icon: StarOutlined, bg: '#E6A23C' },
    { title: '今日截止', value: 1, icon: ClockCircleOutlined, bg: '#F56C6C' }
  ]

  const bidderStats = [
    { title: '可参与项目', value: 5, icon: SearchOutlined, bg: '#409EFF' },
    { title: '我参与的项目', value: 3, icon: FileProtectOutlined, bg: '#67C23A' },
    { title: '待上传标书', value: 2, icon: UploadOutlined, bg: '#F56C6C' },
    { title: '待开标', value: 1, icon: PlayCircleOutlined, bg: '#E6A23C' }
  ]

  const tendereeTodos = [
    { id: 1, content: 'XX市轨道交通设备采购项目即将开标，请确认开标安排', type: 'warning', time: '2026-07-08 10:00', path: '/admin/opening-hall', projectId: '1' },
    { id: 2, content: '办公桌椅采购项目有 2 家供应商已获取招标文件，请关注投标进展', type: 'primary', time: '2026-07-08 09:30', path: '/admin/projects', projectId: '2' },
    { id: 3, content: '软件开发服务项目评标报告待审批', type: 'danger', time: '2026-07-07 16:00', path: '/admin/award-confirm', projectId: '3' },
    { id: 4, content: '物业服务采购项目中标公告待发布', type: 'success', time: '2026-07-07 11:20', path: '/admin/notice-publish', projectId: '4' }
  ]

  const agentTodos = [
    { id: 1, content: 'XX市轨道交通设备采购项目即将开标，请完成开标前准备', type: 'warning', time: '2026-07-08 10:00', path: '/admin/opening-hall', projectId: '1' },
    { id: 2, content: '办公桌椅采购项目招标文件需复核后发布', type: 'primary', time: '2026-07-08 09:30', path: '/admin/tender-doc', projectId: '2' },
    { id: 3, content: '软件开发服务项目评标报告待汇总提交', type: 'danger', time: '2026-07-07 16:00', path: '/admin/evaluation-hall', projectId: '3' },
    { id: 4, content: '物业服务采购项目中标通知书待发送', type: 'success', time: '2026-07-07 11:20', path: '/admin/award-notice', projectId: '4' }
  ]

  const todos = role === 'agent' ? agentTodos : tendereeTodos

  const bidderTodos = [
    { id: 1, content: 'XX市轨道交通设备采购项目招标文件已发布，请下载并编制投标文件', type: 'warning', time: '2026-07-08', path: '/admin/bid-download', projectId: '1' },
    { id: 2, content: '软件开发服务项目待上传投标文件并报价', type: 'danger', time: '2026-07-07', path: '/admin/bid-upload', projectId: '3' }
  ]

  const expertTasks = [
    { project: 'XX市轨道交通设备采购项目', stage: '评标中', deadline: '2026-07-10 17:00' }
  ]

  const tendereeQuickEntries = [
    { title: '创建项目', icon: PlusOutlined, color: '#409EFF', path: '/admin/projects/create' },
    { title: '审批文件', icon: FileTextOutlined, color: '#909399', path: '/admin/tender-doc' },
    { title: '确认中标', icon: BellOutlined, color: '#E6A23C', path: '/admin/award-confirm' },
    { title: '费用台账', icon: WalletOutlined, color: '#67C23A', path: '/admin/fee-manage' }
  ]

  const agentQuickEntries = [
    { title: '创建项目', icon: PlusOutlined, color: '#409EFF', path: '/admin/projects/create' },
    { title: '发布公告', icon: BellOutlined, color: '#E6A23C', path: '/admin/notice-publish' },
    { title: '开标大厅', icon: PlayCircleOutlined, color: '#67C23A', path: '/admin/opening-hall' },
    { title: '评标大厅', icon: StarOutlined, color: '#F56C6C', path: '/admin/evaluation-hall' }
  ]

  const quickEntries = role === 'agent' ? agentQuickEntries : tendereeQuickEntries

  const recentProjects = [
    { id: 1, name: 'XX市轨道交通设备采购项目', code: 'ZB20260701001', type: '公开招标', stage: '公告中', deadline: '2026-07-20 17:00' },
    { id: 2, name: '办公桌椅采购项目', code: 'ZB20260702002', type: '公开询比价', stage: '待开标', deadline: '2026-07-18 14:00' },
    { id: 3, name: '软件开发服务项目', code: 'ZB20260703003', type: '邀请招标', stage: '评标中', deadline: '2026-07-15 09:00' },
    { id: 4, name: '实验室设备采购项目', code: 'ZB20260705005', type: '公开招标', stage: '招标中', deadline: '2026-07-25 17:00' }
  ]

  const handleTodo = (todo) => {
    if (todo.projectId) {
      navigate({ to: todo.path, search: { projectId: todo.projectId } })
    } else {
      navigate({ to: todo.path })
    }
  }
  const viewProject = (row) => message.success(`查看项目详情：${row.name}`)
  const continueProject = (row) => {
    const map = {
      '招标中': '/admin/tender-doc',
      '公告中': '/admin/projects',
      '待开标': '/admin/opening-hall',
      '评标中': '/admin/evaluation-hall'
    }
    const path = map[row.stage] || '/admin/projects'
    if (row.id && ['/admin/opening-hall', '/admin/tender-doc'].includes(path)) {
      navigate({ to: path, search: { projectId: String(row.id) } })
    } else {
      navigate({ to: path })
    }
  }

  const timelineTypeMap = {
    warning: 'orange',
    primary: 'blue',
    danger: 'red',
    success: 'green'
  }

  const projectColumns = [
    { title: '项目名称', dataIndex: 'name', key: 'name', minWidth: 250 },
    { title: '项目编号', dataIndex: 'code', key: 'code', width: 160 },
    { title: '采购方式', dataIndex: 'type', key: 'type', width: 120 },
    {
      title: '当前阶段',
      dataIndex: 'stage',
      key: 'stage',
      width: 140,
      render: (stage) => <StatusTag label={stage} status={stage} />
    },
    { title: '截止时间', dataIndex: 'deadline', key: 'deadline', width: 150 },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, row) => (
        <>
          <Button type="link" onClick={() => viewProject(row)}>详情</Button>
          <Button type="link" onClick={() => continueProject(row)}>继续</Button>
        </>
      )
    }
  ]

  const expertColumns = [
    { title: '项目名称', dataIndex: 'project', key: 'project', minWidth: 260 },
    { title: '当前阶段', dataIndex: 'stage', key: 'stage', width: 140 },
    { title: '截止时间', dataIndex: 'deadline', key: 'deadline', width: 180 },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: () => (
        <Button type="primary" size="small" onClick={() => navigate({ to: '/admin/expert-tasks' })}>
          开始评标
        </Button>
      )
    }
  ]

  const startTour = () => {
    const commonSteps = [
      {
        element: '.role-banner',
        popover: {
          title: roleTitle,
          description: roleSubtitle,
          side: 'bottom',
          align: 'center'
        }
      }
    ]

    const roleSteps = {
      tenderee: [
        {
          element: '.stat-row',
          popover: {
            title: '数据概览',
            description: '快速了解进行中项目、待开标、待评标和今日截止等核心数据。',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#dashboard-todos',
          popover: {
            title: '待办事项',
            description: '这里列出需要您处理的最新待办，点击“处理”可直达对应页面。',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '#dashboard-quick',
          popover: {
            title: '快捷入口',
            description: '创建项目、发布公告、上传文件、编辑招标文件，一键进入常用功能。',
            side: 'left',
            align: 'start'
          }
        }
      ],
      agent: [
        {
          element: '.stat-row',
          popover: {
            title: '数据概览',
            description: '快速了解进行中项目、待开标、待评标和今日截止等核心数据。',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#dashboard-todos',
          popover: {
            title: '待办事项',
            description: '公告发布、评标报告确认等需要您处理的待办。',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '#dashboard-quick',
          popover: {
            title: '快捷入口',
            description: '创建项目、发布公告、上传文件、编辑招标文件，一键进入常用功能。',
            side: 'left',
            align: 'start'
          }
        }
      ],
      bidder: [
        {
          element: '.stat-row',
          popover: {
            title: '我的投标看板',
            description: '可参与项目、我参与的项目、待上传标书一目了然。',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '.todo-card',
          popover: {
            title: '投标待办',
            description: '系统会按项目进度提醒您接下来该做什么，点击“去处理”即可继续。',
            side: 'right',
            align: 'start'
          }
        }
      ],
      expert: [
        {
          element: '.ant-card',
          popover: {
            title: '评标任务',
            description: '这里显示分配给您评标的项目，点击“开始评标”进入评标大厅。',
            side: 'bottom',
            align: 'start'
          }
        }
      ],
      supervisor: [
        {
          element: '.ant-card',
          popover: {
            title: '监督概览',
            description: '查看今日开标、评标场次和异常预警，进入监督大厅可查看详细过程。',
            side: 'bottom',
            align: 'start'
          }
        }
      ],
      admin: [
        {
          element: '.stat-row',
          popover: {
            title: '平台运营数据',
            description: '注册供应商、待审核供应商、平台项目、异常预警等核心指标。',
            side: 'bottom',
            align: 'start'
          }
        }
      ]
    }

    const driverObj = driver({
      showProgress: true,
      allowClose: true,
      overlayColor: 'rgba(0, 21, 41, 0.75)',
      steps: [...commonSteps, ...(roleSteps[role] || [])]
    })
    driverObj.drive()
  }

  const renderStatCard = (stat) => {
    const Icon = stat.icon
    return (
      <Card hoverable styles={{ body: { padding: '20px' } }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: stat.bg }}>
            <Icon style={{ fontSize: 28, color: '#fff' }} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stat.value}</div>
            <div className="stat-title">{stat.title}</div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="dashboard">
      <div className="role-banner">
        <div>
          <h2>{roleTitle}</h2>
          <p>{roleSubtitle}</p>
        </div>
        <Button icon={<QuestionCircleOutlined />} onClick={startTour}>工作台引导</Button>
      </div>

      {(role === 'tenderee' || role === 'agent') && (
        <>
          <Row gutter={20} className="stat-row">
            {stats.map((stat) => (
              <Col span={6} key={stat.title}>
                {renderStatCard(stat)}
              </Col>
            ))}
          </Row>
          <Row gutter={20} className="module-row">
            <Col span={16}>
              <Card
                title={
                  <div id="dashboard-todos" className="card-header">
                    <span>待办事项</span>
                    <Tag color="error">{todos.length} 项待处理</Tag>
                  </div>
                }
                className="todo-card"
              >
                <Timeline
                  items={todos.map((todo) => ({
                    key: todo.id,
                    color: timelineTypeMap[todo.type],
                    content: (
                      <>
                        <div className="todo-item">
                          <span>{todo.content}</span>
                          <Button type="primary" size="small" onClick={() => handleTodo(todo)}>处理</Button>
                        </div>
                        <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>{todo.time}</div>
                      </>
                    )
                  }))}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card
                title={
                  <div id="dashboard-quick" className="card-header">
                    <span>快捷入口</span>
                  </div>
                }
                className="quick-card"
              >
                <div className="quick-grid">
                  {quickEntries.map((item) => {
                    const Icon = item.icon
                    return (
                      <div key={item.title} className="quick-entry" onClick={() => navigate({ to: item.path })}>
                        <Icon style={{ fontSize: 24, color: item.color }} />
                        <span>{item.title}</span>
                      </div>
                    )
                  })}
                </div>
              </Card>
            </Col>
          </Row>
          <Card
            title={
              <div className="card-header">
                <span>最近项目</span>
                <Button type="link" onClick={() => navigate({ to: '/admin/projects' })}>查看全部</Button>
              </div>
            }
            className="project-card"
          >
            <Table rowKey="id" dataSource={recentProjects} columns={projectColumns} pagination={false} />
          </Card>
        </>
      )}

      {role === 'bidder' && (
        <>
          <Row gutter={20} className="stat-row">
            {bidderStats.map((stat) => (
              <Col span={6} key={stat.title}>
                {renderStatCard(stat)}
              </Col>
            ))}
          </Row>
          <Card
            title={
              <div className="card-header">
                <span>我的投标待办</span>
                <Button type="link" onClick={() => navigate({ to: '/admin/bidder-projects' })}>查看全部项目</Button>
              </div>
            }
          >
            <Timeline
              items={bidderTodos.map((todo) => ({
                key: todo.id,
                color: timelineTypeMap[todo.type],
                content: (
                  <>
                    <div className="todo-item">
                      <span>{todo.content}</span>
                      <Button type="primary" size="small" onClick={() => handleTodo(todo)}>去处理</Button>
                    </div>
                    <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>{todo.time}</div>
                  </>
                )
              }))}
            />
          </Card>
        </>
      )}

      {role === 'expert' && (
        <Card
          title={
            <div className="card-header">
              <span>我的评标任务</span>
              <Button type="link" onClick={() => navigate({ to: '/admin/expert-tasks' })}>进入评标大厅</Button>
            </div>
          }
        >
          <Table rowKey="project" dataSource={expertTasks} columns={expertColumns} pagination={false} />
        </Card>
      )}

      {role === 'supervisor' && (
        <Card
          title={
            <div className="card-header">
              <span>监督概览</span>
              <Button type="link" onClick={() => navigate({ to: '/admin/supervisor-hall' })}>进入监督大厅</Button>
            </div>
          }
        >
          <Descriptions column={3} bordered>
            <Descriptions.Item label="今日开标">{supervisorStats?.todayOpening ?? 0} 场</Descriptions.Item>
            <Descriptions.Item label="今日评标">{supervisorStats?.todayEvaluating ?? 0} 场</Descriptions.Item>
            <Descriptions.Item label="异常预警">{supervisorStats?.abnormalPending ?? 0} 条</Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {role === 'admin' && <AdminDashboard />}

      <style>{`
        .dashboard {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .role-banner {
          background: linear-gradient(90deg, #001529 0%, #003366 100%);
          color: #fff;
          padding: 24px;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .role-banner h2 {
          margin: 0 0 8px;
          color: #fff;
        }
        .role-banner p {
          margin: 0;
          opacity: 0.85;
        }
        .stat-row {
          margin-bottom: 0 !important;
        }
        .stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-value {
          font-size: 28px;
          font-weight: bold;
          color: #001529;
        }
        .stat-title {
          color: #666;
          font-size: 14px;
        }
        .module-row {
          margin-top: 0 !important;
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
        }
        .todo-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .quick-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        .quick-entry {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 20px 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.3s;
          background: #f5f7fa;
        }
        .quick-entry:hover {
          background: #e6f2ff;
        }
        .quick-entry span {
          font-size: 14px;
          color: #333;
        }
        .project-card {
          margin-top: 0;
        }
      `}</style>
    </div>
  )
}
