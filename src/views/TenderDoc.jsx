import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import {
  Alert,
  Row,
  Col,
  Card,
  Tree,
  Tag,
  Button,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Upload,
  Divider,
  Timeline,
  message,
  Modal,
  Select,
  Table,
  Steps,
  Empty
} from 'antd'
import {
  InboxOutlined,
  PlusOutlined,
  DeleteOutlined,
  ImportOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons'
import { useRole } from '../hooks/useRole.js'
import { tenderDocStore, getDefaultScoreItems } from '../data/tenderDocStore.js'
import { tenderDocTemplates, CLAUSE_AUTO_MATCH_NOTE } from '../data/tenderDocCatalog.js'
import { projectStore } from '../data/projects.js'
import { approvalStore } from '../data/approvalStore.js'
import { messageStore } from '../data/messageStore.js'

// 模拟项目结构化招标数据：项目基本信息 + 标段/包件结构化字段
const projectMetaMap = {
  '1': {
    id: '1',
    name: 'XX市轨道交通设备采购项目',
    code: 'ZB20260701001',
    purchaseMode: '公开招标',
    orgMode: 'agent',
    bidOpenTime: '2026-07-21 09:30',
    bidCloseTime: '2026-07-20 17:00',
    evalLocation: '线上评标大厅',
    budget: 850,
    evaluationMethod: '综合评分法',
    quoteFields: [
      { key: 'totalPrice', label: '投标总价', unit: '万元', required: true },
      { key: 'unitPrice', label: '单价', unit: '元', required: true },
      { key: 'deliveryDays', label: '交货期', unit: '天', required: true },
      { key: 'warrantyYears', label: '质保期', unit: '年', required: false }
    ],
    bidSummaryColumns: [
      { title: '序号', dataIndex: 'seq', width: 80 },
      { title: '标段', dataIndex: 'packageName', width: 200 },
      { title: '投标单位', dataIndex: 'bidder', minWidth: 200 },
      { title: '投标总价（万元）', dataIndex: 'totalPrice', width: 160 },
      { title: '交货期（天）', dataIndex: 'deliveryDays', width: 120 },
      { title: '备注', dataIndex: 'remark', minWidth: 160 }
    ],
    packages: [
      {
        code: 'B1',
        name: '第一标段：主设备',
        budget: 600,
        content: '主设备采购',
        delivery: '合同签订后 90 天内'
      },
      {
        code: 'B2',
        name: '第二标段：辅材',
        budget: 250,
        content: '辅助材料',
        delivery: '合同签订后 60 天内'
      }
    ]
  },
  '3': {
    id: '3',
    name: '软件开发服务项目',
    code: 'ZB20260703003',
    purchaseMode: '邀请招标',
    bidOpenTime: '2026-07-15 09:00',
    bidCloseTime: '2026-07-14 17:00',
    evalLocation: '线上评标大厅',
    budget: 120,
    evaluationMethod: '综合评分法',
    quoteFields: [
      { key: 'totalPrice', label: '投标总价', unit: '万元', required: true },
      { key: 'devCycle', label: '开发周期', unit: '月', required: true },
      { key: 'maintainYears', label: '运维期', unit: '年', required: true }
    ],
    bidSummaryColumns: [
      { title: '序号', dataIndex: 'seq', width: 80 },
      { title: '标段', dataIndex: 'packageName', width: 200 },
      { title: '投标单位', dataIndex: 'bidder', minWidth: 200 },
      { title: '投标总价（万元）', dataIndex: 'totalPrice', width: 160 },
      { title: '开发周期（月）', dataIndex: 'devCycle', width: 140 },
      { title: '备注', dataIndex: 'remark', minWidth: 160 }
    ],
    packages: [
      {
        code: 'B1',
        name: '软件开发服务',
        budget: 120,
        content: '定制化软件开发及一年运维',
        delivery: '合同签订后 6 个月内上线'
      }
    ]
  }
}

const defaultProjectMeta = {
  id: '',
  name: '未关联项目',
  code: '-',
  purchaseMode: '-',
  orgMode: 'self',
  bidOpenTime: '-',
  bidCloseTime: '-',
  evalLocation: '-',
  budget: 0,
  evaluationMethod: '-',
  quoteFields: [],
  bidSummaryColumns: [],
  packages: [],
  unregistered: false
}

// 演示项目名兜底（与 BidDownload 等项目名映射保持一致），
// 用于项目库（projectStore）中未登记、页面内置 meta 也没有的 projectId
const FALLBACK_PROJECT_NAMES = {
  '1': 'XX市轨道交通设备采购项目',
  '2': '办公桌椅采购项目',
  '3': '软件开发服务项目',
  '4': '物业服务采购项目',
  '5': '实验室设备采购项目'
}

const PURCHASE_MODE_LABELS = {
  open: '公开招标',
  invitation: '邀请招标',
  inquiry: '公开询比价',
  invitation_inquiry: '邀请询比价'
}

function fmtTime(v) {
  if (!v) return '-'
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString()
}

function deriveBidSummaryColumns(quoteFields) {
  return [
    { title: '序号', dataIndex: 'seq', width: 80 },
    { title: '标段', dataIndex: 'packageName', width: 200 },
    { title: '投标单位', dataIndex: 'bidder', minWidth: 200 },
    ...(quoteFields || []).map((f) => ({
      title: f.unit ? `${f.label}（${f.unit}）` : f.label,
      dataIndex: f.key
    })),
    { title: '备注', dataIndex: 'remark', minWidth: 160 }
  ]
}

// 将 projectStore 保存的项目映射为页面所需的 meta 形状
function mapStoredProject(p) {
  if (!p) return null
  const quoteFields = Array.isArray(p.quoteFields) ? p.quoteFields : []
  return {
    id: String(p.id),
    name: p.name || `项目 ${p.id}`,
    code: p.code || '-',
    purchaseMode: PURCHASE_MODE_LABELS[p.purchaseMode] || p.purchaseMode || '-',
    orgMode: p.orgMode === 'agent' ? 'agent' : 'self',
    bidOpenTime: fmtTime(p.openTime),
    bidCloseTime: fmtTime(p.deadline || p.packages?.[0]?.bidEnd),
    evalLocation: p.evalLocation || '线上评标大厅',
    budget: p.budget || 0,
    evaluationMethod: p.evaluationMethod || '综合评分法',
    quoteFields,
    packages: (p.packages || []).map((pkg, i) => ({
      code: pkg.code || `B${i + 1}`,
      name: pkg.name || `标段 ${i + 1}`,
      content: pkg.content || '-',
      budget: pkg.budget ?? 0,
      delivery: pkg.delivery || fmtTime(pkg.bidEnd)
    })),
    bidSummaryColumns: deriveBidSummaryColumns(quoteFields)
  }
}

// 项目 meta 解析优先级：projectStore（项目库）> 页面内置演示 meta > 名称兜底
function resolveProjectMeta(projectId) {
  if (!projectId) return null
  const key = String(projectId)
  const stored = mapStoredProject(projectStore.getProjectById(key))
  const builtin = projectMetaMap[key]
  if (!stored && !builtin) {
    return {
      ...defaultProjectMeta,
      id: key,
      name: FALLBACK_PROJECT_NAMES[key] || `项目 ${key}`,
      unregistered: true
    }
  }
  return { ...defaultProjectMeta, ...(builtin || {}), ...(stored || {}), unregistered: false }
}

// 版本业务状态（与 tenderDocStore 口径一致）：
// 编制中(editing/previewing) → 待确认(pendingConfirm) → 待审批(confirmed/pendingApproval，已接审批中心) → 已发布(published)
// archived 为新版本发布后自动归档的历史版本
const statusLabelMap = {
  editing: '编制中',
  previewing: '预览中',
  pendingConfirm: '待确认',
  confirmed: '已确认',
  pendingApproval: '待审批',
  published: '已发布',
  archived: '已归档'
}
const statusColorMap = {
  editing: 'default',
  previewing: 'processing',
  pendingConfirm: 'warning',
  confirmed: 'blue',
  pendingApproval: 'purple',
  published: 'success',
  archived: 'default'
}
// 主链路阶段：0 编制中 / 1 待确认 / 2 待审批 / 3 已发布
const statusStageMap = {
  editing: 0,
  previewing: 0,
  pendingConfirm: 1,
  confirmed: 2,
  pendingApproval: 2,
  published: 3,
  archived: 3
}
const STAGE_NAMES = ['编制中', '待确认', '待审批', '已发布']

const timelineColorMap = { primary: 'blue', info: 'gray', success: 'green', warning: 'orange', danger: 'red' }

// 编制向导步骤（T4）：项目信息确认 → 目录/章节 → 结构化字段 → 评分项 → 发布确认
const WIZARD_STEPS = ['项目信息确认', '目录/章节', '结构化字段', '评分项', '发布确认']

function findNode(nodes, key) {
  for (const node of nodes) {
    if (node.key === key) return node
    if (node.children) {
      const found = findNode(node.children, key)
      if (found) return found
    }
  }
  return null
}

function updateNodeContent(nodes, key, title, content) {
  return nodes.map((node) => {
    if (node.key === key) {
      return { ...node, title, content }
    }
    if (node.children) {
      return { ...node, children: updateNodeContent(node.children, key, title, content) }
    }
    return node
  })
}

function flattenNodes(nodes) {
  return nodes.flatMap((n) => (n.children ? [n, ...flattenNodes(n.children)] : [n]))
}

export default function TenderDoc() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false })
  const projectId = searchParams.projectId != null ? String(searchParams.projectId) : ''
  const { role, userName } = useRole()

  // T2：招标文件必须关联项目。项目选项 = 内置演示项目 + 项目库（projectStore）项目
  const projectOptions = useMemo(() => {
    const map = new Map()
    Object.entries(FALLBACK_PROJECT_NAMES).forEach(([id, name]) => {
      map.set(id, { value: id, label: name })
    })
    projectStore.getProjects().forEach((p) => {
      map.set(String(p.id), { value: String(p.id), label: p.name || `项目 ${p.id}` })
    })
    return [...map.values()]
  }, [])

  const projectMeta = useMemo(() => resolveProjectMeta(projectId), [projectId])

  // 编制权限按「角色 + 项目组织方式」双维度控制（cal-001）：
  // - 自行招标(self)：招标人/代理均可编制
  // - 委托代理(agent)：仅代理可编制，招标人只读 + 确认
  const orgMode = projectMeta?.orgMode || 'self'
  const tendereeRestricted = !!projectMeta && role === 'tenderee' && orgMode === 'agent'
  const canEdit = tendereeRestricted
    ? false
    : role === 'tenderee' || role === 'agent'
  const creatorName = role === 'tenderee' ? '张三' : '李四'

  // 审批链（2026-07-17 口径，清单 22）：代理发布 → 采购管理部；招标人发布 → 需求部门 → 采购管理部
  // 与 approvalStore.resolveChain 口径一致；「确认并提交审批」会生成真实审批单，由审批中心流转
  const publisherKind = role === 'tenderee' ? 'self' : 'agent'
  const approvalChain = publisherKind === 'self' ? ['需求部门', '采购管理部'] : ['采购管理部']

  const [versions, setVersions] = useState(() =>
    projectId ? tenderDocStore.getProjectVersions(projectId) : []
  )
  const [selectedVersionId, setSelectedVersionId] = useState(() => {
    if (!projectId) return null
    const list = tenderDocStore.getProjectVersions(projectId)
    return list[list.length - 1]?.id
  })
  const [activeStep, setActiveStep] = useState(0)
  const [selectedKeys, setSelectedKeys] = useState(['招标公告'])
  const [currentNode, setCurrentNode] = useState({ label: '招标公告', content: '' })
  const [newNodeName, setNewNodeName] = useState('')
  const [importVisible, setImportVisible] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  // 同步在途审批单结果（清单 49/50）：通过 → publishVersion 自动发布；驳回 → 回退编制中并记录原因
  const syncApprovalResults = (pid) => {
    const list = tenderDocStore.getProjectVersions(pid)
    list.forEach((v) => {
      if (v.status !== 'pendingApproval') return
      const approval =
        (v.approvalId && approvalStore.get(v.approvalId)) ||
        approvalStore.list({ type: 'tender-doc' }).find((a) => a.refId === v.id)
      if (!approval || approval.status === 'pending') return
      const now = new Date().toLocaleString()
      if (approval.status === 'approved') {
        tenderDocStore.publishVersion(pid, v.id, {
          updatedAt: now,
          history: [
            { id: Date.now(), content: `审批通过（审批单 ${approval.id}），招标文件 ${v.versionNo} 发布生效`, time: now, type: 'success' },
            ...(v.history || [])
          ]
        })
      } else if (approval.status === 'rejected') {
        const reason = approval.records?.slice(-1)[0]?.comment || '未填写原因'
        tenderDocStore.updateVersion(pid, v.id, {
          status: 'editing',
          updatedAt: now,
          history: [
            { id: Date.now(), content: `审批驳回（审批单 ${approval.id}）：${reason}，版本 ${v.versionNo} 退回经办人重新编制`, time: now, type: 'danger' },
            ...(v.history || [])
          ]
        })
      }
    })
  }

  // 项目切换：先同步在途审批结果，再重读该项目版本链并重置向导
  useEffect(() => {
    if (!projectId) {
      setVersions([])
      setSelectedVersionId(null)
      return
    }
    syncApprovalResults(projectId)
    const list = tenderDocStore.getProjectVersions(projectId)
    setVersions(list)
    setSelectedVersionId(list[list.length - 1]?.id)
    setActiveStep(0)
    setSelectedKeys(['招标公告'])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  const selectedVersion = useMemo(
    () => versions.find((v) => v.id === selectedVersionId) || versions[versions.length - 1],
    [versions, selectedVersionId]
  )
  const latestVersion = useMemo(() => versions[versions.length - 1], [versions])
  const isHistoryVersion = selectedVersion?.id !== latestVersion?.id
  const currentPublished = useMemo(
    () => versions.filter((v) => v.status === 'published').slice(-1)[0] || null,
    [versions]
  )

  const editable = useMemo(
    () =>
      canEdit &&
      selectedVersion?.id === latestVersion?.id &&
      ['editing', 'previewing'].includes(selectedVersion?.status),
    [canEdit, selectedVersion, latestVersion]
  )

  // 确认权限：待确认版本由招标人确认；自行招标下代理也可代确认（沿用 canEdit 双维度口径）
  const canConfirm =
    !!selectedVersion &&
    selectedVersion.status === 'pendingConfirm' &&
    !isHistoryVersion &&
    (role === 'tenderee' || orgMode === 'self')

  useEffect(() => {
    const node = findNode(selectedVersion?.catalog || [], selectedKeys[0]) || findNode(selectedVersion?.catalog || [], '招标公告')
    if (node) {
      setSelectedKeys([node.key])
      setCurrentNode({
        label: node.title,
        content: node.content || `${node.title} 内容待编辑...`
      })
    }
  }, [selectedVersion, selectedKeys[0]])

  const setSelectedVersionAndSync = (id) => {
    setSelectedVersionId(id)
    const version = versions.find((v) => v.id === id)
    if (version) {
      const node = findNode(version.catalog, '招标公告')
      if (node) {
        setSelectedKeys([node.key])
        setCurrentNode({ label: node.title, content: node.content || `${node.title} 内容待编辑...` })
      }
    }
  }

  const refreshVersions = () => {
    if (!projectId) return
    const next = tenderDocStore.getProjectVersions(projectId)
    setVersions(next)
  }

  const updateSelectedVersion = (patch) => {
    if (!projectId || !selectedVersion) return null
    const next = tenderDocStore.updateVersion(projectId, selectedVersion.id, patch)
    if (next) refreshVersions()
    return next
  }

  // 评标办法评分项配置（名称 + 权重），存于招标文件版本，发布后驱动 ExpertProject 评分页
  const scoreItems = selectedVersion?.scoreItems?.length
    ? selectedVersion.scoreItems
    : getDefaultScoreItems()
  const scoreWeightTotal = scoreItems.reduce((sum, item) => sum + (Number(item.weight) || 0), 0)
  const updateScoreItem = (index, patch) => {
    const next = scoreItems.map((item, i) => (i === index ? { ...item, ...patch } : item))
    updateSelectedVersion({ scoreItems: next })
  }
  const addScoreItem = () => {
    const next = [...scoreItems, { id: `item-${Date.now()}`, name: '新评分项', weight: 0 }]
    updateSelectedVersion({ scoreItems: next })
  }
  const removeScoreItem = (index) => {
    const next = scoreItems.filter((_, i) => i !== index)
    updateSelectedVersion({ scoreItems: next })
  }

  const pushHistory = (content, type = 'info') => {
    const now = new Date().toLocaleString()
    const nextHistory = [
      { id: Date.now(), content, time: now, type },
      ...(selectedVersion.history || [])
    ]
    updateSelectedVersion({ history: nextHistory, updatedAt: now })
  }

  // 发布前检查（wizard 第 5 步汇总展示）：项目已关联、章节内容完整、附件非空、评分权重合计 100
  const catalogNodes = useMemo(
    () => flattenNodes(selectedVersion?.catalog || []),
    [selectedVersion]
  )
  const projectLinked = !!projectId && !!projectMeta
  const contentReady = catalogNodes.some((n) => (n.content || '').trim().length > 50)
  const attachmentsReady = (selectedVersion?.fileList?.length || 0) > 0
  const scoreReady = scoreWeightTotal === 100
  const publishChecks = [
    { key: 'project', label: `已关联招标项目（${projectMeta?.name || '-'}）`, pass: projectLinked },
    { key: 'content', label: '至少一个章节正文超过 50 字', pass: contentReady },
    { key: 'attach', label: '附件清单至少 1 个文件', pass: attachmentsReady },
    { key: 'score', label: `评分项权重合计等于 100（当前 ${scoreWeightTotal}）`, pass: scoreReady }
  ]

  const handleProjectChange = (value) => {
    navigate({ to: '/admin/tender-doc', search: { projectId: String(value) } })
  }

  const selectNode = (keys, info) => {
    const key = keys[0] || info.node.key
    setSelectedKeys([key])
    const node = findNode(selectedVersion.catalog, key)
    if (node) {
      setCurrentNode({
        label: node.title,
        content: node.content || `${node.title} 内容待编辑...`
      })
    }
  }

  const addNode = () => {
    if (!newNodeName.trim()) {
      message.warning('请输入目录名称')
      return
    }
    const key = `${newNodeName}-${Date.now()}`
    const newCatalog = [...(selectedVersion.catalog || []), { key, title: newNodeName, content: '', autoMatchedFile: null }]
    updateSelectedVersion({ catalog: newCatalog })
    setNewNodeName('')
    pushHistory(`新增目录节点“${newNodeName}”`, 'info')
    message.success('目录节点已添加')
  }

  const deleteNode = () => {
    const key = selectedKeys[0]
    if (!key) return
    Modal.confirm({
      title: '删除确认',
      content: `确定删除目录节点“${key}”吗？`,
      okText: '删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        const remove = (nodes) => nodes.filter((n) => n.key !== key).map((n) => ({
          ...n,
          children: n.children ? remove(n.children) : undefined
        }))
        const newCatalog = remove(selectedVersion.catalog)
        updateSelectedVersion({ catalog: newCatalog })
        setSelectedKeys(['招标公告'])
        setCurrentNode({ label: '招标公告', content: '招标公告内容...' })
        pushHistory(`删除目录节点“${key}”`, 'warning')
        message.success('目录节点已删除')
      }
    })
  }

  const onDrop = (info) => {
    const dropKey = info.node.key
    const dragKey = info.dragNode.key
    const dropPos = info.node.pos.split('-')
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1])

    const loop = (data, key, callback) => {
      data.forEach((item, index, arr) => {
        if (item.key === key) {
          callback(item, index, arr)
          return
        }
        if (item.children) {
          loop(item.children, key, callback)
        }
      })
    }

    const data = JSON.parse(JSON.stringify(selectedVersion.catalog))
    let dragObj
    loop(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1)
      dragObj = item
    })

    if (!info.dropToGap) {
      loop(data, dropKey, (item) => {
        item.children = item.children || []
        item.children.unshift(dragObj)
      })
    } else if ((info.node.children || []).length > 0 && info.node.expanded && dropPosition === 1) {
      loop(data, dropKey, (item) => {
        item.children = item.children || []
        item.children.unshift(dragObj)
      })
    } else {
      let ar
      let i
      loop(data, dropKey, (item, index, arr) => {
        ar = arr
        i = index
      })
      if (dropPosition === -1) {
        ar.splice(i, 0, dragObj)
      } else {
        ar.splice(i + 1, 0, dragObj)
      }
    }
    updateSelectedVersion({ catalog: data })
    pushHistory(`调整目录节点“${dragKey}”顺序`, 'info')
  }

  // 保存当前章节正文（向导第 2 步「目录/章节」的暂存）
  const saveChapter = () => {
    const now = new Date().toLocaleString()
    const newCatalog = updateNodeContent(selectedVersion.catalog, selectedKeys[0], currentNode.label, currentNode.content)
    updateSelectedVersion({ catalog: newCatalog, updatedAt: now })
    pushHistory(`${creatorName} 编辑了“${currentNode.label}”章节`, 'info')
    message.success('当前章节已暂存')
  }

  // 每步可暂存：第 2 步落盘章节正文，其余步骤记录暂存痕迹（评分项/附件修改本身即写入版本）
  const saveDraft = () => {
    if (!selectedVersion) return
    if (!editable) {
      message.info('当前状态为只读，无需暂存')
      return
    }
    if (activeStep === 1) {
      saveChapter()
      return
    }
    pushHistory(`${creatorName} 暂存了「${WIZARD_STEPS[activeStep]}」步骤`, 'info')
    message.success('已暂存当前步骤')
  }

  const previewDoc = () => {
    updateSelectedVersion({ status: 'previewing' })
    message.success('当前版本已进入预览状态')
  }

  const submitConfirm = () => {
    updateSelectedVersion({ status: 'pendingConfirm' })
    pushHistory(`${creatorName} 提交版本 ${selectedVersion.versionNo} 待确认`, 'warning')
    message.success('已提交确认')
  }

  // 招标人确认并提交审批（待确认 → 待审批）：生成真实审批单，由审批中心流转（清单 22/48）
  const confirmAndSubmitApproval = () => {
    const now = new Date().toLocaleString()
    const chainDesc = `${publisherKind === 'agent' ? '代理发布' : '招标人发布'} → ${approvalChain.join(' → ')}`
    const instance = approvalStore.create({
      type: 'tender-doc',
      refId: selectedVersion.id,
      title: `${projectMeta?.name || '招标文件'} ${selectedVersion.versionNo} 发布`,
      publisherKind,
      submittedBy: userName || creatorName,
      projectId
    })
    updateSelectedVersion({
      status: 'pendingApproval',
      confirmer: userName || '张三',
      approvalId: instance.id,
      updatedAt: now
    })
    messageStore.add({
      toRole: instance.chain[0],
      title: `【审批待办】招标文件 ${selectedVersion.versionNo} 发布`,
      content: `${userName || creatorName} 提交了「${projectMeta?.name || projectId}」招标文件 ${selectedVersion.versionNo} 发布申请（${chainDesc}），请及时审批。`,
      type: 'approval'
    })
    pushHistory(`${userName || '张三'} 确认版本 ${selectedVersion.versionNo} 并提交审批（${chainDesc}，审批单 ${instance.id}）`, 'success')
    message.success('已确认并提交审批，请在审批中心跟踪进度；通过后自动发布')
  }

  // 待确认退回：版本回到编制中
  const returnToEditing = () => {
    updateSelectedVersion({ status: 'editing' })
    pushHistory(`${userName || '张三'} 退回版本 ${selectedVersion.versionNo}，返回编制中`, 'warning')
    message.success('已退回编制')
  }

  const createNewVersion = () => {
    const next = tenderDocStore.addVersion(projectId, selectedVersion, creatorName)
    refreshVersions()
    setSelectedVersionId(next.id)
    setActiveStep(1)
    message.success(`已创建新版本 ${next.versionNo}，进入编制`)
  }

  const importTemplate = () => {
    if (!selectedTemplate) {
      message.warning('请选择要导入的模板')
      return
    }
    const tpl = tenderDocTemplates.find((t) => t.name === selectedTemplate)
    if (tpl) {
      updateSelectedVersion({ catalog: JSON.parse(JSON.stringify(tpl.catalog)) })
      setSelectedKeys(['招标公告'])
      setCurrentNode({ label: '招标公告', content: '招标公告内容...' })
      pushHistory(`一键导入模板“${tpl.name}”`, 'success')
      message.success(`已导入模板：${tpl.name}`)
    }
    setImportVisible(false)
    setSelectedTemplate(null)
  }

  const packageColumns = [
    { title: '标段编号', dataIndex: 'code', width: 100 },
    { title: '标段名称', dataIndex: 'name', minWidth: 200 },
    { title: '采购内容', dataIndex: 'content', minWidth: 160 },
    { title: '预算（万元）', dataIndex: 'budget', width: 120, render: (v) => `${v} 万元` },
    { title: '交货/服务期', dataIndex: 'delivery', minWidth: 180 }
  ]

  // 流转操作（按角色 + 状态控制），集中在「发布确认」步骤
  const renderFlowActions = () => {
    if (!selectedVersion) return null
    const status = selectedVersion.status
    const actions = []
    if (editable && ['editing', 'previewing'].includes(status)) {
      actions.push(<Button key="preview" onClick={previewDoc}>预览</Button>)
      actions.push(<Button key="submit-confirm" type="primary" ghost onClick={submitConfirm}>提交确认</Button>)
    }
    if (status === 'pendingConfirm' && !isHistoryVersion && canConfirm) {
      actions.push(<Button key="return" onClick={returnToEditing}>退回编制</Button>)
      actions.push(<Button key="confirm" type="primary" onClick={confirmAndSubmitApproval}>确认并提交审批</Button>)
    }
    if (status === 'pendingConfirm' && !isHistoryVersion && !canConfirm) {
      actions.push(<span key="hint" className="flow-hint">待招标人确认（当前角色无确认权限）</span>)
    }
    if (['confirmed', 'pendingApproval'].includes(status) && !isHistoryVersion) {
      actions.push(
        <span key="approving" className="flow-hint">
          审批中（{approvalChain.join(' → ')}），请在「审批中心」处理；通过后自动发布，驳回后退回经办人重新编制。
        </span>
      )
    }
    if (status === 'published' && !isHistoryVersion && canEdit) {
      actions.push(<Button key="new-version" type="primary" onClick={createNewVersion}>创建新版本</Button>)
    }
    if (actions.length === 0) return <span className="flow-hint">当前状态下无可执行操作</span>
    return actions
  }

  const headerCard = (
    <Card className="tender-header-card" size="small" style={{ marginBottom: 16 }}>
      <div className="tender-header-bar">
        <div className="header-group">
          <span className="header-label">关联项目</span>
          <Select
            showSearch
            optionFilterProp="label"
            style={{ width: 300 }}
            placeholder="请选择招标项目（必选）"
            value={projectId || undefined}
            onChange={handleProjectChange}
            options={projectOptions}
          />
          {projectMeta && <Tag color="blue">{projectMeta.name}</Tag>}
          {projectMeta && <Tag>{orgMode === 'agent' ? '委托代理' : '自行招标'}</Tag>}
        </div>
        {projectMeta && selectedVersion && (
          <div className="header-group">
            <Tag color={statusColorMap[selectedVersion.status]}>{statusLabelMap[selectedVersion.status]}</Tag>
            <span className="version-tag">版本 {selectedVersion.versionNo}</span>
            {currentPublished && currentPublished.id !== selectedVersion.id && (
              <Tag color="success">生效版本 {currentPublished.versionNo}</Tag>
            )}
            <Select
              size="small"
              style={{ width: 180 }}
              value={selectedVersion.id}
              onChange={setSelectedVersionAndSync}
              options={versions.map((v) => ({
                label: `${v.versionNo} · ${statusLabelMap[v.status]}`,
                value: v.id
              }))}
            />
          </div>
        )}
      </div>
    </Card>
  )

  const styleTag = (
    <style>{`
      .tender-doc {
        min-height: calc(100vh - 120px);
      }
      .tender-header-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
      }
      .header-group {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .header-label {
        font-weight: bold;
      }
      .doc-layout {
        height: 100%;
      }
      .catalog-card {
        height: 100%;
      }
      .card-header {
        font-weight: bold;
      }
      .editor-card {
        min-height: 100%;
      }
      .header-left {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }
      .version-tag {
        font-size: 12px;
        color: #909399;
        font-weight: normal;
      }
      .doc-form {
        margin-bottom: 16px;
      }
      .editor-toolbar {
        display: flex;
        gap: 8px;
        margin-bottom: 12px;
        padding-bottom: 12px;
        border-bottom: 1px solid #eee;
      }
      .doc-editor textarea {
        font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
        font-size: 14px;
        line-height: 1.8;
      }
      .attach-section h4 {
        margin-bottom: 12px;
      }
      .history-section h4 {
        margin-bottom: 12px;
      }
      .quote-fields {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .wizard-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .wizard-footer-right {
        display: flex;
        gap: 8px;
      }
      .publish-checks {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 16px;
      }
      .publish-check-item {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .flow-actions {
        display: flex;
        gap: 8px;
        align-items: center;
        margin: 16px 0;
        flex-wrap: wrap;
      }
      .flow-hint {
        color: #909399;
        font-size: 13px;
      }
    `}</style>
  )

  // T2：未选择项目时不进入编制，提示先关联项目
  if (!projectId) {
    return (
      <div className="tender-doc" style={{ maxWidth: 1100, margin: '0 auto', paddingTop: 40 }}>
        <Result
          status="warning"
          title="需从项目进入"
          subTitle="招标文件属于项目阶段操作，请先从「项目管理」选择一个项目。"
          extra={
            <Button type="primary" onClick={() => navigate({ to: '/admin/projects' })}>
              返回项目列表
            </Button>
          }
        />
        {styleTag}
      </div>
    )
  }

  return (
    <div className="tender-doc">
      {headerCard}

      {projectMeta?.unregistered && (
        <Alert
          title="当前项目未在项目库中登记，按默认信息展示；建议先在项目管理中创建/完善项目。"
          type="warning"
          showIcon
          closable={false}
          style={{ marginBottom: 16 }}
        />
      )}
      {selectedVersion?.status === 'published' && !isHistoryVersion && (
        <Alert
          title="当前招标文件已发布，如需修改请先创建新版本。"
          type="warning"
          showIcon
          closable={false}
          style={{ marginBottom: 16 }}
        />
      )}
      {selectedVersion?.status === 'archived' && (
        <Alert
          title={`版本 ${selectedVersion.versionNo} 已归档为历史版本，仅供查看。`}
          type="info"
          showIcon
          closable={false}
          style={{ marginBottom: 16 }}
        />
      )}
      {isHistoryVersion && latestVersion && (
        <Alert
          title={`当前查看的是历史版本 ${selectedVersion.versionNo}（${statusLabelMap[selectedVersion.status]}），最新版本为 ${latestVersion.versionNo}（${statusLabelMap[latestVersion.status]}）${currentPublished ? `，当前生效版本 ${currentPublished.versionNo}` : ''}。`}
          type="info"
          showIcon
          closable={false}
          style={{ marginBottom: 16 }}
        />
      )}
      {tendereeRestricted && (
        <Alert
          title="本项目为委托代理招标，招标文件由招标代理机构编制，招标人仅有查看和确认权限。"
          type="info"
          showIcon
          closable={false}
          style={{ marginBottom: 16 }}
        />
      )}
      {selectedVersion?.status === 'pendingApproval' && !isHistoryVersion && (
        <Alert
          title={`版本 ${selectedVersion.versionNo} 已提交审批（${publisherKind === 'agent' ? '代理发布' : '招标人发布'} → ${approvalChain.join(' → ')}），请前往「审批中心」处理。审批通过后自动发布，驳回后退回经办人重新编制。`}
          type="info"
          showIcon
          closable={false}
          style={{ marginBottom: 16 }}
        />
      )}

      <Card className="wizard-card">
        <Steps
          current={activeStep}
          onChange={setActiveStep}
          items={WIZARD_STEPS.map((title) => ({ title }))}
          style={{ marginBottom: 24 }}
        />

        {/* 第 1 步：项目信息确认 */}
        {activeStep === 0 && projectMeta && (
          <>
            <Alert
              title={`招标文件已关联项目「${projectMeta.name}」（编号：${projectMeta.code}）。请确认项目基本信息与标段设置无误；如需切换项目，请使用页面顶部的项目选择器。`}
              type="info"
              showIcon
              closable={false}
              style={{ marginBottom: 16 }}
            />
            <Descriptions column={3} bordered size="small">
              <Descriptions.Item label="项目名称">{projectMeta.name}</Descriptions.Item>
              <Descriptions.Item label="项目编号">{projectMeta.code}</Descriptions.Item>
              <Descriptions.Item label="采购方式">{projectMeta.purchaseMode}</Descriptions.Item>
              <Descriptions.Item label="组织方式">{orgMode === 'agent' ? '委托代理' : '自行招标'}</Descriptions.Item>
              <Descriptions.Item label="项目预算">{projectMeta.budget ? `${projectMeta.budget} 万元` : '-'}</Descriptions.Item>
              <Descriptions.Item label="开标时间">{projectMeta.bidOpenTime}</Descriptions.Item>
              <Descriptions.Item label="投标截止">{projectMeta.bidCloseTime}</Descriptions.Item>
              <Descriptions.Item label="评标地点">{projectMeta.evalLocation}</Descriptions.Item>
              <Descriptions.Item label="评标方法">{projectMeta.evaluationMethod}</Descriptions.Item>
            </Descriptions>

            <Divider titlePlacement="left" style={{ marginTop: 16 }}>标段/包件信息</Divider>
            <Table
              rowKey="code"
              dataSource={projectMeta.packages}
              columns={packageColumns}
              pagination={false}
              size="small"
              bordered
              scroll={{ x: 'max-content' }}
            />
          </>
        )}

        {/* 第 2 步：目录/章节 */}
        {activeStep === 1 && (
          <Row gutter={20} className="doc-layout">
            <Col span={5}>
              <Card
                className="catalog-card"
                title={
                  <div className="card-header"><span>招标文件目录</span></div>
                }
                extra={
                  editable && (
                    <Button size="small" icon={<ImportOutlined />} onClick={() => setImportVisible(true)}>导入模板</Button>
                  )
                }
              >
                {editable && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <Input
                      size="small"
                      placeholder="新目录名称"
                      value={newNodeName}
                      onChange={(e) => setNewNodeName(e.target.value)}
                      onPressEnter={addNode}
                    />
                    <Button size="small" icon={<PlusOutlined />} onClick={addNode} />
                    <Button size="small" danger icon={<DeleteOutlined />} onClick={deleteNode} disabled={!selectedKeys[0]} />
                  </div>
                )}
                <Tree
                  treeData={selectedVersion?.catalog || []}
                  defaultExpandAll
                  selectedKeys={selectedKeys}
                  draggable={editable}
                  onSelect={selectNode}
                  onDrop={onDrop}
                />
              </Card>
            </Col>
            <Col span={19}>
              <Card
                className="editor-card"
                title={
                  <div className="header-left">
                    <span>{currentNode.label}</span>
                  </div>
                }
                extra={
                  editable && (
                    <Button onClick={saveChapter}>保存章节</Button>
                  )
                }
              >
                <Alert
                  title={`条款关联：${CLAUSE_AUTO_MATCH_NOTE}（清单 36，条款节点已预留 autoMatchedFile 字段）；未完成关联允许提交投标文件，现有手工挂接逻辑不受影响。`}
                  type="info"
                  showIcon
                  closable={false}
                  style={{ marginBottom: 12 }}
                />
                <Form layout="horizontal" labelCol={{ flex: '100px' }} className="doc-form">
                  <Form.Item label="章节标题">
                    <Input
                      value={currentNode.label}
                      onChange={(e) => setCurrentNode((prev) => ({ ...prev, label: e.target.value }))}
                      disabled={!editable}
                    />
                  </Form.Item>
                </Form>

                <div className="editor-toolbar">
                  <Button size="small" disabled={!editable}>加粗</Button>
                  <Button size="small" disabled={!editable}>标题</Button>
                  <Button size="small" disabled={!editable}>插入表格</Button>
                  <Button size="small" disabled={!editable}>插入评分项</Button>
                  <Button size="small" disabled={!editable}>插入签章位置</Button>
                </div>

                <Input.TextArea
                  rows={18}
                  placeholder="在此编辑招标文件内容..."
                  className="doc-editor"
                  value={currentNode.content}
                  onChange={(e) => setCurrentNode((prev) => ({ ...prev, content: e.target.value }))}
                  disabled={!editable}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* 第 3 步：结构化字段（来源于项目创建数据，只读）+ 附件清单 */}
        {activeStep === 2 && projectMeta && (
          <>
            <Card size="small" title="项目结构化字段（来源于项目创建数据，只读；如需调整请回到项目管理）" style={{ marginBottom: 16 }}>
              <Divider titlePlacement="left" style={{ marginTop: 0 }}>报价字段配置</Divider>
              <div className="quote-fields">
                {projectMeta.quoteFields.map((field) => (
                  <Tag key={field.key} color={field.required ? 'blue' : 'default'}>
                    {field.label} ({field.unit}) {field.required ? '*' : ''}
                  </Tag>
                ))}
                {projectMeta.quoteFields.length === 0 && <span>-</span>}
              </div>

              <Divider titlePlacement="left">开标一览表模板</Divider>
              <Table
                rowKey="title"
                dataSource={projectMeta.bidSummaryColumns}
                columns={[
                  { title: '列名', dataIndex: 'title' },
                  { title: '字段键', dataIndex: 'dataIndex' },
                  { title: '宽度', dataIndex: 'width', render: (v) => v || '自适应' }
                ]}
                pagination={false}
                size="small"
                bordered
              />
            </Card>

            <Card size="small" title="附件清单" className="attach-section">
              <Upload.Dragger
                fileList={selectedVersion?.fileList || []}
                onChange={({ fileList }) => updateSelectedVersion({ fileList })}
                beforeUpload={() => false}
                disabled={!editable}
                multiple
                style={{ width: '100%' }}
              >
                <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                <p className="ant-upload-text">拖拽文件到此处或 <em>点击上传</em>（图纸、技术参数表等招标文件附件）</p>
              </Upload.Dragger>
            </Card>
          </>
        )}

        {/* 第 4 步：评分项 */}
        {activeStep === 3 && (
          <Card size="small" title="评标办法与评分项配置">
            <Alert
              title="评分项随招标文件版本发布，发布后驱动专家评审页评分表；权重合计需为 100。"
              type="info"
              showIcon
              closable={false}
              style={{ marginBottom: 12 }}
            />
            <Table
              rowKey="id"
              dataSource={scoreItems}
              pagination={false}
              size="small"
              bordered
              columns={[
                {
                  title: '评分项名称',
                  dataIndex: 'name',
                  render: (value, _, index) => (
                    <Input
                      size="small"
                      value={value}
                      disabled={!editable}
                      onChange={(e) => updateScoreItem(index, { name: e.target.value })}
                    />
                  )
                },
                {
                  title: '权重（满分）',
                  dataIndex: 'weight',
                  width: 160,
                  render: (value, _, index) => (
                    <InputNumber
                      size="small"
                      min={0}
                      max={100}
                      value={value}
                      disabled={!editable}
                      onChange={(v) => updateScoreItem(index, { weight: Number(v) || 0 })}
                      style={{ width: '100%' }}
                    />
                  )
                },
                {
                  title: '操作',
                  width: 80,
                  render: (_, __, index) => (
                    <Button
                      type="link"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      disabled={!editable || scoreItems.length <= 1}
                      onClick={() => removeScoreItem(index)}
                    />
                  )
                }
              ]}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <Button size="small" type="dashed" icon={<PlusOutlined />} disabled={!editable} onClick={addScoreItem}>
                添加评分项
              </Button>
              <Tag color={scoreWeightTotal === 100 ? 'success' : 'warning'}>
                权重合计：{scoreWeightTotal}{scoreWeightTotal === 100 ? '' : '（建议合计 100）'}
              </Tag>
            </div>
          </Card>
        )}

        {/* 第 5 步：发布确认（汇总 + 发布前检查 + 状态流转 + 修改记录） */}
        {activeStep === 4 && selectedVersion && (
          <>
            <Steps
              size="small"
              current={statusStageMap[selectedVersion.status] ?? 0}
              items={STAGE_NAMES.map((title) => ({ title }))}
              style={{ marginBottom: 16 }}
            />
            <Descriptions column={3} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="关联项目">{projectMeta?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="版本号">{selectedVersion.versionNo}</Descriptions.Item>
              <Descriptions.Item label="当前状态">
                <Tag color={statusColorMap[selectedVersion.status]}>{statusLabelMap[selectedVersion.status]}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="编制人">{selectedVersion.creator || creatorName}</Descriptions.Item>
              <Descriptions.Item label="确认人">{selectedVersion.confirmer || '-'}</Descriptions.Item>
              <Descriptions.Item label="最近更新">{selectedVersion.updatedAt || '-'}</Descriptions.Item>
              <Descriptions.Item label="发布时间">{selectedVersion.publishedAt || '-'}</Descriptions.Item>
              <Descriptions.Item label="审批链" span={2}>
                {publisherKind === 'agent' ? '代理发布' : '招标人发布'} → {approvalChain.join(' → ')}
              </Descriptions.Item>
            </Descriptions>

            <Divider titlePlacement="left" style={{ marginTop: 0 }}>发布前检查</Divider>
            <div className="publish-checks">
              {publishChecks.map((c) => (
                <div key={c.key} className="publish-check-item">
                  {c.pass
                    ? <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    : <CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                  <span>{c.label}</span>
                </div>
              ))}
            </div>

            <Alert
              title="按 2026-07-17 需求口径，招标文件需审批后发布（清单 22/48）：确认后生成审批单，由审批中心流转；通过后自动发布生效，驳回退回经办人重新编制。"
              type="info"
              showIcon
              closable={false}
              style={{ marginBottom: 8 }}
            />

            <div className="flow-actions">{renderFlowActions()}</div>

            <Divider />

            <div className="history-section">
              <h4>修改记录</h4>
              <Timeline
                items={(selectedVersion.history || []).map((item) => ({
                  key: item.id,
                  color: timelineColorMap[item.type],
                  content: (
                    <>
                      <div>{item.content}</div>
                      <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>{item.time}</div>
                    </>
                  )
                }))}
              />
            </div>
          </>
        )}

        <Divider style={{ margin: '16px 0' }} />
        <div className="wizard-footer">
          <Button disabled={activeStep === 0} onClick={() => setActiveStep((s) => Math.max(0, s - 1))}>
            上一步
          </Button>
          <div className="wizard-footer-right">
            <Button onClick={saveDraft} disabled={!editable}>暂存</Button>
            {activeStep < WIZARD_STEPS.length - 1 && (
              <Button type="primary" onClick={() => setActiveStep((s) => Math.min(WIZARD_STEPS.length - 1, s + 1))}>
                下一步
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Modal
        title="一键导入招标文件模板"
        open={importVisible}
        onOk={importTemplate}
        onCancel={() => { setImportVisible(false); setSelectedTemplate(null) }}
        okText="导入"
        cancelText="取消"
      >
        <p>选择模板后将覆盖当前目录和默认内容，您可在此基础上修改。</p>
        <Select
          placeholder="请选择模板"
          style={{ width: '100%' }}
          value={selectedTemplate}
          onChange={setSelectedTemplate}
          options={tenderDocTemplates.map((t) => ({ label: t.name, value: t.name }))}
        />
      </Modal>

      {styleTag}
    </div>
  )
}
