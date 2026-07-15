import { useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Card, Table, Button, Empty, Alert } from 'antd'
import { StarOutlined } from '@ant-design/icons'
import { expertStore } from '../data/expertStore.js'
import { useRole } from '../hooks/useRole.js'
import StatusTag from '../components/StatusTag.jsx'

const PROJECT_NAMES = {
  '1': 'XX市轨道交通设备采购项目',
  '3': '软件开发服务项目'
}

export default function ExpertTasks() {
  const navigate = useNavigate()
  const { userName } = useRole()
  const tasks = useMemo(() => expertStore.getTasksForExpert(userName), [userName])

  const columns = [
    {
      title: '项目名称',
      dataIndex: 'projectId',
      render: (id) => PROJECT_NAMES[id] || `项目 ${id}`
    },
    { title: '抽取时间', dataIndex: 'extractedAt', width: 180 },
    { title: '通知时间', dataIndex: 'confirmedAt', width: 180 },
    {
      title: '任务状态',
      key: 'status',
      width: 120,
      render: () => <StatusTag label="待评标" status="processing" />
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      render: (_, row) => (
        <Button
          type="primary"
          size="small"
          icon={<StarOutlined />}
          onClick={() => navigate({ to: '/admin/expert-project', search: { projectId: row.projectId } })}
        >
          进入评标
        </Button>
      )
    }
  ]

  return (
    <div className="expert-tasks">
      <Card title={<span><StarOutlined /> 我的评标任务</span>}>
        <Alert
          title="此处展示您被抽取并授权参与评标的任务，点击“进入评标”开始评审。任务来源于招标人/代理在“专家抽取”中的确认结果。"
          type="info"
          showIcon
          closable={false}
          style={{ marginBottom: 20 }}
        />
        {tasks.length > 0 ? (
          <Table rowKey="projectId" dataSource={tasks} columns={columns} pagination={false} />
        ) : (
          <Empty description="暂无评标任务，任务分配后将在此显示" />
        )}
      </Card>
      <style>{`
        .expert-tasks { max-width: 1000px; margin: 0 auto; }
      `}</style>
    </div>
  )
}
