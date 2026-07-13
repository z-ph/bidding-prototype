import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Input, Select, Button, Table, Tag, Pagination, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

export default function ProjectList() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [total] = useState(50)
  const [search, setSearch] = useState({
    name: '',
    status: '',
    type: '',
    page: 1,
    pageSize: 10
  })

  const [projects] = useState([
    { id: 1, name: 'XX市轨道交通设备采购项目', code: 'ZB20260701001', type: '公开招标', budget: 850, status: 'registering', publishTime: '2026-07-01', deadline: '2026-07-20' },
    { id: 2, name: '办公桌椅采购项目', code: 'ZB20260702002', type: '公开询比价', budget: 45, status: 'pending_open', publishTime: '2026-07-02', deadline: '2026-07-18' },
    { id: 3, name: '软件开发服务项目', code: 'ZB20260703003', type: '邀请招标', budget: 120, status: 'evaluating', publishTime: '2026-07-03', deadline: '2026-07-15' },
    { id: 4, name: '物业服务采购项目', code: 'ZB20260704004', type: '公开招标', budget: 60, status: 'done', publishTime: '2026-06-20', deadline: '2026-07-05' },
    { id: 5, name: '实验室设备采购项目', code: 'ZB20260705005', type: '公开招标', budget: 230, status: 'tendering', publishTime: '2026-07-05', deadline: '2026-07-25' }
  ])

  const statusMap = {
    draft: { text: '草稿', color: 'default' },
    tendering: { text: '招标中', color: 'success' },
    registering: { text: '报名中', color: 'processing' },
    pending_open: { text: '待开标', color: 'warning' },
    evaluating: { text: '评标中', color: 'error' },
    done: { text: '已完成', color: 'default' }
  }

  const statusText = (s) => statusMap[s]?.text || s
  const statusColor = (s) => statusMap[s]?.color || 'default'

  const nextLabel = (status) => {
    const map = {
      draft: '发布招标',
      tendering: '查看报名',
      registering: '进入开标',
      pending_open: '开标大厅',
      evaluating: '评标大厅',
      done: '归档'
    }
    return map[status] || '详情'
  }

  const loadProjects = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 300)
  }

  const reset = () => {
    setSearch({ name: '', status: '', type: '', page: 1, pageSize: 10 })
    loadProjects()
  }

  const viewDetail = (row) => {
    message.success(`查看项目详情：${row.name}`)
  }

  const edit = (row) => {
    message.success(`编辑项目：${row.name}`)
  }

  const nextStep = (row) => {
    const map = {
      draft: '/admin/notice-publish',
      registering: '/admin/opening-hall',
      pending_open: '/admin/opening-hall',
      evaluating: '/admin/evaluation-hall'
    }
    navigate(map[row.status] || '/admin/projects')
  }

  const columns = [
    { title: '', key: 'index', width: 50, render: (_, __, index) => index + 1 },
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      width: 240,
      render: (name, row) => (
        <Button type="link" onClick={() => viewDetail(row)} style={{ padding: 0 }}>
          {name}
        </Button>
      )
    },
    { title: '项目编号', dataIndex: 'code', key: 'code', width: 150 },
    { title: '采购方式', dataIndex: 'type', key: 'type', width: 110 },
    {
      title: '预算金额',
      dataIndex: 'budget',
      key: 'budget',
      width: 130,
      render: (budget) => `${budget} 万元`
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => <Tag color={statusColor(status)}>{statusText(status)}</Tag>
    },
    { title: '发布时间', dataIndex: 'publishTime', key: 'publishTime', width: 120 },
    { title: '截止时间', dataIndex: 'deadline', key: 'deadline', width: 120 },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_, row) => (
        <>
          <Button type="link" onClick={() => viewDetail(row)}>详情</Button>
          <Button type="link" onClick={() => edit(row)}>编辑</Button>
          <Button type="link" onClick={() => nextStep(row)}>{nextLabel(row.status)}</Button>
        </>
      )
    }
  ]

  return (
    <div className="project-list">
      <Card
        title={
          <div className="header-actions">
            <div className="filter-bar">
              <Input
                placeholder="项目名称/编号"
                style={{ width: 220 }}
                allowClear
                value={search.name}
                onChange={(e) => setSearch({ ...search, name: e.target.value })}
              />
              <Select
                placeholder="项目状态"
                allowClear
                style={{ width: 140 }}
                value={search.status}
                onChange={(value) => setSearch({ ...search, status: value || '' })}
                options={[
                  { label: '全部', value: '' },
                  { label: '草稿', value: 'draft' },
                  { label: '招标中', value: 'tendering' },
                  { label: '报名中', value: 'registering' },
                  { label: '待开标', value: 'pending_open' },
                  { label: '评标中', value: 'evaluating' },
                  { label: '已完成', value: 'done' }
                ]}
              />
              <Select
                placeholder="采购方式"
                allowClear
                style={{ width: 140 }}
                value={search.type || undefined}
                onChange={(value) => setSearch({ ...search, type: value || '' })}
                options={[
                  { label: '公开招标', value: 'open' },
                  { label: '邀请招标', value: 'invitation' },
                  { label: '公开询比价', value: 'inquiry' },
                  { label: '单一来源', value: 'single' }
                ]}
              />
              <Button type="primary" onClick={loadProjects}>查询</Button>
              <Button onClick={reset}>重置</Button>
            </div>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/admin/projects/create')}>
              创建项目
            </Button>
          </div>
        }
      >
        <Table
          rowKey="id"
          dataSource={projects}
          columns={columns}
          loading={loading}
          pagination={false}
        />
        <div className="pagination">
          <Pagination
            total={total}
            pageSize={search.pageSize}
            current={search.page}
            showTotal={(total) => `共 ${total} 条`}
            onChange={(page) => {
              setSearch({ ...search, page })
              loadProjects()
            }}
          />
        </div>
      </Card>

      <style>{`
        .header-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .filter-bar {
          display: flex;
          gap: 12px;
        }
        .pagination {
          margin-top: 20px;
          display: flex;
          justify-content: flex-end;
        }
      `}</style>
    </div>
  )
}
