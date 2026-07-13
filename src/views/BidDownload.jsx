import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Button, Card, Steps, Table, Tag, message } from 'antd'

export default function BidDownload() {
  const navigate = useNavigate()

  const [files] = useState([
    { name: 'XX市轨道交通设备采购项目-招标文件.pdf', version: 'V1.0', updateTime: '2026-07-01 10:00', size: '5.2 MB' },
    { name: 'XX市轨道交通设备采购项目-澄清说明（一）.pdf', version: 'V1.1', updateTime: '2026-07-05 16:30', size: '0.8 MB' },
    { name: '图纸及技术参数.zip', version: '-', updateTime: '2026-07-01 10:00', size: '120 MB' }
  ])

  const preview = (row) => {
    message.success(`在线预览：${row.name}`)
  }

  const download = (row) => {
    message.success(`开始下载：${row.name}`)
  }

  const columns = [
    { title: '文件名称', dataIndex: 'name', key: 'name', minWidth: 300 },
    { title: '版本', dataIndex: 'version', key: 'version', width: 100 },
    { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime', width: 180 },
    { title: '大小', dataIndex: 'size', key: 'size', width: 120 },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, row) => (
        <>
          <Button type="link" onClick={() => preview(row)}>预览</Button>
          <Button type="primary" size="small" onClick={() => download(row)}>下载</Button>
        </>
      )
    }
  ]

  return (
    <div className="bid-download">
      <Card
        title={
          <div className="card-header">
            <span>招标文件下载</span>
            <Tag color="success">项目：XX市轨道交通设备采购项目</Tag>
          </div>
        }
      >
        <Steps
          size="small"
          current={2}
          style={{ marginBottom: 24 }}
          items={['报名通过', '缴纳文件费', '下载招标文件', '编制投标文件', '上传投标文件'].map((title) => ({ title }))}
        />
        <Alert
          message="下载后请使用投标文件制作工具离线编制，开标前务必完成签章和加密。"
          type="info"
          showIcon
          closable={false}
          style={{ marginBottom: 20 }}
        />
        <Table
          columns={columns}
          dataSource={files}
          rowKey="name"
          pagination={false}
          style={{ width: '100%' }}
        />
        <div className="next-step">
          <span>文件已获取？</span>
          <Button type="primary" onClick={() => navigate('/admin/bid-quote')}>去填写报价</Button>
          <Button onClick={() => navigate('/admin/bid-upload')}>去上传投标文件</Button>
        </div>
      </Card>

      <style>{`
        .bid-download {
          max-width: 1100px;
          margin: 0 auto;
        }
        .bid-download .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
        }
        .bid-download .next-step {
          margin-top: 24px;
          padding: 16px;
          background: #f5f7fa;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
      `}</style>
    </div>
  )
}
