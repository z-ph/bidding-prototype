// 审批中心：待办 / 已办 / 我发起的（2026-07-17 需求确认清单 48-53）
// 数据源 approvalStore（localStorage mock）；操作后站内信通知（清单 54，messageStore）。
// 待办口径：pendingFor(当前审批身份节点) ∪ pendingFor(用户名)（覆盖转办/加签到具体人）。
// 详情抽屉即审批归档记录视图：节点/动作/操作人/意见/签名(mock)/时间全量只读展示。
import { useMemo, useState } from 'react'
import {
  Alert,
  Badge,
  Button,
  Card,
  Descriptions,
  Drawer,
  Empty,
  Input,
  Modal,
  Select,
  Space,
  Steps,
  Table,
  Tabs,
  Tag,
  Timeline,
  message
} from 'antd'
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  RollbackOutlined,
  SwapOutlined,
  UserAddOutlined
} from '@ant-design/icons'
import { useRole } from '../hooks/useRole.js'
import { approvalStore, APPROVAL_TYPES, APPROVAL_STATUS_MAP } from '../data/approvalStore.js'
import { messageStore } from '../data/messageStore.js'
import { projectStore } from '../data/projects.js'

const ACTION_LABELS = {
  approve: '通过',
  reject: '驳回',
  'add-sign': '加签',
  transfer: '转办',
  return: '退回'
}
const ACTION_COLORS = {
  approve: 'green',
  reject: 'red',
  'add-sign': 'blue',
  transfer: 'purple',
  return: 'orange'
}

// 原型账号目录（加签/转办候选人）；正式环境应来自用户体系
const APPROVER_CANDIDATES = [
  { value: '张三', label: '张三（招标人·采购管理部）' },
  { value: '王五', label: '王五（招标人·需求部门）' },
  { value: '赵六', label: '赵六（招标人·采购管理部）' },
  { value: '李四', label: '李四（招标代理）' }
]

// 招标人侧两个语义审批节点（清单 14/22），原型中共用同一演示账号，可在页面顶部切换身份
const TENDEREE_NODES = [
  { value: '采购管理部', label: '采购管理部' },
  { value: '需求部门', label: '需求部门' }
]

// 项目名兜底（与 TenderDoc 等页面保持一致）
const FALLBACK_PROJECT_NAMES = {
  '1': 'XX市轨道交通设备采购项目',
  '2': '办公桌椅采购项目',
  '3': '软件开发服务项目',
  '4': '物业服务采购项目',
  '5': '实验室设备采购项目'
}

function typeLabel(type) {
  return APPROVAL_TYPES.find((t) => t.value === type)?.label || type
}

