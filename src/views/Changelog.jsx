import { Card, Space, Tag, Timeline, Typography } from 'antd'
import { CHANGELOG, CHANGE_TYPES } from '../data/changelog.js'

const { Title, Text } = Typography

// 变更时间线：按版本展示功能变更/修复/下线，数据维护在 src/data/changelog.js
export default function Changelog() {
  return (
    <div style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
      <Card>
        <Title level={4} style={{ marginTop: 0 }}>变更时间线</Title>
        <Text type="secondary">
          记录原型每个版本的功能变更、修复与流程下线，最新版本在前。版本号与页面右下角水印、评审导出报告中的 version 一致。
        </Text>
        <Timeline
          style={{ marginTop: 32 }}
          items={CHANGELOG.map((entry, idx) => ({
            color: idx === 0 ? 'blue' : 'gray',
            children: (
              <div>
                <Space size={8} wrap>
                  <Tag color="blue">v{entry.version}</Tag>
                  <Text type="secondary">{entry.date}</Text>
                  <Text strong>{entry.title}</Text>
                </Space>
                <ul style={{ marginTop: 12, paddingLeft: 20 }}>
                  {entry.changes.map((c, i) => {
                    const t = CHANGE_TYPES[c.type] || CHANGE_TYPES.feat
                    return (
                      <li key={i} style={{ marginBottom: 8 }}>
                        <Tag color={t.color} style={{ marginRight: 8 }}>{t.label}</Tag>
                        <Text>{c.text}</Text>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          }))}
        />
      </Card>
    </div>
  )
}
