import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { Alert, Button, Card, Col, Row, Steps, Table, Tabs, message } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'
import StatusTag from '../components/StatusTag.jsx'
import EmptyState from '../components/EmptyState.jsx'

export default function BidderProjects() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('available')

  const [availableProjects] = useState([
    { id: 1, name: 'XX市轨道交通设备采购项目', code: 'ZB20260701001', type: '公开招标', deadline: '2026-07-20 17:00', status: '可报名', blockReason: '' },
    { id: 2, name: '实验室设备采购项目', code: 'ZB20260705005', type: '公开招标', deadline: '2026-07-25 17:00', status: '未准入', blockReason: '资质待审核' },
    { id: 3, name: '办公桌椅采购项目', code: 'ZB20260702002', type: '公开询比价', deadline: '已截止', status: '已截止', blockReason: '报名已截止' }
  ])

  const [joinedProjects] = useState([
    {
      id: 1,
      name: 'XX市轨道交通设备采购项目',
      code: 'ZB20260701001',
      status: '待缴费',
      deadline: '2026-07-20 17:00',
      leftDays: 8,
      stepIndex: 1,
      nextAction: '去缴纳招标文件费',
      nextPath: '/admin/bid-payment',
      blockReason: ''
    },
    {
      id: 3,
      name: '软件开发服务项目',
      code: 'ZB20260703003',
      status: '待上传',
      deadline: '2026-07-15 09:00',
      leftDays: 3,
      stepIndex: 4,
      nextAction: '上传投标文件',
      nextPath: '/admin/bid-upload',
      blockReason: '请确保所有文件已加密后再上传'
    }
  ])

  const viewDetail = (row) => {
    message.success(`查看项目详情：${row.name}`)
  }

  const register = (row) => {
    navigate(`/admin/bid-register?projectId=${row.id}`)
  }

  const goNextAction = (project) => {
    navigate(`${project.nextPath}?projectId=${project.id}`)
  }

  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      allowClose: true,
      overlayColor: 'rgba(0, 21, 41, 0.75)',
      steps: [
        {
          element: '#bidder-tabs',
          popover: {
            title: '项目中心',
            description: '左侧是您可以参与的项目，右侧是您已报名项目的进度跟踪。',
            side: 'bottom',
            align: 'center'
          }
        },
        {
          element: '.bidder-projects .ant-table-tbody .ant-table-row:first-child .ant-btn-sm',
          popover: {
            title: '报名参加',
            description: '找到合适项目后，点击“报名”填写信息并上传资质。不可报名时按钮会说明具体原因。',
            side: 'left',
            align: 'center'
          }
        },
        {
          element: '#tab-joined',
          popover: {
            title: '跟踪进度',
            description: '在“我参与的项目”中以卡片形式查看每个项目的完整进度、剩余时间和下一步操作。',
            side: 'top',
            align: 'center'
          }
        }
      ]
    })
    driverObj.drive()
  }

  const availableColumns = [
    { title: '项目名称', dataIndex: 'name', key: 'name', minWidth: 240 },
    { title: '项目编号', dataIndex: 'code', key: 'code', width: 150 },
    { title: '采购方式', dataIndex: 'type', key: 'type', width: 120 },
    { title: '报名截止', dataIndex: 'deadline', key: 'deadline', width: 150 },
    {
      title: '报名状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <StatusTag label={status} status={status === '可报名' ? 'pending' : 'info'} />
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_, row) => (
        <>
          <Button type="link" onClick={() => viewDetail(row)}>详情</Button>
          {row.status === '可报名' ? (
            <Button type="primary" size="small" onClick={() => register(row)}>报名</Button>
          ) : (
            <Button disabled size="small">{row.blockReason}</Button>
          )}
        </>
      )
    }
  ]

  const tabItems = [
    {
      key: 'available',
      label: '可参与项目',
      children: (
        <Table
          columns={availableColumns}
          dataSource={availableProjects}
          rowKey="id"
          bordered
          pagination={false}
          style={{ width: '100%' }}
        />
      )
    },
    {
      key: 'joined',
      label: <span id="tab-joined">我参与的项目</span>,
      children: (
        <>
          <Row gutter={20}>
            {joinedProjects.map((project) => (
              <Col key={project.id} span={12} style={{ marginBottom: 20 }}>
                <Card
                  hoverable
                  className="project-progress-card"
                  title={
                    <div className="progress-header">
                      <span>{project.name}</span>
                      <StatusTag label={project.status} status={project.status} />
                    </div>
                  }
                >
                  <div className="progress-body">
                    <p className="project-code">项目编号：{project.code}</p>
                    <p className="deadline">截止时间：{project.deadline} · 剩余 {project.leftDays} 天</p>
                    <Steps
                      size="small"
                      current={project.stepIndex}
                      items={['报名', '缴费', '下载', '报价', '上传', '开标'].map((title) => ({ title }))}
                    />
                    {project.blockReason && (
                      <Alert
                        message={project.blockReason}
                        type="warning"
                        showIcon
                        closable={false}
                        style={{ marginTop: 12 }}
                      />
                    )}
                  </div>
                  <div className="progress-footer">
                    <Button type="primary" onClick={() => goNextAction(project)}>
                      {project.nextAction}
                    </Button>
                    <Button type="link" onClick={() => viewDetail(project)}>查看详情</Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
          {joinedProjects.length === 0 && (
            <EmptyState description="您还没有参与任何项目" icon="Folder" />
          )}
        </>
      )
    }
  ]

  return (
    <div className="bidder-projects">
      <Card
        title={
          <div className="card-header">
            <span>项目中心</span>
            <Button type="primary" ghost icon={<QuestionCircleOutlined />} onClick={startTour}>
              投标引导
            </Button>
          </div>
        }
      >
        <div id="bidder-tabs">
          <Tabs
            type="card"
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
          />
        </div>
      </Card>

      <style>{`
        .bidder-projects {
          max-width: 1200px;
          margin: 0 auto;
        }
        .bidder-projects .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
        }
        .bidder-projects .project-progress-card {
          height: 100%;
        }
        .bidder-projects .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
        }
        .bidder-projects .progress-body {
          margin-bottom: 16px;
        }
        .bidder-projects .project-code,
        .bidder-projects .deadline {
          color: #666;
          font-size: 13px;
          margin: 4px 0;
        }
        .bidder-projects .progress-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
      `}</style>
    </div>
  )
}
