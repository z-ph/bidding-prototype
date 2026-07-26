// @ts-nocheck — TS 渐进迁移基线：解冻本文件时删除本行并修复类型（见 AGENTS.md 技术栈）
import { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Card, Collapse, Button, Input, Select, Empty } from 'antd'
import { HomeOutlined, SearchOutlined } from '@ant-design/icons'
import PortalHeader from '../components/PortalHeader.jsx'
import { portalStore } from '../data/portalStore.js'

const { Option } = Select

const categories = [
  { value: 'all', label: '全部分类' },
  { value: '操作指南', label: '操作指南' },
  { value: '常见问题', label: '常见问题' },
  { value: '政策法规', label: '政策法规' },
  { value: '联系方式', label: '联系方式' }
]

export default function Help() {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState('all')

  const helpDocs = useMemo(() => portalStore.getPublishedHelpDocs(), [])

  const filteredItems = useMemo(() => {
    const term = keyword.trim().toLowerCase()
    return helpDocs.filter((doc) => {
      const matchCategory = category === 'all' || doc.category === category
      if (!matchCategory) return false
      if (!term) return true
      return doc.title.toLowerCase().includes(term) || doc.content.toLowerCase().includes(term)
    })
  }, [keyword, category, helpDocs])

  const collapseItems = filteredItems.map((doc) => ({
    key: String(doc.id),
    label: doc.title,
    children: <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{doc.content}</p>
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
            <Collapse defaultActiveKey={filteredItems.map((i) => String(i.id))} items={collapseItems} />
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
