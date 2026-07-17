// 消息中心：接入 messageStore（localStorage mock），修 cal-009 闭环缺口
// 可见范围：toUser 指定本人 / toRole 命中当前角色（含「投标人」⊂「投标人/供应商」别名）/ 无接收方的系统广播
// 审批通知（type=approval）由审批中心及各业务页在 create/act 后写入（清单 54）
import { useMemo, useState } from 'react'
import { Button, Card, Empty, Tabs, Tag, Timeline, message } from 'antd'
import { messageStore, MESSAGE_TYPES } from '../data/messageStore.js'
import { useRole } from '../hooks/useRole.js'

const TYPE_LABELS = Object.fromEntries(MESSAGE_TYPES.map((t) => [t.value, t.label]))

// Timeline 颜色按消息类型映射（store 口径：approval / system / notice）
const timelineTypeMap = {
  approval: 'blue',
  system: 'gray',
  notice: 'orange'
}

export default function MessageCenter() {
  const { role, roleName, userName } = useRole()
  const [activeTab, setActiveTab] = useState('all')
  // localStorage 无订阅机制：操作后递增 refresh 触发重读
  const [refresh, setRefresh] = useState(0)

  // 可接收的角色集合：当前角色名 + 招标人的审批节点身份（采购管理部/需求部门，
  // 审批待办通知按节点名投递，与 ApprovalCenter 的审批身份口径一致）
  const acceptedRoles = useMemo(
    () => [roleName, ...(role === 'tenderee' ? ['采购管理部', '需求部门'] : [])],
    [role, roleName]
  )

  const visibleMessages = useMemo(
    () =>
      messageStore.list().filter((item) => {
        if (item.toUser) return item.toUser === userName
        if (!item.toRole) return true // 系统广播
        // 角色别名兼容：roleName「投标人/供应商」与 toRole「投标人」互相包含即命中
        return acceptedRoles.some(
          (r) => item.toRole === r || r.includes(item.toRole) || item.toRole.includes(r)
        )
      }),
    [acceptedRoles, userName, refresh]
  )

  const unreadMessages = visibleMessages.filter((m) => !m.read)

  const markRead = (id) => {
    messageStore.markRead(id)
    setRefresh((n) => n + 1)
  }

  const markAllRead = () => {
    unreadMessages.forEach((m) => messageStore.markRead(m.id))
    setRefresh((n) => n + 1)
    message.success('已全部标记为已读')
  }

  const renderTimeline = (list) => (
    <Timeline
      items={list.map((msg) => ({
        key: msg.id,
        color: timelineTypeMap[msg.type] || 'blue',
        content: (
          <>
            <div className={msg.read ? undefined : 'unread'}>
              <Tag color={timelineTypeMap[msg.type] || 'blue'} style={{ marginRight: 8 }}>
                {TYPE_LABELS[msg.type] || '消息'}
              </Tag>
              <strong>{msg.title}</strong>
              {!msg.read && (
                <Button type="link" size="small" onClick={() => markRead(msg.id)}>
                  标为已读
                </Button>
              )}
              <p>{msg.content}</p>
            </div>
            <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>{msg.createdAt}</div>
          </>
        )
      }))}
    />
  )

  const tabItems = [
    {
      key: 'all',
      label: '全部消息',
      children: visibleMessages.length === 0 ? (
        <Empty description="暂无消息" />
      ) : (
        renderTimeline(visibleMessages)
      )
    },
    {
      key: 'unread',
      label: `未读（${unreadMessages.length}）`,
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
            <Button type="primary" onClick={markAllRead} disabled={unreadMessages.length === 0}>
              全部已读
            </Button>
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
