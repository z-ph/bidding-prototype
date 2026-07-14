import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Table, Button, Tag, message } from 'antd'
import { HomeOutlined, DownloadOutlined } from '@ant-design/icons'
import PortalHeader from '../components/PortalHeader.jsx'
import { portalStore } from '../data/portalStore.js'

const categoryColors = {
  驱动工具: 'blue',
  投标工具: 'green',
  操作手册: 'orange'
}

export default function Downloads() {
  const navigate = useNavigate()
  const downloadData = useMemo(() => portalStore.getDownloads(), [])

  const handleDownload = (row) => {
    const blob = new Blob([row.content || ''], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${row.name}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    message.success(`已开始下载：${row.name}`)
  }

  const columns = [
    { title: '文件名称', dataIndex: 'name', key: 'name' },
    { title: '版本', dataIndex: 'version', key: 'version', width: 120 },
    { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime', width: 140 },
    { title: '说明', dataIndex: 'desc', key: 'desc' },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category) => <Tag color={categoryColors[category] || 'default'}>{category}</Tag>
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, row) => (
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          size="small"
          onClick={() => handleDownload(row)}
        >
          下载
        </Button>
      )
    }
  ]

  return (
    <div className="public-page">
      <PortalHeader activeKey="downloads" />
      <div className="public-page-content">
        <Card
          title={<span style={{ fontSize: 18, fontWeight: 'bold' }}>下载中心</span>}
          extra={
            <Button type="link" icon={<HomeOutlined />} onClick={() => navigate('/')}>
              返回首页
            </Button>
          }
        >
          <Table rowKey="id" dataSource={downloadData} columns={columns} pagination={false} />
        </Card>
      </div>
      <style>{`
        .public-page {
          min-height: 100vh;
          background-color: #f5f7fa;
        }
        .public-page-content {
          max-width: 1200px;
          margin: 40px auto;
          padding: 0 20px;
        }
      `}</style>
    </div>
  )
}