export default function ApprovalCenter() {
  const { role, userName } = useRole()
  const [activeTab, setActiveTab] = useState('todo')
  const [refresh, setRefresh] = useState(0)
  // 招标人（tenderee）可在「采购管理部 / 需求部门」两个审批身份间切换；其他角色按本人姓名匹配待办
  const [tendereeNode, setTendereeNode] = useState('采购管理部')
  const [detail, setDetail] = useState(null)
  const [actionModal, setActionModal] = useState({ type: null, record: null })
  const [comment, setComment] = useState('')
  const [target, setTarget] = useState(undefined)

  const identity = role === 'tenderee' ? tendereeNode : userName

  const projectName = (pid) => {
    if (!pid) return '-'
    const stored = projectStore.getProjectById(pid)
    return stored?.name || FALLBACK_PROJECT_NAMES[String(pid)] || `项目 ${pid}`
  }

  // 待办：当前身份节点命中 + 本人姓名命中（转办/加签到人），按 id 去重
  const todoList = useMemo(() => {
    const map = new Map()
    const keys = identity && identity !== userName ? [identity, userName] : [userName]
    keys.forEach((key) => {
      approvalStore.pendingFor(key).forEach((item) => map.set(item.id, item))
    })
    return [...map.values()]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identity, userName, refresh])

  const doneList = useMemo(
    () => approvalStore.doneBy(userName),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userName, refresh]
  )

  const mineList = useMemo(
    () => approvalStore.list({ submittedBy: userName }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userName, refresh]
  )

  const currentNodeText = (item) => {
    if (item.status !== 'pending') return '-'
    const node = item.chain[item.currentNodeIndex] || '-'
    return item.currentAssignee ? `${node}（转办：${item.currentAssignee}）` : node
  }

  // 审批操作后的站内信通知（清单 54）：通过/驳回通知经办人，流转通知下一节点，加签/转办通知到人
  const notifyAfterAction = (item, action, opinion, actionTarget) => {
    const label = typeLabel(item.type)
    const submitterRole = item.publisherKind === 'agent' ? '招标代理' : '招标人'
    if (action === 'approve') {
      if (item.status === 'approved') {
        messageStore.add({
          toRole: submitterRole,
          toUser: item.submittedBy,
          title: `【审批通过】${item.title}`,
          content: `您提交的${label}「${item.title}」已审批通过${opinion ? `，审批意见：${opinion}` : '。'}`,
          type: 'approval'
        })
      } else {
        const node = item.chain[item.currentNodeIndex]
        messageStore.add({
          toRole: node,
          title: `【审批待办】${item.title}`,
          content: `${label}「${item.title}」（提交人：${item.submittedBy}）已流转至「${node}」节点，请及时审批。`,
          type: 'approval'
        })
      }
    } else if (action === 'reject') {
      messageStore.add({
        toRole: submitterRole,
        toUser: item.submittedBy,
        title: `【审批驳回】${item.title}`,
        content: `您提交的${label}「${item.title}」被驳回，原因：${opinion || '未填写'}。请修改后重新提交。`,
        type: 'approval'
      })
    } else if (action === 'add-sign') {
      messageStore.add({
        toUser: actionTarget,
        title: `【审批加签】${item.title}`,
        content: `${userName} 将${label}「${item.title}」加签给您，您将先于当前节点审批，请及时处理。`,
        type: 'approval'
      })
    } else if (action === 'transfer') {
      const node = item.chain[item.currentNodeIndex]
      messageStore.add({
        toUser: actionTarget,
        title: `【审批转办】${item.title}`,
        content: `${userName} 将${label}「${item.title}」（节点：${node}）转办给您，请及时处理。`,
        type: 'approval'
      })
    } else if (action === 'return') {
      const node = item.chain[item.currentNodeIndex]
      messageStore.add({
        toRole: node,
        title: `【审批退回】${item.title}`,
        content: `${label}「${item.title}」被退回至「${node}」节点${opinion ? `，意见：${opinion}` : ''}，请重新处理。`,
        type: 'approval'
      })
    }
  }

  const openAction = (type, record) => {
    setActionModal({ type, record })
    setComment('')
    setTarget(undefined)
  }

  const closeAction = () => setActionModal({ type: null, record: null })

  const submitAction = () => {
    const { type, record } = actionModal
    if (!type || !record) return
    const opinion = comment.trim()
    if (type === 'reject' && !opinion) {
      message.warning('驳回必须填写原因（清单 49）')
      return
    }
    if ((type === 'add-sign' || type === 'transfer') && !target) {
      message.warning(type === 'add-sign' ? '请选择加签人' : '请选择接收人')
      return
    }
    const updated = approvalStore.act(record.id, type, userName, opinion, target || '')
    if (!updated) {
      message.error('操作失败，审批单不存在或已办结')
      return
    }
    notifyAfterAction(updated, type, opinion, target)
    message.success(`「${ACTION_LABELS[type]}」操作已完成`)
    closeAction()
    setDetail(null)
    setRefresh((n) => n + 1)
  }

  const canAct = (record) => record.status === 'pending' && todoList.some((t) => t.id === record.id)

  const actionButtons = (record, size = 'small') => (
    <Space size="small" wrap>
      <Button type="link" size={size} icon={<EyeOutlined />} onClick={() => setDetail(record)}>
        详情
      </Button>
      {canAct(record) && (
        <>
          <Button type="link" size={size} icon={<CheckOutlined />} onClick={() => openAction('approve', record)}>
            通过
          </Button>
          <Button type="link" size={size} danger icon={<CloseOutlined />} onClick={() => openAction('reject', record)}>
            驳回
          </Button>
          <Button type="link" size={size} icon={<UserAddOutlined />} onClick={() => openAction('add-sign', record)}>
            加签
          </Button>
          <Button type="link" size={size} icon={<SwapOutlined />} onClick={() => openAction('transfer', record)}>
            转办
          </Button>
          <Button type="link" size={size} icon={<RollbackOutlined />} onClick={() => openAction('return', record)}>
            退回
          </Button>
        </>
      )}
    </Space>
  )

  const buildColumns = (withActions) => [
    {
      title: '类型',
      dataIndex: 'type',
      width: 100,
      render: (value) => <Tag color="blue">{typeLabel(value)}</Tag>
    },
    {
      title: '标题',
      dataIndex: 'title',
      ellipsis: true
    },
    {
      title: '关联项目',
      dataIndex: 'projectId',
      width: 200,
      ellipsis: true,
      render: (value) => projectName(value)
    },
    { title: '提交人', dataIndex: 'submittedBy', width: 90 },
    {
      title: '当前节点',
      key: 'currentNode',
      width: 160,
      render: (_, record) => currentNodeText(record)
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (value) => {
        const cfg = APPROVAL_STATUS_MAP[value] || { label: value, color: 'default' }
        return <Tag color={cfg.color}>{cfg.label}</Tag>
      }
    },
    { title: '提交时间', dataIndex: 'submittedAt', width: 160 },
    ...(withActions
      ? [{ title: '操作', key: 'action', width: 300, render: (_, record) => actionButtons(record) }]
      : [
          {
            title: '操作',
            key: 'action',
            width: 90,
            render: (_, record) => (
              <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => setDetail(record)}>
                详情
              </Button>
            )
          }
        ])
  ]

  const tabItems = [
    {
      key: 'todo',
      label: (
        <Badge count={todoList.length} size="small" offset={[8, -2]}>
          待办
        </Badge>
      ),
      children: (
        <Table
          rowKey="id"
          columns={buildColumns(true)}
          dataSource={todoList}
          pagination={{ pageSize: 10 }}
          size="small"
          locale={{ emptyText: <Empty description="暂无待办审批" /> }}
        />
      )
    },
    {
      key: 'done',
      label: '已办',
      children: (
        <Table
          rowKey="id"
          columns={buildColumns(false)}
          dataSource={doneList}
          pagination={{ pageSize: 10 }}
          size="small"
          locale={{ emptyText: <Empty description="暂无已办审批" /> }}
        />
      )
    },
    {
      key: 'mine',
      label: '我发起的',
      children: (
        <Table
          rowKey="id"
          columns={buildColumns(false)}
          dataSource={mineList}
          pagination={{ pageSize: 10 }}
          size="small"
          locale={{ emptyText: <Empty description="暂无我发起的审批" /> }}
        />
      )
    }
  ]

  const detailStepsStatus =
    detail?.status === 'approved' ? 'finish' : detail?.status === 'rejected' ? 'error' : 'process'

  const actionModalMeta = {
    approve: { title: '审批通过', opinionLabel: '审批意见（选填）', okText: '确认通过' },
    reject: { title: '审批驳回', opinionLabel: '驳回原因（必填）', okText: '确认驳回', danger: true },
    'add-sign': { title: '加签', opinionLabel: '说明（选填）', okText: '确认加签' },
    transfer: { title: '转办', opinionLabel: '说明（选填）', okText: '确认转办' },
    return: { title: '退回上一节点', opinionLabel: '退回意见（选填）', okText: '确认退回' }
  }
  const modalMeta = actionModalMeta[actionModal.type] || {}

  return (
    <div className="approval-center">
      <Card>
        <div className="header-actions">
          <div>
            <h3>审批中心</h3>
            <p className="tip">
              采购需求 / 招标文件 / 中标结果三类单据的审批处理（清单 48）；支持通过、驳回、加签、转办、退回（清单 52）。
            </p>
          </div>
          {role === 'tenderee' && (
            <Space>
              <span className="identity-label">当前审批身份</span>
              <Select
                style={{ width: 160 }}
                value={tendereeNode}
                onChange={setTendereeNode}
                options={TENDEREE_NODES}
              />
            </Space>
          )}
        </div>

        <Alert
          title={
            role === 'tenderee'
              ? `当前以「${identity}」身份查看待办；转办/加签到「${userName}」的单据同时计入待办。`
              : `待办按当前用户「${userName}」匹配（含转办/加签到本人的单据）。`
          }
          type="info"
          showIcon
          closable={false}
          style={{ marginBottom: 16 }}
        />

        <Tabs activeKey={activeTab} items={tabItems} onChange={setActiveTab} />
      </Card>

      <Drawer
        title="审批单详情（归档记录）"
        size={640}
        open={!!detail}
        onClose={() => setDetail(null)}
        footer={detail && canAct(detail) ? <Space wrap>{actionButtons(detail, 'middle')}</Space> : null}
      >
        {detail && (
          <>
            <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="单据类型">{typeLabel(detail.type)}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={APPROVAL_STATUS_MAP[detail.status]?.color}>
                  {APPROVAL_STATUS_MAP[detail.status]?.label || detail.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="标题" span={2}>{detail.title}</Descriptions.Item>
              <Descriptions.Item label="关联项目" span={2}>{projectName(detail.projectId)}</Descriptions.Item>
              <Descriptions.Item label="提交人">{detail.submittedBy}</Descriptions.Item>
              <Descriptions.Item label="提交时间">{detail.submittedAt}</Descriptions.Item>
              <Descriptions.Item label="当前节点">{currentNodeText(detail)}</Descriptions.Item>
              <Descriptions.Item label="完成时间">{detail.finishedAt || '-'}</Descriptions.Item>
            </Descriptions>

            {detail.type === 'award-result' && detail.docNo && (
              <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
                <Descriptions.Item label="审批文号">{detail.docNo}</Descriptions.Item>
                <Descriptions.Item label="审批日期">{detail.docDate || '-'}</Descriptions.Item>
                <Descriptions.Item label="外部审批结果">
                  <Tag color={detail.result === '通过' ? 'success' : 'error'}>{detail.result || '-'}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="附件">
                  {(detail.attachments || []).join('、') || '-'}
                </Descriptions.Item>
                {detail.remark && (
                  <Descriptions.Item label="备注" span={2}>{detail.remark}</Descriptions.Item>
                )}
              </Descriptions>
            )}

            <h4>审批链</h4>
            <Steps
              size="small"
              current={detail.status === 'pending' ? detail.currentNodeIndex : detail.chain.length}
              status={detailStepsStatus}
              items={detail.chain.map((node) => ({ title: node }))}
              style={{ marginBottom: 24 }}
            />

            <h4>流转记录（节点 / 动作 / 操作人 / 意见 / 签名 / 时间，只读归档）</h4>
            {detail.records.length === 0 ? (
              <Empty description="暂无流转记录" />
            ) : (
              <Timeline
                items={detail.records.map((record, idx) => ({
                  key: idx,
                  color: ACTION_COLORS[record.action] || 'gray',
                  content: (
                    <>
                      <div>
                        <Tag>{record.node}</Tag>
                        <strong>{ACTION_LABELS[record.action] || record.action}</strong>
                        <span style={{ marginLeft: 8 }}>{record.actor}</span>
                      </div>
                      <div style={{ marginTop: 4 }}>
                        意见：{record.comment || '—'}；签名：{record.actor}（电子签名 mock）；附件：—
                      </div>
                      <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>{record.at}</div>
                    </>
                  )
                }))}
              />
            )}
          </>
        )}
      </Drawer>

      <Modal
        title={modalMeta.title}
        open={!!actionModal.type}
        onOk={submitAction}
        onCancel={closeAction}
        okText={modalMeta.okText || '确定'}
        cancelText="取消"
        okButtonProps={{ danger: !!modalMeta.danger }}
        destroyOnHidden
      >
        {actionModal.record && (
          <div style={{ marginBottom: 12 }}>
            <Tag color="blue">{typeLabel(actionModal.record.type)}</Tag>
            <span>{actionModal.record.title}</span>
          </div>
        )}
        {(actionModal.type === 'add-sign' || actionModal.type === 'transfer') && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ marginBottom: 4 }}>
              {actionModal.type === 'add-sign' ? '加签人（先于当前节点审批）' : '接收人（当前节点转由其办理）'}
              <span style={{ color: '#ff4d4f' }}> *</span>
            </div>
            <Select
              style={{ width: '100%' }}
              placeholder={actionModal.type === 'add-sign' ? '请选择加签人' : '请选择接收人'}
              value={target}
              onChange={setTarget}
              options={APPROVER_CANDIDATES}
              showSearch
              optionFilterProp="label"
            />
          </div>
        )}
        {actionModal.type === 'return' && (
          <Alert
            title="退回后审批单回到上一节点重新审批；首节点退回时停留在首节点。"
            type="info"
            showIcon
            closable={false}
            style={{ marginBottom: 12 }}
          />
        )}
        <div style={{ marginBottom: 4 }}>
          {modalMeta.opinionLabel}
          {actionModal.type === 'reject' && <span style={{ color: '#ff4d4f' }}> *</span>}
        </div>
        <Input.TextArea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={actionModal.type === 'reject' ? '请填写驳回原因，将通知经办人' : '请输入'}
          maxLength={500}
          showCount
        />
      </Modal>

      <style>{`
        .approval-center .header-actions {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }
        .approval-center .header-actions h3 {
          margin: 0;
        }
        .approval-center .tip {
          color: #666;
          font-size: 13px;
          margin: 4px 0 0;
        }
        .approval-center .identity-label {
          font-size: 13px;
          color: #666;
        }
      `}</style>
    </div>
  )
}
