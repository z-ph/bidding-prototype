import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { Alert, Button, Card, Col, Modal, Row, Steps, Table, Tabs, message } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'
import StatusTag from '../components/StatusTag.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { useRole } from '../hooks/useRole.js'
import { projectStore } from '../data/projects.js'
import { authorizationStore } from '../data/authorizationStore.js'

// 投标邀请响应持久化（localStorage，key 前缀 bidding-）
// 结构：{ "<projectId>::<supplierName>": { status: 'accepted' | 'rejected', respondedAt } }
// 招标人/代理侧（SupplierAuthorization 邀请状态跟踪）读取同一 key。
export const INVITATION_RESPONSES_KEY = 'bidding-invitation-responses'

const PURCHASE_MODE_LABELS = {
  open: '公开招标',
  invitation: '邀请招标',
  inquiry: '公开询比价',
  invitation_inquiry: '邀请询比价'
}

const INVITATION_STATUS = {
  pending: { label: '待接受邀请', tagStatus: 'pending' },
  accepted: { label: '已接受邀请', tagStatus: 'completed' },
  rejected: { label: '已拒绝邀请', tagStatus: 'rejected' }
}

function loadInvitationResponses() {
  try {
    const raw = localStorage.getItem(INVITATION_RESPONSES_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveInvitationResponses(data) {
  try {
    localStorage.setItem(INVITATION_RESPONSES_KEY, JSON.stringify(data))
  } catch {
    // ignore storage errors
  }
}

// 投标邀请书 mock 文本：项目信息/标段/时间由项目数据填充，模板为占位（真实模板联系采购管理部）
function buildInvitationLetter(project, invitation, supplierName) {
  const packages = (project.packages || [])
    .map((p) => p.name || p.code)
    .filter(Boolean)
    .join('、') || '详见招标文件'
  const deadline = project.deadline || project.packages?.[0]?.bidEnd || '详见招标公告'
  const openTime = project.openTime || '详见招标公告'
  return [
    '投 标 邀 请 书',
    '',
    `编号：${invitation.code}`,
    `致：${supplierName || invitation.supplierName || invitation.supplierId}`,
    '',
    `贵单位已被邀请参加「${project.name}」（项目编号：${project.code || project.id}）的投标活动。`,
    `采购方式：${project.type || PURCHASE_MODE_LABELS[project.purchaseMode] || '邀请招标'}`,
    `标段：${packages}`,
    `投标截止时间：${deadline}`,
    `开标时间：${openTime}`,
    '',
    '请登录招投标采购平台下载招标文件，并按文件要求编制、上传投标文件。',
    '',
    `生成时间：${invitation.generatedAt}`,
    '（本邀请书由系统自动生成，内容为原型占位模板；真实模板维护请联系采购管理部。）'
  ].join('\n')
}

function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function applyDataScope(items, scope, userInfo) {
  if (!scope || scope === 'all' || !userInfo) return items
  if (scope === 'enterprise') return items
  if (scope === 'department') {
    return items.filter((item) => !item.deptCode || item.deptCode === userInfo.deptCode)
  }
  if (scope === 'self') {
    return items.filter((item) => !item.owner || item.owner === userInfo.nickname || item.owner === userInfo.account)
  }
  return items
}

export default function BidderProjects() {
  const navigate = useNavigate()
  const { userInfo, dataScope } = useRole()
  const [activeTab, setActiveTab] = useState('available')
  // 当前供应商身份：mock 环境以企业名称（nickname/org）作为供应商标识
  const supplierName = userInfo?.nickname || userInfo?.org || ''

  const [invitationResponses, setInvitationResponses] = useState(loadInvitationResponses)
  const [letterModal, setLetterModal] = useState({ open: false, project: null, invitation: null, text: '' })

  // 种子项目：2 个公开项目 + 1 个受邀邀请项目 + 1 个未受邀邀请项目（演示可见性过滤）
  // 项目 3 与 authorizationStore 种子授权记录一致（A科技有限公司已授权，可下载招标文件）
  const [seedProjects] = useState([
    { id: 1, name: 'XX市轨道交通设备采购项目', code: 'ZB20260701001', purchaseMode: 'open', deadline: '2026-07-20 17:00', openTime: '2026-07-21 09:30', owner: '张三', deptCode: 'CG' },
    { id: 2, name: '实验室设备采购项目', code: 'ZB20260705005', purchaseMode: 'inquiry', deadline: '2026-07-25 17:00', openTime: '2026-07-26 09:30', owner: '张三', deptCode: 'CG' },
    {
      id: 3,
      name: '软件开发服务项目',
      code: 'ZB20260703003',
      purchaseMode: 'invitation',
      deadline: '2026-07-18 17:00',
      openTime: '2026-07-19 09:30',
      invitedBidders: ['A科技有限公司', 'B实业有限公司'],
      packages: [{ name: '软件开发服务', code: 'B1' }],
      owner: '张三',
      deptCode: 'CG'
    },
    { id: 4, name: '园区安防设备采购项目', code: 'ZB20260706006', purchaseMode: 'invitation', deadline: '2026-07-22 17:00', openTime: '2026-07-23 09:30', invitedBidders: ['B实业有限公司'], owner: '李四', deptCode: 'ZB' }
  ])

  const [joinedProjects] = useState([
    {
      id: 1,
      name: 'XX市轨道交通设备采购项目',
      code: 'ZB20260701001',
      status: '待开标',
      deadline: '2026-07-21 09:30',
      leftDays: 4,
      stepIndex: 3,
      blockReason: '',
      owner: '张三',
      deptCode: 'CG'
    },
    {
      id: 4,
      name: '实验室设备采购项目',
      code: 'ZB20260705005',
      status: '待上传标书',
      deadline: '2026-07-25 17:00',
      leftDays: 8,
      stepIndex: 2,
      blockReason: '请确保所有文件已加密后再上传',
      owner: '张三',
      deptCode: 'CG'
    },
    {
      id: 3,
      name: '软件开发服务项目',
      code: 'ZB20260703003',
      status: '已定标',
      deadline: '2026-07-15 09:00',
      leftDays: 0,
      stepIndex: 5,
      blockReason: '',
      owner: '张三',
      deptCode: 'CG'
    }
  ])

  // ProjectCreate 持久化的邀请制项目（含受邀名单 invitedBidders）并入项目中心
  const storeInvitationProjects = useMemo(
    () =>
      projectStore
        .getProjects()
        .filter((p) => ['invitation', 'invitation_inquiry'].includes(p.purchaseMode))
        .map((p) => ({
          id: p.id,
          name: p.name,
          code: p.code,
          purchaseMode: p.purchaseMode,
          deadline: p.packages?.[0]?.bidEnd || p.openTime || '-',
          openTime: p.openTime,
          packages: p.packages || [],
          invitedBidders: p.invitedBidders || [],
          owner: p.owner,
          deptCode: p.deptCode
        })),
    []
  )

  const availableProjects = useMemo(() => {
    const merged = [...seedProjects]
    storeInvitationProjects.forEach((p) => {
      if (!merged.some((s) => String(s.id) === String(p.id))) merged.push(p)
    })
    return merged.map((p) => {
      const isInvitation = ['invitation', 'invitation_inquiry'].includes(p.purchaseMode)
      const invited = !isInvitation || (p.invitedBidders || []).includes(supplierName)
      const response = invitationResponses[`${p.id}::${supplierName}`]?.status
      return {
        ...p,
        type: PURCHASE_MODE_LABELS[p.purchaseMode] || p.purchaseMode,
        isInvitation,
        invited,
        invitationStatus: isInvitation ? response || 'pending' : null
      }
    })
  }, [seedProjects, storeInvitationProjects, invitationResponses, supplierName])

  // 新口径：非受邀供应商对邀请招标项目不可见、不可操作（无报名环节，阻断点为可见性与操作入口）
  const visibleProjects = useMemo(() => availableProjects.filter((p) => p.invited), [availableProjects])

  // 投标邀请书自动生成：受邀项目加载即为当前供应商生成邀请书记录（genInvitation 幂等）
  useEffect(() => {
    if (!supplierName) return
    visibleProjects
      .filter((p) => p.isInvitation)
      .forEach((p) => authorizationStore.genInvitation(p.id, supplierName))
  }, [visibleProjects, supplierName])

  const scopedAvailable = useMemo(() => applyDataScope(visibleProjects, dataScope, userInfo), [visibleProjects, dataScope, userInfo])
  const scopedJoined = useMemo(() => applyDataScope(joinedProjects, dataScope, userInfo), [joinedProjects, dataScope, userInfo])

  const viewDetail = (row) => {
    navigate({ to: '/admin/projects/detail/$id', params: { id: String(row.id) } })
  }

  const respondInvitation = (row, status) => {
    const next = {
      ...invitationResponses,
      [`${row.id}::${supplierName}`]: { status, respondedAt: new Date().toLocaleString() }
    }
    saveInvitationResponses(next)
    setInvitationResponses(next)
    if (status === 'accepted') {
      // 接受邀请时确保邀请书已生成（幂等）
      authorizationStore.genInvitation(row.id, supplierName)
      message.success(`已接受「${row.name}」的投标邀请，可下载招标文件并参与投标`)
    } else {
      message.info(`已拒绝「${row.name}」的投标邀请`)
    }
  }

  const openInvitationLetter = (row) => {
    const invitation = authorizationStore.genInvitation(row.id, supplierName)
    setLetterModal({
      open: true,
      project: row,
      invitation,
      text: buildInvitationLetter(row, invitation, supplierName)
    })
  }

  // 按项目状态聚合操作入口（2052-006）：下载/报价/上传/开标大厅/中标通知
  const renderActionButtons = (project) => {
    const go = (to) => () => navigate({ to, search: { projectId: project.id } })
    const entries = {
      download: (
        <Button key="download" size="small" onClick={go('/admin/bid-download')}>
          下载文件
        </Button>
      ),
      quote: (
        <Button key="quote" size="small" onClick={go('/admin/bid-quote')}>
          在线报价
        </Button>
      ),
      upload: (
        <Button key="upload" type="primary" size="small" onClick={go('/admin/bid-upload')}>
          上传投标文件
        </Button>
      ),
      opening: (
        <Button key="opening" type="primary" size="small" onClick={go('/admin/opening-hall')}>
          进入开标大厅
        </Button>
      ),
      award: (
        <Button key="award" type="primary" size="small" onClick={go('/admin/award-notice')}>
          查看中标通知
        </Button>
      )
    }
    const statusEntries = {
      待下载文件: ['download'],
      待报价: ['quote', 'download'],
      待上传标书: ['upload', 'quote', 'download'],
      待开标: ['opening', 'download'],
      开标中: ['opening'],
      已开标: ['opening', 'quote'],
      已定标: ['award'],
      已中标: ['award'],
      已完成: ['award']
    }
    const keys = statusEntries[project.status] || []
    if (keys.length === 0) {
      return [
        <Button key="track" size="small" onClick={go('/admin/projects/track')}>
          跟踪
        </Button>
      ]
    }
    return keys.map((k) => entries[k])
  }

  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      allowClose: true,
      overlayColor: 'rgba(0, 21, 41, 0.75)',
      steps: [
        {
          element: '#bidder-tabs',
          popover: {
            title: '项目中心',
            description: '左侧是您可以参与的项目（含受邀项目），右侧是您已参与项目的进度跟踪。',
            side: 'bottom',
            align: 'center'
          }
        },
        {
          element: '.bidder-projects .ant-table-tbody .ant-table-row:first-child .ant-btn-sm',
          popover: {
            title: '参与项目',
            description: '公开项目可直接下载招标文件并报价；邀请项目需先接受邀请。不可操作时按钮会说明具体原因。',
            side: 'left',
            align: 'center'
          }
        },
        {
          element: '#tab-joined',
          popover: {
            title: '跟踪进度',
            description: '在“我参与的项目”中以卡片形式查看每个项目的完整进度、剩余时间和下一步操作。',
            side: 'top',
            align: 'center'
          }
        }
      ]
    })
    driverObj.drive()
  }

  const renderAvailableActions = (row) => {
    if (!row.isInvitation) {
      return (
        <>
          <Button type="link" onClick={() => viewDetail(row)}>详情</Button>
          <Button size="small" onClick={() => navigate({ to: '/admin/bid-download', search: { projectId: row.id } })}>
            下载招标文件
          </Button>
          <Button size="small" onClick={() => navigate({ to: '/admin/bid-quote', search: { projectId: row.id } })}>
            在线报价
          </Button>
        </>
      )
    }
    if (row.invitationStatus === 'pending') {
      return (
        <>
          <Button type="link" onClick={() => viewDetail(row)}>详情</Button>
          <Button type="primary" size="small" onClick={() => respondInvitation(row, 'accepted')}>
            接受邀请
          </Button>
          <Button danger size="small" onClick={() => respondInvitation(row, 'rejected')}>
            拒绝
          </Button>
          <Button type="link" onClick={() => openInvitationLetter(row)}>邀请书</Button>
        </>
      )
    }
    if (row.invitationStatus === 'accepted') {
      return (
        <>
          <Button type="link" onClick={() => viewDetail(row)}>详情</Button>
          <Button size="small" onClick={() => navigate({ to: '/admin/bid-download', search: { projectId: row.id } })}>
            下载招标文件
          </Button>
          <Button type="primary" size="small" onClick={() => navigate({ to: '/admin/bid-upload', search: { projectId: row.id } })}>
            上传投标文件
          </Button>
          <Button type="link" onClick={() => openInvitationLetter(row)}>邀请书</Button>
        </>
      )
    }
    return (
      <>
        <Button type="link" onClick={() => viewDetail(row)}>详情</Button>
        <Button size="small" onClick={() => respondInvitation(row, 'accepted')}>
          重新接受
        </Button>
        <Button type="link" onClick={() => openInvitationLetter(row)}>邀请书</Button>
      </>
    )
  }

  const availableColumns = [
    { title: '项目名称', dataIndex: 'name', key: 'name', minWidth: 240 },
    { title: '项目编号', dataIndex: 'code', key: 'code', width: 150 },
    { title: '采购方式', dataIndex: 'type', key: 'type', width: 120 },
    { title: '投标截止', dataIndex: 'deadline', key: 'deadline', width: 150 },
    {
      title: '参与状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (_, row) => {
        if (row.isInvitation) {
          const meta = INVITATION_STATUS[row.invitationStatus]
          return <StatusTag label={meta.label} status={meta.tagStatus} />
        }
        return <StatusTag label="可参与" status="completed" />
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 300,
      fixed: 'right',
      render: (_, row) => renderAvailableActions(row)
    }
  ]

  const tabItems = [
    {
      key: 'available',
      label: '可参与项目',
      children: (
        <>
          <Alert
            title="邀请招标/邀请询比价项目仅受邀供应商可见并可操作；接受邀请后即可下载招标文件、参与投标。"
            type="info"
            showIcon
            closable={false}
            style={{ marginBottom: 16 }}
          />
          <Table
            columns={availableColumns}
            dataSource={scopedAvailable}
            rowKey="id"
            bordered
            pagination={false}
            style={{ width: '100%' }}
          />
        </>
      )
    },
    {
      key: 'joined',
      label: <span id="tab-joined">我参与的项目</span>,
      children: (
        <>
          <Row gutter={20}>
            {scopedJoined.map((project) => (
              <Col key={project.id} span={12} style={{ marginBottom: 20 }}>
                <Card
                  hoverable
                  className="project-progress-card"
                  title={
                    <div className="progress-header">
                      <span>{project.name}</span>
                      <StatusTag label={project.status} status={project.status} />
                    </div>
                  }
                >
                  <div className="progress-body">
                    <p className="project-code">项目编号：{project.code}</p>
                    <p className="deadline">截止时间：{project.deadline} · 剩余 {project.leftDays} 天</p>
                    <Steps
                      size="small"
                      current={project.stepIndex}
                      items={['下载文件', '填写报价', '上传标书', '开标', '评标', '定标'].map((title) => ({ title }))}
                    />
                    {project.blockReason && (
                      <Alert
                        title={project.blockReason}
                        type="warning"
                        showIcon
                        closable={false}
                        style={{ marginTop: 12 }}
                      />
                    )}
                  </div>
                  <div className="progress-footer">
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {renderActionButtons(project)}
                    </div>
                    <Button type="link" onClick={() => viewDetail(project)}>查看详情</Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
          {scopedJoined.length === 0 && (
            <EmptyState description="您还没有参与任何项目" icon="Folder" />
          )}
        </>
      )
    }
  ]

  return (
    <div className="bidder-projects">
      <Card
        title={
          <div className="card-header">
            <span>项目中心</span>
            <Button type="primary" ghost icon={<QuestionCircleOutlined />} onClick={startTour}>
              投标引导
            </Button>
          </div>
        }
      >
        <div id="bidder-tabs">
          <Tabs
            type="card"
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
          />
        </div>
      </Card>

      <Modal
        title={`投标邀请书（${letterModal.invitation?.code || ''}）`}
        open={letterModal.open}
        width={640}
        onCancel={() => setLetterModal((prev) => ({ ...prev, open: false }))}
        footer={[
          <Button key="close" onClick={() => setLetterModal((prev) => ({ ...prev, open: false }))}>
            关闭
          </Button>,
          <Button
            key="download"
            type="primary"
            onClick={() =>
              downloadTextFile(
                `投标邀请书-${letterModal.invitation?.code || letterModal.project?.id}.txt`,
                letterModal.text
              )
            }
          >
            下载邀请书
          </Button>
        ]}
      >
        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>{letterModal.text}</pre>
      </Modal>

      <style>{`
        .bidder-projects {
          max-width: 1200px;
          margin: 0 auto;
        }
        .bidder-projects .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
        }
        .bidder-projects .project-progress-card {
          height: 100%;
        }
        .bidder-projects .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
        }
        .bidder-projects .progress-body {
          margin-bottom: 16px;
        }
        .bidder-projects .project-code,
        .bidder-projects .deadline {
          color: #666;
          font-size: 13px;
          margin: 4px 0;
        }
        .bidder-projects .progress-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
      `}</style>
    </div>
  )
}
