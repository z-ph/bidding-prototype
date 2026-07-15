import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  Card,
  Input,
  Select,
  DatePicker,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  message
} from 'antd'
import { EditOutlined, UndoOutlined, EyeOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import {
  noticeStore,
  NOTICE_TYPES,
  NOTICE_STATUS
} from '../data/notices.js'
import { projectStore } from '../data/projects.js'

export default function NoticeList() {
  const navigate = useNavigate()
  const projects = useMemo(() => projectStore.getProjects(), [])

  const [notices, setNotices] = useState(() => noticeStore.getNotices())
  const [filters, setFilters] = useState({
    keyword: '',
    type: '',
    projectId: '',
    dateRange: null
  })

  const filteredNotices = useMemo(() => {
    return notices.filter((n) => {
      if (filters.type && n.type !== filters.type) return false
      if (filters.projectId && String(n.projectId) !== String(filters.projectId)) return false
      if (filters.keyword) {
        const kw = filters.keyword.trim()
        if (kw && !n.title.includes(kw)) return false
      }
      if (filters.dateRange && n.publishTime) {
        const [start, end] = filters.dateRange
        const t = dayjs(n.publishTime)
        if (t.isBefore(start, 'day') || t.isAfter(end, 'day')) return false
      }
      return true
    })
  }, [notices, filters])

  const refresh = () => {
    setNotices(noticeStore.getNotices())
  }

  const reset = () => {
    setFilters({ keyword: '', type: '', projectId: '', dateRange: null })
  }

  const editDraft = (row) => {
    navigate(`/admin/notice-publish?id=${row.id}`)
  }

  const withdraw = (row) => {
    Modal.confirm({
      title: '撤回公告',
      content: `确认撤回公告“${row.title}”？撤回后该公告将从门户下线。`,
      okText: '确认撤回',
      cancelText: '取消',
      onOk: () => {
        noticeStore.withdrawNotice(row.id)
        refresh()
        message.success('公告已撤回')
      }
    })
  }

  const viewDetail = (row) => {
    navigate(`/notice/${row.id}`)
  }

  const columns = [
    {
      title: '公告标题',
      dataIndex: 'title',
      key: 'title',
      width: 280,
      render: (title, row) => (
        <Button type="link" style={{ padding: 0, whiteSpace: 'normal', textAlign: 'left' }} onClick={() => viewDetail(row)}>
          {title}
        </Button>
      )
    },
    {
      title: '公告类型',
      dataIndex: 'typeName',
      key: 'typeName',
      width: 120,
      render: (text, row) => <Tag color={row.tagType || 'default'}>{text}</Tag>
    },
    {
      title: '关联项目',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 220,
      render: (text) => text || '-'
    },
    {
      title: '发布时间',
      dataIndex: 'publishTime',
      key: 'publishTime',
      width: 160,
      render: (text) => text || '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const meta = NOTICE_STATUS[status] || { text: status, color: 'default' }
        return <Tag color={meta.color}>{meta.text}</Tag>
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, row) => (
        <Space size="small">
          <Button type="link" icon={<EyeOutlined />} onClick={() => viewDetail(row)}>查看</Button>
          {row.status === 'draft' && (
            <Button type="link" icon={<EditOutlined />} onClick={() => editDraft(row)}>编辑</Button>
          )}
          {row.status === 'published' && (
            <Button type="link" icon={<UndoOutlined />} danger onClick={() => withdraw(row)}>撤回</Button>
          )}
        </Space>
      )
    }
  ]

  return (
    <div className="notice-list">
      <Card
        title={
          <div className="notice-list-header">
            <Space wrap>
              <Input
                placeholder="公告标题关键字"
                style={{ width: 220 }}
                allowClear
                value={filters.keyword}
                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
              />
              <Select
                placeholder="公告类型"
                allowClear
                style={{ width: 160 }}
                value={filters.type || undefined}
                onChange={(value) => setFilters({ ...filters, type: value || '' })}
                options={[{ label: '全部', value: '' }, ...NOTICE_TYPES.map((t) => ({ label: t.label, value: t.value }))]}
              />
              <Select
                placeholder="关联项目"
                allowClear
                style={{ width: 220 }}
                value={filters.projectId || undefined}
                onChange={(value) => setFilters({ ...filters, projectId: value || '' })}
                options={[{ label: '全部项目', value: '' }, ...projects.map((p) => ({ label: p.name, value: String(p.id) }))]}
              />
              <DatePicker.RangePicker
                placeholder={['发布开始', '发布结束']}
                value={filters.dateRange}
                onChange={(value) => setFilters({ ...filters, dateRange: value })}
              />
              <Button type="primary" onClick={refresh}>查询</Button>
              <Button onClick={reset}>重置</Button>
            </Space>
            <Button type="primary" onClick={() => navigate('/admin/notice-publish')}>
              发布公告
            </Button>
          </div>
        }
      >
        <Table
          rowKey="id"
          dataSource={filteredNotices}
          columns={columns}
          pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }}
          scroll={{ x: 1100 }}
        />
      </Card>

      <style>{`
        .notice-list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
      `}</style>
    </div>
  )
}
