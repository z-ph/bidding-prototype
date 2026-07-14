import { useNavigate } from 'react-router-dom'
import { Card, Table, Button, Tag, message } from 'antd'
import { HomeOutlined, DownloadOutlined } from '@ant-design/icons'
import PortalHeader from '../components/PortalHeader.jsx'

const downloadData = [
  { id: 1, name: 'CA数字证书驱动程序', version: 'V3.2.1', updateTime: '2026-07-10', desc: '支持主流CA机构USBKey，适配Windows 10/11', category: '驱动工具' },
  { id: 2, name: '投标文件编制工具', version: 'V2.5.0', updateTime: '2026-07-08', desc: '离线编制投标文件、自动生成清单与签章', category: '投标工具' },
  { id: 3, name: '供应商操作手册', version: 'V2026.07', updateTime: '2026-07-06', desc: '供应商注册、报名、投标、开标全流程图文说明', category: '操作手册' },
  { id: 4, name: '招标人操作手册', version: 'V2026.07', updateTime: '2026-07-06', desc: '项目创建、公告发布、评标定标、合同归档说明', category: '操作手册' },
  { id: 5, name: '招标代理操作手册', version: 'V2026.06', updateTime: '2026-06-28', desc: '代理项目执行、专家抽取、异常处理指南', category: '操作手册' },
  { id: 6, name: '评标专家操作手册', version: 'V2026.06', updateTime: '2026-06-28', desc: '在线评标、打分、出具评标报告操作指南', category: '操作手册' }
]

const categoryColors = {
  驱动工具: 'blue',
  投标工具: 'green',
  操作手册: 'orange'
}

export default function Downloads() {
  const navigate = useNavigate()

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
          onClick={() => message.success(`开始下载：${row.name}`)}
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
