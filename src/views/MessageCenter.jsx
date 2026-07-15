import { useState } from 'react'
import { Button, Card, Empty, Tabs, Timeline, message } from 'antd'

export default function MessageCenter() {
  const [activeTab, setActiveTab] = useState('all')

  const [messages, setMessages] = useState([
    { id: 1, title: '报名审核通过', content: '您在 XX市轨道交通设备采购项目 的报名已通过审核。', time: '2026-07-08 10:00', type: 'success', read: false },
    { id: 2, title: '开标提醒', content: 'XX市轨道交通设备采购项目 将于 2026-07-08 15:00 开标。', time: '2026-07-08 09:00', type: 'warning', read: false },
    { id: 3, title: '系统通知', content: '平台将于今晚 22:00 进行例行维护。', time: '2026-07-07 18:00', type: 'info', read: true }
  ])

  const unreadMessages = messages.filter((m) => !m.read)

  const timelineTypeMap = {
    warning: 'orange',
    primary: 'blue',
    danger: 'red',
    success: 'green',
    info: 'gray'
  }

  const markAllRead = () => {
    setMessages((prev) => prev.map((m) => ({ ...m, read: true })))
    message.success('已全部标记为已读')
  }

  const renderTimeline = (list) => (
    <Timeline
      items={list.map((msg) => ({
        key: msg.id,
        color: timelineTypeMap[msg.type],
        content: (
          <>
            <div className={msg.read ? undefined : 'unread'}>
              <strong>{msg.title}</strong>
              <p>{msg.content}</p>
            </div>
            <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>{msg.time}</div>
          </>
        )
      }))}
    />
  )

  const tabItems = [
    {
      key: 'all',
      label: '全部消息',
      children: messages.length === 0 ? (
        <Empty description="暂无消息" />
      ) : (
        renderTimeline(messages)
      )
    },
    {
      key: 'unread',
      label: '未读',
      children: unreadMessages.length === 0 ? (
        <Empty description="暂无未读消息" />
      ) : (
        renderTimeline(unreadMessages)
      )
    }
  ]

  return (
    <div className="message-center">
      <Card
        title={
          <div className="card-header">
            <span>消息中心</span>
            <Button type="primary" onClick={markAllRead}>全部已读</Button>
          </div>
        }
      >
        <Tabs
          type="card"
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Card>

      <style>{`
        .message-center {
          max-width: 1000px;
          margin: 0 auto;
        }
        .message-center .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
          width: 100%;
        }
        .unread {
          font-weight: bold;
          color: #001529;
        }
        .unread p {
          font-weight: normal;
          color: #606266;
        }
      `}</style>
    </div>
  )
}
