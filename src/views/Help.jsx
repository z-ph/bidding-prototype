import { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Card, Collapse, Button, Input, Select, Empty } from 'antd'
import { HomeOutlined, SearchOutlined } from '@ant-design/icons'
import PortalHeader from '../components/PortalHeader.jsx'

const { Option } = Select

const helpItems = [
  {
    key: 'beginner',
    label: '新手入门',
    children: (
      <>
        <p><strong>Q：如何注册成为平台供应商？</strong></p>
        <p>A：点击首页右上角“注册”，选择“供应商”角色，填写企业基本信息并上传营业执照、资质证书等材料，提交后等待平台管理员审核。</p>
        <p><strong>Q：平台支持哪些采购方式？</strong></p>
        <p>A：目前支持公开招标、邀请招标、公开询比价、竞争性谈判、邀请询比价等多种采购方式。</p>
      </>
    )
  },
  {
    key: 'process',
    label: '投标流程',
    children: (
      <>
        <p><strong>Q：如何报名参加项目？</strong></p>
        <p>A：在首页“招标公告”找到目标项目，点击“报名”按钮，按提示缴纳保证金并确认报名信息。</p>
        <p><strong>Q：投标文件如何上传？</strong></p>
        <p>A：报名成功后进入“我参与的项目”，选择对应项目点击“上传投标文件”，使用CA证书签章后提交。</p>
        <p><strong>Q：开标时需要做什么？</strong></p>
        <p>A：在指定时间进入“开标大厅”，完成身份认证后即可在线解密、确认报价并查看开标记录。</p>
      </>
    )
  },
  {
    key: 'faq',
    label: '常见问题',
    children: (
      <>
        <p><strong>Q：忘记CA证书密码怎么办？</strong></p>
        <p>A：请联系您的CA证书颁发机构进行密码重置，或拨打平台技术支持电话咨询。</p>
        <p><strong>Q：为什么看不到某个项目的报名按钮？</strong></p>
        <p>A：请确认您已使用供应商账号登录，且项目仍处于报名有效期内；邀请招标项目需收到邀请后方可报名。</p>
      </>
    )
  },
  {
    key: 'ca',
    label: 'CA证书',
    children: (
      <>
        <p><strong>Q：如何办理CA数字证书？</strong></p>
        <p>A：可在下载中心下载CA驱动及办理指南，按指引到指定CA机构办理。</p>
        <p><strong>Q：CA证书插入后无法识别？</strong></p>
        <p>A：请确认已安装最新版CA驱动，并尝试更换USB接口或浏览器。</p>
      </>
    )
  },
  {
    key: 'contact',
    label: '联系我们',
    children: (
      <>
        <p><strong>平台技术支持</strong></p>
        <p>电话：400-123-4567（工作日 9:00-18:00）</p>
        <p>邮箱：support@bidding-platform.example.com</p>
        <p>地址：XX市XX区公共资源交易中心 3 楼电子招投标服务窗口</p>
      </>
    )
  }
]

const categories = [
  { value: 'all', label: '全部分类' },
  { value: 'beginner', label: '新手入门' },
  { value: 'process', label: '投标流程' },
  { value: 'faq', label: '常见问题' },
  { value: 'ca', label: 'CA证书' },
  { value: 'contact', label: '联系我们' }
]

export default function Help() {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState('all')

  const filteredItems = useMemo(() => {
    const term = keyword.trim().toLowerCase()
    return helpItems.filter((item) => {
      const matchCategory = category === 'all' || item.key === category
      if (!matchCategory) return false
      if (!term) return true
      const text = (item.label + ' ' + extractText(item.children)).toLowerCase()
      return text.includes(term)
    })
  }, [keyword, category])

  const collapseItems = filteredItems.map((item) => ({
    key: item.key,
    label: item.label,
    children: item.children
  }))

  return (
    <div className="public-page">
      <PortalHeader activeKey="help" />
      <div className="public-page-content">
        <Card
          title={<span style={{ fontSize: 18, fontWeight: 'bold' }}>帮助中心</span>}
          extra={
            <Button type="link" icon={<HomeOutlined />} onClick={() => navigate({ to: '/' })}>
              返回首页
            </Button>
          }
        >
          <div className="help-filter">
            <Input
              placeholder="请输入关键词搜索"
              prefix={<SearchOutlined />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              allowClear
              style={{ width: 280 }}
            />
            <Select
              value={category}
              onChange={setCategory}
              style={{ width: 160 }}
            >
              {categories.map((c) => (
                <Option key={c.value} value={c.value}>{c.label}</Option>
              ))}
            </Select>
          </div>
          {filteredItems.length === 0 ? (
            <Empty description="未找到匹配的帮助内容" style={{ marginTop: 40 }} />
          ) : (
            <Collapse defaultActiveKey={filteredItems.map((i) => i.key)} items={collapseItems} />
          )}
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
        .help-filter {
          display: flex;
          gap: 16px;
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  )
}

function extractText(node) {
  if (typeof node === 'string') return node
  if (Array.isArray(node)) return node.map(extractText).join(' ')
  if (node && typeof node === 'object') {
    return extractText(node.props?.children || '')
  }
  return ''
}
