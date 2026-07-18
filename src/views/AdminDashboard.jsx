import { useNavigate } from '@tanstack/react-router'
import { Button, Card, Col, Row, Timeline } from 'antd'
import {
  UserOutlined,
  FileDoneOutlined,
  FolderOpenOutlined,
  WarningOutlined,
  TeamOutlined,
  SettingOutlined,
  ProfileOutlined
} from '@ant-design/icons'

export default function AdminDashboard() {
  const navigate = useNavigate()

  const stats = [
    { title: '注册供应商', value: 389, icon: UserOutlined, bg: '#409EFF' },
    { title: '待审核供应商', value: 12, icon: FileDoneOutlined, bg: '#67C23A' },
    { title: '平台项目', value: 1256, icon: FolderOpenOutlined, bg: '#E6A23C' },
    { title: '异常预警', value: 3, icon: WarningOutlined, bg: '#F56C6C' }
  ]

  const todos = [
    { id: 1, content: '12 家新注册供应商等待准入审核', type: 'warning', time: '2026-07-08', path: '/admin/admin-supplier-audit' },
    { id: 2, content: '5 位专家注册等待资质审核', type: 'primary', time: '2026-07-08', path: '/admin/admin-supplier-audit' },
    { id: 3, content: '系统检测到 3 条疑似串标预警', type: 'danger', time: '2026-07-07', path: '/admin/admin-logs' }
  ]

  const quickEntries = [
    { title: '用户权限', icon: TeamOutlined, color: '#409EFF', path: '/admin/admin-users' },
    { title: '参数字典', icon: SettingOutlined, color: '#67C23A', path: '/admin/admin-dictionary' },
    { title: '供应商审核', icon: FileDoneOutlined, color: '#E6A23C', path: '/admin/admin-supplier-audit' },
    { title: '日志审计', icon: ProfileOutlined, color: '#909399', path: '/admin/admin-logs' }
  ]

  const timelineTypeMap = {
    warning: 'orange',
    primary: 'blue',
    danger: 'red',
    success: 'green'
  }

  const handleTodo = (todo) => navigate({ to: todo.path })

  return (
    <div className="admin-dashboard">
      <Row gutter={20} className="stat-row">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Col span={6} key={stat.title}>
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
            </Col>
          )
        })}
      </Row>

      <Row gutter={20} className="module-row">
        <Col span={12}>
          <Card
            title={
              <div className="card-header">
                <span>待审核事项</span>
              </div>
            }
          >
            <Timeline
              items={todos.map((todo) => ({
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
        </Col>
        <Col span={12}>
          <Card
            title={
              <div className="card-header">
                <span>快捷管理入口</span>
              </div>
            }
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

      <style>{`
        .admin-dashboard {
          display: flex;
          flex-direction: column;
          gap: 20px;
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
          width: 100%;
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
      `}</style>
    </div>
  )
}
